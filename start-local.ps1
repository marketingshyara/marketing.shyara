$ErrorActionPreference = "Stop"

function Get-NodeExecutable {
  $fromPath = Get-Command node -ErrorAction SilentlyContinue
  if ($fromPath -and $fromPath.Source) {
    return $fromPath.Source
  }

  $nvmSymlink = $env:NVM_SYMLINK
  if ($nvmSymlink) {
    $nvmNode = Join-Path $nvmSymlink "node.exe"
    if (Test-Path $nvmNode) {
      return $nvmNode
    }
  }

  $candidates = @(
    (Join-Path ${env:ProgramFiles} "nodejs\node.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "nodejs\node.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\node\node.exe"),
    (Join-Path $env:APPDATA "fnm\node-versions\*\installation\node.exe")
  )

  foreach ($pattern in $candidates) {
    if ($pattern -match '\*') {
      $resolved = Get-Item $pattern -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -First 1
      if ($resolved -and (Test-Path $resolved.FullName)) {
        return $resolved.FullName
      }
    } elseif (Test-Path $pattern) {
      return $pattern
    }
  }

  $voltaHome = $env:VOLTA_HOME
  if ($voltaHome) {
    $voltaNode = Join-Path $voltaHome "bin\node.exe"
    if (Test-Path $voltaNode) {
      return $voltaNode
    }
  }

  return $null
}

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
$viteScript = Join-Path $root "node_modules\vite\bin\vite.js"

if (-not (Test-Path $viteScript)) {
  Write-Host "Dependencies missing: $viteScript not found." -ForegroundColor Red
  Write-Host "From the repo root run: npm install" -ForegroundColor Yellow
  exit 1
}

$nodeExe = Get-NodeExecutable
if (-not $nodeExe) {
  Write-Host "Node.js was not found on this machine (PATH and common install locations)." -ForegroundColor Red
  Write-Host "Install Node.js LTS, then open a new terminal and run this script again." -ForegroundColor Yellow
  Write-Host "  winget install OpenJS.NodeJS.LTS" -ForegroundColor Cyan
  Write-Host "  https://nodejs.org/" -ForegroundColor Cyan
  exit 1
}

$frontendPort = Get-FreeTcpPort
$frontendUrl = "http://localhost:$frontendPort"

Write-Host "Using Node: $nodeExe" -ForegroundColor DarkGray
Write-Host "Starting Shyara Marketing locally..." -ForegroundColor Green
Write-Host "Frontend: $frontendUrl" -ForegroundColor Cyan

$psCommand = "Set-Location `"$frontendDir`"; & `"$nodeExe`" `"$viteScript`" --host localhost --port $frontendPort"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $psCommand | Out-Null
Start-Sleep -Seconds 3

Start-Process $frontendUrl

Write-Host ""
Write-Host "Website opened at $frontendUrl" -ForegroundColor Green
