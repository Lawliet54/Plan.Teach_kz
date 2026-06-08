[CmdletBinding()]
param(
  [string]$ProjectRoot = "D:\Проекты\plan.teach-kz",
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$SourceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceFullPath = [System.IO.Path]::GetFullPath($SourceRoot).TrimEnd('\')
$TargetFullPath = [System.IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')

if ($SourceFullPath -eq $TargetFullPath) {
  throw "Скриптті ZIP архивінен шығарылған бөлек папкадан іске қосыңыз."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = "$TargetFullPath-backup-$stamp"

Write-Host "[1/5] Бұрынғы жобаның source резервтік көшірмесі жасалады: $backupRoot" -ForegroundColor Cyan
if (Test-Path -LiteralPath $TargetFullPath) {
  New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

  & robocopy.exe `
    $TargetFullPath `
    $backupRoot `
    /E `
    /XD ".next" "node_modules" `
    /XF "tsconfig.tsbuildinfo" `
    /R:2 `
    /W:1 `
    /NFL `
    /NDL `
    /NJH `
    /NJS `
    /NP | Out-Host

  if ($LASTEXITCODE -ge 8) {
    throw "Резервтік көшірме жасау кезінде robocopy қатесі шықты. Код: $LASTEXITCODE"
  }
} else {
  New-Item -ItemType Directory -Path $TargetFullPath -Force | Out-Null
}

Write-Host "[2/5] Ескі source файлдары тазаланады. .git, .env.local және node_modules сақталады." -ForegroundColor Cyan
$preservedNames = @(".git", ".env.local", "node_modules")
Get-ChildItem -LiteralPath $TargetFullPath -Force -ErrorAction SilentlyContinue |
  Where-Object { $preservedNames -notcontains $_.Name } |
  Remove-Item -Recurse -Force -ErrorAction Stop

Write-Host "[3/5] Реставрацияланған файлдар көшіріледі." -ForegroundColor Cyan
$excludedNames = @(".git", ".next", "node_modules", ".env.local", "tsconfig.tsbuildinfo")
Get-ChildItem -LiteralPath $SourceFullPath -Force |
  Where-Object { $excludedNames -notcontains $_.Name } |
  Copy-Item -Destination $TargetFullPath -Recurse -Force

Push-Location $TargetFullPath
try {
  if (-not $SkipInstall) {
    Write-Host "[4/5] npm тәуелділіктері тексеріліп орнатылады." -ForegroundColor Cyan
    npm install
  } else {
    Write-Host "[4/5] npm install өткізіліп жіберілді." -ForegroundColor Yellow
  }

  Write-Host "[5/5] Код сапасы тексеріледі." -ForegroundColor Cyan
  npm run lint
  npm run build
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Файлдар сәтті енгізілді." -ForegroundColor Green
Write-Host "Келесі міндетті қадамдар:" -ForegroundColor Yellow
Write-Host "1) $TargetFullPath\.env.local ішіне SUPABASE_SERVICE_ROLE_KEY қосыңыз."
Write-Host "2) Supabase ішінде 016–020 миграцияларын ретімен іске қосыңыз."
Write-Host "3) cd `"$TargetFullPath`"; npm run dev"
