# Quick Start: PPT to HTML Conversion

## 🚀 Fast Track (3 Steps)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Convert Your PPT File
**On Windows (PowerShell):**
```powershell
.\convert_and_import_ppt.ps1 presentation.pptx
```

**On Linux/Mac:**
```bash
chmod +x convert_and_import_ppt.sh
./convert_and_import_ppt.sh presentation.pptx
```

**Or manually:**
```bash
# Step 1: Convert PPT to HTML
python convert_ppt_to_html.py presentation.pptx

# Step 2: Import to MongoDB (optional)
python import_ppt_html_to_mongodb.py presentation.html
```

### 3. View in Application
1. Start your application
2. Navigate to the content section
3. Your converted presentation is now interactive!

## 📋 What You Get

✅ Interactive HTML5 presentation  
✅ Preserved hyperlinks and clickable elements  
✅ Slide navigation (Previous/Next buttons + keyboard)  
✅ Responsive design  
✅ Ready for further enhancements  

## 🛠️ Tool Recommendations

### For This Project (Recommended)
- **Python Script** (`convert_ppt_to_html.py`) - Free, customizable, integrates with your stack

### Commercial Options (Better Animation Support)
- **iSpring Converter Pro** - Best for preserving complex animations
- **Adobe Captivate** - Best for eLearning enhancements

### Online Services (Quick & Easy)
- **SlideHTML5** - Cloud-based conversion
- **HTML5Point** - Professional conversion service

## 📚 Full Documentation

See `PPT_TO_HTML_GUIDE.md` for:
- Detailed tool comparisons
- Advanced enhancement techniques
- Troubleshooting guide
- Best practices

## 💡 Next Steps

After conversion, you can:
1. **Add custom interactions** - Edit the generated HTML or enhance in your application
2. **Integrate with APIs** - Fetch live data to update slides dynamically
3. **Add analytics** - Track slide views and interactions
4. **Enhance styling** - Customize CSS to match your application theme

## 🐛 Troubleshooting

**Images not showing?**
- Check that `images/` folder is in the same directory as the HTML file
- Verify image paths in the HTML

**Interactions not working?**
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify MongoDB import was successful (if applicable)

**Need help?**
- Check `PPT_TO_HTML_GUIDE.md` for detailed troubleshooting
- Review conversion script output for errors

