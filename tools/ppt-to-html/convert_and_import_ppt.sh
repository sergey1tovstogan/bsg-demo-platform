#!/bin/bash
# Quick script to convert PPT to HTML and import to MongoDB

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}PowerPoint to HTML Converter & MongoDB Importer${NC}"
echo "=========================================="
echo ""

# Check if PPT file path is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./convert_and_import_ppt.sh <path_to_pptx> [content_id]${NC}"
    echo ""
    echo "Example:"
    echo "  ./convert_and_import_ppt.sh presentation.pptx"
    exit 1
fi

PPT_FILE="$1"
CONTENT_ID="${2:-monitoring-interaction-ppt}"

# Check if file exists
if [ ! -f "$PPT_FILE" ]; then
    echo -e "${YELLOW}Error: File not found: $PPT_FILE${NC}"
    exit 1
fi

# Get base name for output
BASENAME=$(basename "$PPT_FILE" .pptx)
HTML_FILE="${BASENAME}.html"

echo -e "${BLUE}Step 1: Converting PPT to HTML...${NC}"
python convert_ppt_to_html.py "$PPT_FILE"

if [ ! -f "$HTML_FILE" ]; then
    echo -e "${YELLOW}Error: HTML file was not created${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Conversion complete!${NC}"
echo ""

echo -e "${BLUE}Step 2: Importing to MongoDB...${NC}"
python import_ppt_html_to_mongodb.py "$HTML_FILE" "$CONTENT_ID"

echo ""
echo -e "${GREEN}✓ All done!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start your application"
echo "  2. Navigate to Observability → Content"
echo "  3. Your converted presentation should be visible"

