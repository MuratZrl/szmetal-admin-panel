# project-diagnose.ps1
Write-Host "=== PROJECT DIAGNOSE ==="

Write-Host ""
Write-Host "Location:"
Get-Location

Write-Host ""
Write-Host "Node:"
node -v 2>$null

Write-Host ""
Write-Host "NPM:"
npm -v 2>$null

Write-Host ""
Write-Host "Git:"
git --version 2>$null

Write-Host ""
Write-Host "package.json:"
if (Test-Path package.json) {
  Get-Content package.json | Select-Object -First 20
} else {
  Write-Host "package.json not found"
}

Write-Host ""
Write-Host "App directories:"
Get-ChildItem -Directory -Filter app -Recurse -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done."
