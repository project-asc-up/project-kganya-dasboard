$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $repoRoot

$nodeModules = Join-Path $repoRoot 'node_modules'
if (-not (Test-Path $nodeModules)) {
  Write-Host 'Installing dependencies...'
  npm install
}

$serverCommand = 'cd /d "' + $repoRoot + '" && npm run dev'
Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', $serverCommand | Out-Null

$serverUrl = 'http://localhost:3000'
$ready = $false
for ($attempt = 0; $attempt -lt 60; $attempt++) {
  try {
    Invoke-WebRequest -Uri $serverUrl | Out-Null
    $ready = $true
    break
  } catch {
    Start-Sleep -Seconds 1
  }
}

Start-Process $serverUrl | Out-Null

if ($ready) {
  Write-Host 'Kganya UI is up in your browser.'
} else {
  Write-Host 'The browser opened before the app responded. Refresh after the dev server finishes booting.'
}
