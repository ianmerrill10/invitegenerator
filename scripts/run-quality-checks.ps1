Param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

Write-Host "=== InviteGenerator Quality Checks ===" -ForegroundColor Cyan
Write-Host "Running in: $PWD" -ForegroundColor DarkGray

Write-Host "\n1) TypeScript type-check" -ForegroundColor Cyan
npm run type-check

Write-Host "\n2) Unit tests (jest)" -ForegroundColor Cyan
# Project has Jest config and __tests__, but no npm script. Run via npx.
npx jest --runInBand

if (-not $SkipBuild) {
  Write-Host "\n3) Next.js production build" -ForegroundColor Cyan
  npm run build
} else {
  Write-Host "\n3) Build skipped" -ForegroundColor Yellow
}

Write-Host "\n=== Done ===" -ForegroundColor Green
