# PPT to HTML Converter Tool

A standalone tool for converting PowerPoint presentations (PPT/PPTX) to interactive HTML5 presentations.

## Features

- ✅ Converts PPT/PPTX files to interactive HTML5
- ✅ Preserves slide transitions and animations
- ✅ Maintains clickable elements and hyperlinks
- ✅ Extracts and embeds images
- ✅ Generates responsive HTML presentations
- ✅ Optional MongoDB integration for content management

## Quick Start

### Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Basic Usage

Convert a PowerPoint file to HTML:
```bash
python convert_ppt_to_html.py presentation.pptx
```

This will create:
- `presentation.html` - The interactive HTML presentation
- `images/` folder - Extracted images from the presentation

### Import to MongoDB (Optional)

If you want to import the converted HTML into MongoDB:
```bash
python import_ppt_html_to_mongodb.py presentation.html
```

**Note**: You'll need to set up environment variables:
- `DATABASE_URL` - MongoDB connection string
- `DATABASE_NAME` - Database name (defaults to "bsg_demo")

## Usage Examples

### Windows (PowerShell)
```powershell
.\convert_and_import_ppt.ps1 presentation.pptx
```

### Linux/Mac
```bash
chmod +x convert_and_import_ppt.sh
./convert_and_import_ppt.sh presentation.pptx
```

### Manual Conversion
```bash
# Step 1: Convert PPT to HTML
python convert_ppt_to_html.py path/to/presentation.pptx

# Step 2: (Optional) Import to MongoDB
python import_ppt_html_to_mongodb.py presentation.html [content_id]
```

## File Structure

```
ppt-to-html/
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── convert_ppt_to_html.py            # Main conversion script
├── import_ppt_html_to_mongodb.py     # MongoDB import script (optional)
├── convert_and_import_ppt.ps1        # PowerShell helper script
├── convert_and_import_ppt.sh         # Bash helper script
├── PPT_TO_HTML_GUIDE.md              # Detailed guide
└── QUICK_START_PPT_CONVERSION.md     # Quick start guide
```

## Documentation

- **[Quick Start Guide](QUICK_START_PPT_CONVERSION.md)** - Get started in 3 steps
- **[Full Guide](PPT_TO_HTML_GUIDE.md)** - Comprehensive documentation with examples and troubleshooting

## Requirements

- Python 3.7+
- See `requirements.txt` for Python package dependencies

## Features of Generated HTML

The generated HTML presentations include:
- Slide navigation (Previous/Next buttons)
- Keyboard navigation (Arrow keys, Spacebar)
- Slide indicator (current slide / total slides)
- Responsive design
- Interactive hyperlinks
- Embedded images
- Smooth transitions

## Customization

The generated HTML can be customized by:
1. Editing the CSS styles in `convert_ppt_to_html.py`
2. Modifying the JavaScript functionality
3. Adding custom interactions after conversion

See `PPT_TO_HTML_GUIDE.md` for detailed customization examples.

## License

This tool is part of the BSG Demo Platform project.

## Support

For issues or questions:
- Check the conversion script output for errors
- Review `PPT_TO_HTML_GUIDE.md` for troubleshooting
- Test HTML file directly in browser first

