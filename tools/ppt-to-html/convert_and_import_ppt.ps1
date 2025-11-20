# PowerShell script to convert PPT to HTML and import to MongoDB

param(
    [Parameter(Mandatory=$true)]
    [string]$PptFile,
    
    [Parameter(Mandatory=$false)]
    [string]$ContentId = "monitoring-interaction-ppt"
)

Write-Host "PowerPoint to HTML Converter & MongoDB Importer" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if file exists
if (-not (Test-Path $PptFile)) {
    Write-Host "Error: File not found: $PptFile" -ForegroundColor Yellow
    exit 1
}

# Get base name for output
$basename = [System.IO.Path]::GetFileNameWithoutExtension($PptFile)
$htmlFile = "$basename.html"

Write-Host "Step 1: Converting PPT to HTML..." -ForegroundColor Blue
python convert_ppt_to_html.py $PptFile

if (-not (Test-Path $htmlFile)) {
    Write-Host "Error: HTML file was not created" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Conversion complete!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Importing to MongoDB..." -ForegroundColor Blue
python import_ppt_html_to_mongodb.py $htmlFile $ContentId

Write-Host ""
Write-Host "✓ All done!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Start your application"
Write-Host "  2. Navigate to Observability → Content"
Write-Host "  3. Your converted presentation should be visible"

