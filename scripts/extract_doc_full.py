"""Extract full text from Temenos Active and Future Components (Word .doc) via COM."""
import os
import sys
path = r'c:\Users\apostolos.georgas\OneDrive - Temenos\Desktop\Temenos\Technical Stuff\Docs\Temenos Active and Future Components.docx'
out_path = os.path.join(os.path.dirname(__file__), '..', 'temenos_components_extract.txt')
try:
    import win32com.client
    word = win32com.client.Dispatch('Word.Application')
    word.Visible = False
    doc = word.Documents.Open(os.path.abspath(path))
    text = doc.Content.Text
    doc.Close(False)
    word.Quit()
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Extracted {len(text)} chars to {out_path}")
except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)
