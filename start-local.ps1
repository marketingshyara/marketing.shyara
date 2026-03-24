$ErrorActionPreference = "Stop"

function Get-FreeTcpPort {
  param(
    [int]$Min = 45000,
    [int]$Max = 55000,
    [int[]]$Exclude = @()
  )

  $listeners = @(
    Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty LocalPort
  ) + $Exclude

  for ($i = 0; $i -lt 200; $i++) {
    $candidate = Get-Random -Minimum $Min -Maximum $Max
    if ($listeners -notcontains $candidate) {
      return $candidate
    }
  }

  throw "Unable to find a free TCP port in range $Min-$Max."
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $root "frontend"
$backendDir = Join-Path $root "backend"

$frontendPort = Get-FreeTcpPort
$backendPort = Get-FreeTcpPort -Exclude @($frontendPort)
$frontendUrl = "http://localhost:$frontendPort"
$backendUrl = "http://localhost:$backendPort"

Write-Host "Starting Shyara Marketing locally..." -ForegroundColor Green
Write-Host "Frontend: $frontendUrl" -ForegroundColor Cyan
Write-Host "Backend:  $backendUrl" -ForegroundColor Cyan

$backendCommand = @"
`$env:PORT='$backendPort'
`$env:ALLOWED_ORIGINS='$frontendUrl'
Set-Location '$backendDir'
npm run db:push
npm run seed:bootstrap
npm run dev
"@

$frontendCommand = @"
`$env:VITE_API_BASE_URL='$backendUrl/api'
Set-Location '$frontendDir'
node ..\node_modules\vite\bin\vite.js --host localhost --port $frontendPort
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand | Out-Null
Start-Sleep -Seconds 3

Start-Process $frontendUrl

Write-Host ""
Write-Host "Website opened at $frontendUrl" -ForegroundColor Green
Write-Host "Sales Portal: $frontendUrl/sales-portal/login" -ForegroundColor Yellow
Write-Host "Portal bootstrap uses the admin credentials configured in the local .env file." -ForegroundColor Yellow
