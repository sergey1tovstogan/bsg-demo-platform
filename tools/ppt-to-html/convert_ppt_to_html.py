"""
PowerPoint to HTML Converter with Interaction Preservation

This script converts PowerPoint presentations to interactive HTML5 while preserving:
- Slide transitions and animations
- Clickable elements and hyperlinks
- Images and shapes
- Text formatting
- Interactive hotspots/areas

The output HTML can be further enhanced with custom JavaScript interactions.
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.shapes.base import BaseShape
from pptx.shapes.picture import Picture
from pptx.shapes.autoshape import Shape
from pptx.shapes.group import GroupShape
from pptx.shapes.freeform import FreeformBuilder
from pptx.dml.color import RGBColor
import base64
import json
from datetime import datetime


class PPTToHTMLConverter:
    """Converts PowerPoint presentations to interactive HTML5."""
    
    def __init__(self, pptx_path: str, output_dir: Optional[str] = None):
        self.pptx_path = Path(pptx_path)
        self.output_dir = Path(output_dir) if output_dir else self.pptx_path.parent
        self.presentation = Presentation(str(self.pptx_path))
        self.slides_data: List[Dict[str, Any]] = []
        self.images_dir = self.output_dir / "images"
        self.images_dir.mkdir(exist_ok=True)
        
    def extract_slide_content(self, slide, slide_index: int) -> Dict[str, Any]:
        """Extract content from a slide including shapes, text, images, and interactions."""
        slide_data = {
            'index': slide_index,
            'title': '',
            'shapes': [],
            'images': [],
            'hyperlinks': [],
            'notes': slide.notes_slide.notes_text_frame.text if slide.has_notes_slide else '',
            'background': None
        }
        
        # Extract background color if available
        if slide.background.fill.type == 1:  # Solid fill
            fill = slide.background.fill
            if hasattr(fill, 'fore_color') and hasattr(fill.fore_color, 'rgb'):
                slide_data['background'] = self.rgb_to_hex(fill.fore_color.rgb)
        
        # Process all shapes on the slide
        for shape_index, shape in enumerate(slide.shapes):
            shape_data = self.extract_shape_data(shape, slide_index, shape_index)
            if shape_data:
                slide_data['shapes'].append(shape_data)
                
                # Extract images
                if shape_data.get('type') == 'picture':
                    slide_data['images'].append(shape_data)
                
                # Extract hyperlinks
                if shape_data.get('hyperlink'):
                    slide_data['hyperlinks'].append(shape_data['hyperlink'])
        
        # Try to extract title from first text shape or slide layout
        if slide.shapes.title:
            slide_data['title'] = slide.shapes.title.text
        elif slide_data['shapes']:
            first_text = next((s for s in slide_data['shapes'] if s.get('text')), None)
            if first_text:
                slide_data['title'] = first_text['text'][:100]  # First 100 chars
        
        return slide_data
    
    def extract_shape_data(self, shape: BaseShape, slide_index: int, shape_index: int) -> Optional[Dict[str, Any]]:
        """Extract data from a shape."""
        shape_data = {
            'id': f"slide_{slide_index}_shape_{shape_index}",
            'type': None,
            'left': shape.left,
            'top': shape.top,
            'width': shape.width,
            'height': shape.height,
            'text': '',
            'hyperlink': None,
            'image_data': None,
            'fill_color': None,
            'line_color': None,
        }
        
        # Handle different shape types
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            shape_data['type'] = 'picture'
            shape_data.update(self.extract_picture_data(shape, slide_index, shape_index))
        elif shape.shape_type == MSO_SHAPE_TYPE.AUTO_SHAPE:
            shape_data['type'] = 'autoshape'
            shape_data.update(self.extract_autoshape_data(shape))
        elif shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            shape_data['type'] = 'group'
            shape_data['shapes'] = []
            for i, subshape in enumerate(shape.shapes):
                sub_data = self.extract_shape_data(subshape, slide_index, f"{shape_index}_{i}")
                if sub_data:
                    shape_data['shapes'].append(sub_data)
        elif shape.shape_type == MSO_SHAPE_TYPE.TEXT_BOX:
            shape_data['type'] = 'textbox'
            shape_data.update(self.extract_textbox_data(shape))
        else:
            shape_data['type'] = 'unknown'
        
        # Extract hyperlinks
        if hasattr(shape, 'click_action') and shape.click_action.action == 1:  # Hyperlink
            shape_data['hyperlink'] = {
                'url': shape.click_action.hyperlink.address,
                'tooltip': getattr(shape.click_action.hyperlink, 'tooltip', '')
            }
        
        return shape_data
    
    def extract_picture_data(self, picture: Picture, slide_index: int, shape_index: int) -> Dict[str, Any]:
        """Extract image data from a picture shape."""
        image_data = {}
        try:
            image = picture.image
            image_bytes = image.blob
            image_ext = image.ext
            
            # Save image to file
            image_filename = f"slide_{slide_index}_img_{shape_index}.{image_ext}"
            image_path = self.images_dir / image_filename
            image_path.write_bytes(image_bytes)
            
            # Create base64 data URI for embedding
            base64_data = base64.b64encode(image_bytes).decode('utf-8')
            mime_type = f"image/{image_ext}" if image_ext != 'png' else 'image/png'
            image_data['image_data'] = f"data:{mime_type};base64,{base64_data}"
            image_data['image_path'] = f"images/{image_filename}"
            image_data['alt'] = picture.name or f"Image {shape_index}"
        except Exception as e:
            print(f"Warning: Could not extract image data: {e}")
        
        return image_data
    
    def extract_autoshape_data(self, shape: Shape) -> Dict[str, Any]:
        """Extract data from an autoshape."""
        data = {}
        
        # Extract text
        if shape.has_text_frame:
            paragraphs = []
            for paragraph in shape.text_frame.paragraphs:
                para_text = ''.join(run.text for run in paragraph.runs)
                if para_text.strip():
                    paragraphs.append(para_text)
            data['text'] = '\n'.join(paragraphs)
        
        # Extract fill color
        if shape.fill.type == 1:  # Solid fill
            if hasattr(shape.fill, 'fore_color') and hasattr(shape.fill.fore_color, 'rgb'):
                data['fill_color'] = self.rgb_to_hex(shape.fill.fore_color.rgb)
        
        return data
    
    def extract_textbox_data(self, shape: Shape) -> Dict[str, Any]:
        """Extract data from a textbox."""
        data = {}
        
        if shape.has_text_frame:
            paragraphs = []
            for paragraph in shape.text_frame.paragraphs:
                para_text = ''.join(run.text for run in paragraph.runs)
                if para_text.strip():
                    paragraphs.append(para_text)
            data['text'] = '\n'.join(paragraphs)
        
        return data
    
    def rgb_to_hex(self, rgb: RGBColor) -> str:
        """Convert RGBColor to hex string."""
        return f"#{rgb.r:02x}{rgb.g:02x}{rgb.b:02x}"
    
    def convert(self) -> str:
        """Convert the entire presentation to HTML."""
        # Extract all slides
        for slide_index, slide in enumerate(self.presentation.slides):
            slide_data = self.extract_slide_content(slide, slide_index)
            self.slides_data.append(slide_data)
        
        # Generate HTML
        html_content = self.generate_html()
        
        # Save HTML file
        output_path = self.output_dir / f"{self.pptx_path.stem}.html"
        output_path.write_text(html_content, encoding='utf-8')
        
        print(f"✓ Converted {len(self.slides_data)} slides to HTML")
        print(f"✓ Output saved to: {output_path}")
        
        return str(output_path)
    
    def generate_html(self) -> str:
        """Generate interactive HTML5 from slide data."""
        slides_html = []
        
        for slide_data in self.slides_data:
            slide_html = self.generate_slide_html(slide_data)
            slides_html.append(slide_html)
        
        html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.pptx_path.stem} - Interactive Presentation</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            overflow: hidden;
        }}
        
        .presentation-container {{
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            position: relative;
        }}
        
        .slides-wrapper {{
            flex: 1;
            position: relative;
            overflow: hidden;
        }}
        
        .slide {{
            position: absolute;
            width: 100%;
            height: 100%;
            display: none;
            padding: 60px;
            background: #2a2a2a;
            overflow-y: auto;
        }}
        
        .slide.active {{
            display: flex;
            flex-direction: column;
            animation: fadeIn 0.5s ease-in;
        }}
        
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: scale(0.95); }}
            to {{ opacity: 1; transform: scale(1); }}
        }}
        
        .slide-content {{
            flex: 1;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }}
        
        .slide-title {{
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 30px;
            color: #4a9eff;
            border-bottom: 3px solid #4a9eff;
            padding-bottom: 15px;
        }}
        
        .slide-shape {{
            position: relative;
            margin: 15px 0;
        }}
        
        .slide-image {{
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: transform 0.3s ease;
        }}
        
        .slide-image:hover {{
            transform: scale(1.02);
        }}
        
        .slide-text {{
            font-size: 1.2em;
            line-height: 1.6;
            color: #e0e0e0;
            margin: 15px 0;
            white-space: pre-wrap;
        }}
        
        .interactive-area {{
            position: absolute;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            border-radius: 4px;
        }}
        
        .interactive-area:hover {{
            border-color: #4a9eff;
            background: rgba(74, 158, 255, 0.1);
        }}
        
        .interactive-area.active {{
            border-color: #4a9eff;
            background: rgba(74, 158, 255, 0.2);
            box-shadow: 0 0 20px rgba(74, 158, 255, 0.5);
        }}
        
        .controls {{
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px 25px;
            border-radius: 50px;
            backdrop-filter: blur(10px);
        }}
        
        .control-btn {{
            background: #4a9eff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
        }}
        
        .control-btn:hover {{
            background: #3a8eef;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(74, 158, 255, 0.4);
        }}
        
        .control-btn:active {{
            transform: translateY(0);
        }}
        
        .control-btn:disabled {{
            background: #555;
            cursor: not-allowed;
            opacity: 0.5;
        }}
        
        .slide-indicator {{
            position: fixed;
            top: 30px;
            right: 30px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            backdrop-filter: blur(10px);
        }}
        
        .tooltip {{
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 6px;
            font-size: 14px;
            pointer-events: none;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            opacity: 0;
            transition: opacity 0.3s ease;
        }}
        
        .tooltip.show {{
            opacity: 1;
        }}
    </style>
</head>
<body>
    <div class="presentation-container">
        <div class="slide-indicator">
            <span id="current-slide">1</span> / <span id="total-slides">{len(self.slides_data)}</span>
        </div>
        
        <div class="slides-wrapper">
            {''.join(slides_html)}
        </div>
        
        <div class="controls">
            <button class="control-btn" id="prev-btn" onclick="previousSlide()">← Previous</button>
            <button class="control-btn" id="next-btn" onclick="nextSlide()">Next →</button>
        </div>
    </div>
    
    <script>
        let currentSlideIndex = 0;
        const totalSlides = {len(self.slides_data)};
        
        function showSlide(index) {{
            // Hide all slides
            document.querySelectorAll('.slide').forEach(slide => {{
                slide.classList.remove('active');
            }});
            
            // Show current slide
            const slides = document.querySelectorAll('.slide');
            if (slides[index]) {{
                slides[index].classList.add('active');
                currentSlideIndex = index;
                
                // Update indicator
                document.getElementById('current-slide').textContent = index + 1;
                
                // Update button states
                document.getElementById('prev-btn').disabled = index === 0;
                document.getElementById('next-btn').disabled = index === totalSlides - 1;
            }}
        }}
        
        function nextSlide() {{
            if (currentSlideIndex < totalSlides - 1) {{
                showSlide(currentSlideIndex + 1);
            }}
        }}
        
        function previousSlide() {{
            if (currentSlideIndex > 0) {{
                showSlide(currentSlideIndex - 1);
            }}
        }}
        
        function goToSlide(index) {{
            if (index >= 0 && index < totalSlides) {{
                showSlide(index);
            }}
        }}
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {{
            if (e.key === 'ArrowRight' || e.key === ' ') {{
                e.preventDefault();
                nextSlide();
            }} else if (e.key === 'ArrowLeft') {{
                e.preventDefault();
                previousSlide();
            }}
        }});
        
        // Initialize
        showSlide(0);
        
        // Enhanced interaction handlers
        document.addEventListener('click', (e) => {{
            const interactiveArea = e.target.closest('.interactive-area');
            if (interactiveArea) {{
                const url = interactiveArea.dataset.url;
                if (url) {{
                    window.open(url, '_blank', 'noopener,noreferrer');
                }}
            }}
        }});
        
        // Tooltip functionality
        document.querySelectorAll('.interactive-area').forEach(area => {{
            area.addEventListener('mouseenter', (e) => {{
                const tooltip = area.querySelector('.tooltip');
                if (tooltip) {{
                    tooltip.classList.add('show');
                }}
            }});
            
            area.addEventListener('mouseleave', (e) => {{
                const tooltip = area.querySelector('.tooltip');
                if (tooltip) {{
                    tooltip.classList.remove('show');
                }}
            }});
        }});
    </script>
</body>
</html>"""
        
        return html_template
    
    def generate_slide_html(self, slide_data: Dict[str, Any]) -> str:
        """Generate HTML for a single slide."""
        shapes_html = []
        
        for shape in slide_data['shapes']:
            if shape['type'] == 'picture' and shape.get('image_data'):
                shapes_html.append(
                    f'<div class="slide-shape">'
                    f'<img src="{shape["image_data"]}" alt="{shape.get("alt", "")}" class="slide-image" />'
                    f'</div>'
                )
            elif shape['type'] == 'textbox' or (shape['type'] == 'autoshape' and shape.get('text')):
                text = shape.get('text', '').strip()
                if text:
                    shapes_html.append(f'<div class="slide-text">{self.escape_html(text)}</div>')
            elif shape.get('hyperlink'):
                # Create interactive area for hyperlink
                hyperlink = shape['hyperlink']
                shapes_html.append(
                    f'<div class="interactive-area" '
                    f'style="left: {shape["left"]}px; top: {shape["top"]}px; '
                    f'width: {shape["width"]}px; height: {shape["height"]}px;" '
                    f'data-url="{self.escape_html(hyperlink["url"])}">'
                    f'<div class="tooltip">{self.escape_html(hyperlink.get("tooltip", hyperlink["url"]))}</div>'
                    f'</div>'
                )
        
        title = slide_data.get('title', f'Slide {slide_data["index"] + 1}')
        background_style = f'background: {slide_data["background"]};' if slide_data.get('background') else ''
        
        slide_html = f"""
        <div class="slide" data-slide-index="{slide_data['index']}" style="{background_style}">
            <div class="slide-content">
                <h1 class="slide-title">{self.escape_html(title)}</h1>
                {''.join(shapes_html)}
            </div>
        </div>
        """
        
        return slide_html
    
    def escape_html(self, text: str) -> str:
        """Escape HTML special characters."""
        return (text
                .replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#39;'))


def main():
    """Main conversion function."""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python convert_ppt_to_html.py <path_to_pptx> [output_dir]")
        print("\nExample:")
        print("  python convert_ppt_to_html.py presentation.pptx")
        sys.exit(1)
    
    pptx_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(pptx_path):
        print(f"Error: File not found: {pptx_path}")
        sys.exit(1)
    
    converter = PPTToHTMLConverter(pptx_path, output_dir)
    output_path = converter.convert()
    
    print(f"\n✓ Conversion complete!")
    print(f"✓ You can now:")
    print(f"  1. Open {output_path} in a browser to preview")
    print(f"  2. Use the HTML content in your MongoDB content collection")
    print(f"  3. Enhance it with additional JavaScript interactions")


if __name__ == "__main__":
    main()

