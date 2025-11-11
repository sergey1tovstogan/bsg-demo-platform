# Test script to start server and show output
Write-Host "`n=== Starting BSG Demo Platform Frontend ===" -ForegroundColor Cyan
Write-Host "Port: 3000" -ForegroundColor Yellow
Write-Host "URL: http://localhost:3000`n" -ForegroundColor Green

# Kill existing
$procs = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($procs) {
    Write-Host "Killing existing processes..." -ForegroundColor Yellow
    $procs | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

Write-Host "Starting Vite dev server...`n" -ForegroundColor Yellow
npm run dev

