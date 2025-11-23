# Check Deployment Health
# Verifies that deployed services are working correctly

param(
    [string]$BackendUrl = "https://bsg-demo-platform-app.azurewebsites.net",
    [string]$FrontendUrl = "https://kind-beach-01c0a990f.3.azurestaticapps.net",
    [int]$Retries = 3,
    [int]$RetryDelaySeconds = 5
)

$ErrorActionPreference = "Continue"

Write-Host "🏥 Deployment Health Check" -ForegroundColor Cyan
Write-Host ""

# Load configuration
$configPath = Join-Path $PSScriptRoot "config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath | ConvertFrom-Json
    if ($config.monitoring) {
        $Retries = $config.monitoring.health_check_retries ?? $Retries
        $RetryDelaySeconds = $config.monitoring.health_check_delay_seconds ?? $RetryDelaySeconds
    }
    if ($config.workflows."deploy-backend") {
        $BackendUrl = $config.workflows."deploy-backend".health_check_url ?? $BackendUrl
    }
    if ($config.workflows."deploy-frontend") {
        $FrontendUrl = $config.workflows."deploy-frontend".health_check_url ?? $FrontendUrl
    }
}

$allHealthy = $true

# Function to check endpoint with retries
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$MaxRetries = 3,
        [int]$DelaySeconds = 5
    )
    
    Write-Host "Checking $Name..." -ForegroundColor Cyan
    Write-Host "  URL: $Url" -ForegroundColor Gray
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ Status: $($response.StatusCode) - Healthy" -ForegroundColor Green
                
                # Try to parse JSON response if available
                try {
                    $content = $response.Content | ConvertFrom-Json
                    if ($content.status) {
                        Write-Host "  Status: $($content.status)" -ForegroundColor Gray
                    }
                } catch {
                    # Not JSON, that's fine
                }
                
                return $true
            } else {
                Write-Host "  ⚠ Status: $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            if ($i -lt $MaxRetries) {
                Write-Host "  ⚠ Attempt $i/$MaxRetries failed: $($_.Exception.Message)" -ForegroundColor Yellow
                Write-Host "  Retrying in $DelaySeconds seconds..." -ForegroundColor Gray
                Start-Sleep -Seconds $DelaySeconds
            } else {
                Write-Host "  ❌ Failed after $MaxRetries attempts: $($_.Exception.Message)" -ForegroundColor Red
                return $false
            }
        }
    }
    
    return $false
}

# Check backend health endpoint
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
$backendHealth = Test-Endpoint -Url "$BackendUrl/api/v1/health" -Name "Backend Health" -MaxRetries $Retries -DelaySeconds $RetryDelaySeconds
if (-not $backendHealth) {
    $allHealthy = $false
}

# Check backend liveness endpoint
$backendLive = Test-Endpoint -Url "$BackendUrl/api/v1/live" -Name "Backend Liveness" -MaxRetries $Retries -DelaySeconds $RetryDelaySeconds
if (-not $backendLive) {
    $allHealthy = $false
}

# Check frontend
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
$frontendHealth = Test-Endpoint -Url $FrontendUrl -Name "Frontend" -MaxRetries $Retries -DelaySeconds $RetryDelaySeconds
if (-not $frontendHealth) {
    $allHealthy = $false
}

# Check API docs endpoint
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
$apiDocs = Test-Endpoint -Url "$BackendUrl/docs" -Name "API Documentation" -MaxRetries $Retries -DelaySeconds $RetryDelaySeconds
if (-not $apiDocs) {
    Write-Host "  ⚠ API docs not accessible (non-critical)" -ForegroundColor Yellow
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

if ($allHealthy) {
    Write-Host "✅ All health checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend: $BackendUrl" -ForegroundColor Gray
    Write-Host "Frontend: $FrontendUrl" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "❌ Some health checks failed" -ForegroundColor Red
    exit 1
}

