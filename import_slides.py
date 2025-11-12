#!/usr/bin/env python3
"""
Script to extract slides from PowerPoint presentation, convert to JPEG images, and import into PostgreSQL database.
Converts PPTX slides to JPEG images with maintained aspect ratio, then imports them into component-security_pres.slides table.
Each slide is stored as JPEG image (BYTEA) in the component-security_pres.slides table.
"""

import sys
import os
import tempfile
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values
from pptx import Presentation
from PIL import Image
import io

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'bsg_demo',
    'user': 'postgres',
    'password': 'postgres'
}

def check_dependencies():
    """Check if required libraries and tools are available."""
    import shutil
    errors = []
    
    # Check LibreOffice
    libreoffice_cmd = shutil.which('libreoffice') or shutil.which('soffice')
    # Also check common installation paths
    if not libreoffice_cmd:
        macos_soffice = '/Applications/LibreOffice.app/Contents/MacOS/soffice'
        if os.path.exists(macos_soffice):
            libreoffice_cmd = macos_soffice
        else:
            errors.append("LibreOffice not found. Install with: brew install --cask libreoffice")
    
    if libreoffice_cmd:
        print(f"✓ Found LibreOffice: {libreoffice_cmd}")
    
    # Check Poppler
    pdftocairo_cmd = shutil.which('pdftocairo')
    pdftoppm_cmd = shutil.which('pdftoppm')
    if not pdftocairo_cmd and not pdftoppm_cmd:
        errors.append("Poppler not found. Install with: brew install poppler")
    else:
        poppler_cmd = pdftocairo_cmd or pdftoppm_cmd
        print(f"✓ Found Poppler: {poppler_cmd}")
    
    try:
        from PIL import Image
        print("✓ Found Pillow")
    except ImportError:
        errors.append("Pillow not found. Install with: pip3 install Pillow")
    
    if errors:
        print("\nError: Missing dependencies:")
        for error in errors:
            print(f"  - {error}")
        print("\nPlease install the missing dependencies and try again.")
        sys.exit(1)
    
    return True

def convert_slide_to_jpeg(png_path, output_path, quality=95, max_width=1920):
    """
    Convert a PNG slide image to JPEG with maintained aspect ratio.
    
    This function takes a PNG image (converted from PPTX) and converts it to JPEG,
    maintaining the original aspect ratio and optionally resizing.
    
    Args:
        png_path: Path to PNG image file
        output_path: Path to save the JPEG image
        quality: JPEG quality (1-100, default: 95)
        max_width: Maximum width in pixels (maintains aspect ratio)
    
    Returns:
        Path to saved image file
    """
    from PIL import Image
    
    # Open the PNG image
    image = Image.open(png_path)
    
    # Get original dimensions
    orig_width, orig_height = image.size
    aspect_ratio = orig_width / orig_height
    
    # Calculate final dimensions maintaining aspect ratio
    if orig_width > max_width:
        final_width = max_width
        final_height = int(max_width / aspect_ratio)
        # Resize image using high-quality resampling
        image = image.resize((final_width, final_height), Image.Resampling.LANCZOS)
    else:
        final_width = orig_width
        final_height = orig_height
    
    # Convert to RGB if necessary (JPEG doesn't support transparency)
    if image.mode in ('RGBA', 'LA', 'P'):
        # Create a white background
        rgb_image = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode == 'P':
            image = image.convert('RGBA')
        rgb_image.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
        image = rgb_image
    
    # Save as JPEG
    image.save(output_path, 'JPEG', quality=quality, optimize=True)
    
    return output_path

def convert_pptx_to_jpegs(pptx_path, output_dir, quality=95, max_width=1920):
    """
    Convert PowerPoint presentation slides to JPEG images using LibreOffice.
    
    First converts PPTX to PNG using LibreOffice, then converts PNG to JPEG
    maintaining aspect ratio.
    
    Args:
        pptx_path: Path to PowerPoint file
        output_dir: Directory to save JPEG images
        quality: JPEG quality (1-100, default: 95)
        max_width: Maximum width in pixels (maintains aspect ratio)
    
    Returns:
        List of paths to generated JPEG image files
    """
    import subprocess
    import shutil
    
    # Check if LibreOffice is available (same logic as check_dependencies)
    libreoffice_cmd = shutil.which('libreoffice') or shutil.which('soffice')
    if not libreoffice_cmd:
        macos_soffice = '/Applications/LibreOffice.app/Contents/MacOS/soffice'
        if os.path.exists(macos_soffice):
            libreoffice_cmd = macos_soffice
        else:
            raise Exception("LibreOffice not found. Install with: brew install --cask libreoffice")
    
    print(f"\nConverting PPTX to images using LibreOffice...")
    
    # Step 1: Convert PPTX to PDF first, then PDF to PNG
    # LibreOffice converts PPTX to PDF, then we use pdftocairo/pdftoppm for individual slides
    import shutil
    
    # First convert to PDF
    pdf_path = os.path.join(output_dir, "temp_presentation.pdf")
    try:
        cmd = [
            libreoffice_cmd,
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', output_dir,
            pptx_path
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode != 0:
            raise Exception(f"LibreOffice PDF conversion failed: {result.stderr}")
        
        # Find the generated PDF
        input_name = Path(pptx_path).stem
        generated_pdf = os.path.join(output_dir, f"{input_name}.pdf")
        if not os.path.exists(generated_pdf):
            # Try alternative name
            generated_pdf = os.path.join(output_dir, "temp_presentation.pdf")
            if not os.path.exists(generated_pdf):
                raise Exception("PDF file not found after conversion")
        
        print(f"✓ PDF created: {generated_pdf}")
        
    except subprocess.TimeoutExpired:
        raise Exception("LibreOffice conversion timed out")
    except Exception as e:
        print(f"Error converting PPTX to PDF: {e}")
        raise
    
    # Step 2: Convert PDF pages to PNG using pdftocairo or pdftoppm
    pdftocairo_cmd = shutil.which('pdftocairo')
    pdftoppm_cmd = shutil.which('pdftoppm')
    
    if not pdftocairo_cmd and not pdftoppm_cmd:
        raise Exception("Poppler not found. Install with: brew install poppler")
    
    poppler_cmd = pdftocairo_cmd or pdftoppm_cmd
    print(f"Using Poppler: {poppler_cmd}")
    
    try:
        output_prefix = os.path.join(output_dir, "slide")
        cmd = [
            poppler_cmd,
            '-png',
            '-r', '150',  # 150 DPI
            generated_pdf,
            output_prefix
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode != 0:
            raise Exception(f"Poppler conversion failed: {result.stderr}")
        
        # Find generated PNG files
        png_files = sorted(Path(output_dir).glob("slide-*.png"))
        if not png_files:
            png_files = sorted(Path(output_dir).glob("slide*.png"))
        
        if not png_files:
            raise Exception("No PNG images were generated from PDF")
        
        print(f"Found {len(png_files)} PNG images")
        
    except subprocess.TimeoutExpired:
        raise Exception("Poppler conversion timed out")
    except Exception as e:
        print(f"Error converting PDF to PNG: {e}")
        raise
    
    # Step 2: Convert PNG to JPEG maintaining aspect ratio
    jpeg_paths = []
    for i, png_path in enumerate(png_files, start=1):
        print(f"Converting slide {i}/{len(png_files)} to JPEG...")
        
        jpeg_filename = f"slide-{i}.jpg"
        jpeg_path = os.path.join(output_dir, jpeg_filename)
        
        # Convert PNG to JPEG with maintained aspect ratio
        convert_slide_to_jpeg(str(png_path), jpeg_path, quality=quality, max_width=max_width)
        
        # Check file size
        file_size_kb = os.path.getsize(jpeg_path) / 1024
        print(f"  Saved: {jpeg_path} ({file_size_kb:.1f} KB)")
        
        jpeg_paths.append(jpeg_path)
        
        # Clean up PNG file
        try:
            os.remove(png_path)
        except:
            pass
    
    print(f"\n✓ Conversion completed successfully!")
    print(f"✓ Generated {len(jpeg_paths)} JPEG images")
    
    return sorted(jpeg_paths)

def load_image_as_bytes(image_path):
    """
    Load JPEG image and return as bytes.
    
    Args:
        image_path: Path to JPEG image file
    
    Returns:
        Image bytes
    """
    try:
        with open(image_path, 'rb') as f:
            return f.read()
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")
        raise

def import_slides_to_db(slides_data):
    """Import slides into PostgreSQL database."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Clear existing data
        cur.execute('DELETE FROM "component-security_pres".slides;')
        print("\nCleared existing slides")
        
        # Insert new slides
        insert_query = '''
            INSERT INTO "component-security_pres".slides (slide_number, slide_content)
            VALUES %s
            ON CONFLICT (slide_number) DO UPDATE 
            SET slide_content = EXCLUDED.slide_content;
        '''
        
        execute_values(cur, insert_query, slides_data)
        conn.commit()
        
        print(f"\n✓ Successfully imported {len(slides_data)} slides into database")
        
        # Verify import
        cur.execute('SELECT COUNT(*) FROM "component-security_pres".slides;')
        count = cur.fetchone()[0]
        print(f"✓ Total slides in database: {count}")
        
        # Check image sizes
        cur.execute('''
            SELECT slide_number, 
                   pg_size_pretty(pg_column_size(slide_content)::bigint) as size
            FROM "component-security_pres".slides
            ORDER BY slide_number
            LIMIT 5;
        ''')
        print("\nSample slide sizes:")
        for row in cur.fetchall():
            print(f"  Slide {row[0]}: {row[1]}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error importing to database: {e}")
        sys.exit(1)

def main():
    pptx_path = "/Users/sergeytovstogan/Documents_BSG/SAAS SECURITY STANDARD NEW 22 OCT 2025.pptx"
    
    if not os.path.exists(pptx_path):
        print(f"Error: File not found: {pptx_path}")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create temporary directory for conversion
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"\nUsing temporary directory: {temp_dir}")
        
        try:
            # Step 1: Convert PPTX slides to JPEG images
            # Using 1920px max width for HD quality, maintaining aspect ratio
            # JPEG quality set to 95 for good balance between quality and file size
            image_paths = convert_pptx_to_jpegs(pptx_path, temp_dir, quality=95, max_width=1920)
            
            # Step 2: Load images and prepare for database
            print(f"\nLoading {len(image_paths)} images...")
            slides_data = []
            
            for idx, image_path in enumerate(image_paths, start=1):
                image_bytes = load_image_as_bytes(image_path)
                slides_data.append((idx, image_bytes))
                file_size_kb = len(image_bytes) / 1024
                print(f"  Slide {idx}: {file_size_kb:.1f} KB")
            
            # Step 3: Import to database
            import_slides_to_db(slides_data)
            
            print("\n✓ Import completed successfully!")
            
        except Exception as e:
            print(f"\n✗ Error during conversion/import: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == "__main__":
    main()

