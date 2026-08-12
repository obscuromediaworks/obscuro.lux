# Deploy del sitio del estudio (+ /modo-god) a Cloudflare Pages.
#
#   .\scripts\deploy-site.ps1              deploy a produccion (rama main)
#   .\scripts\deploy-site.ps1 -Preview     deploy a una URL de preview, sin tocar el sitio vivo
#   .\scripts\deploy-site.ps1 -BuildOnly   arma site-dist/ y no sube nada
#
# Requiere `npx wrangler login` con permisos de Pages. El OAuth caduca ~24 h.

param(
  [switch]$Preview,
  [switch]$BuildOnly
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

$project = "obscuro-mediaworks"
$branch  = if ($Preview) { "preview" } else { "main" }

Write-Host "== Armando site-dist/ ==" -ForegroundColor Cyan
python scripts/build-site.py
if ($LASTEXITCODE -ne 0) { throw "build-site.py fallo" }

if ($BuildOnly) {
  Write-Host "`nBuildOnly: no subo nada. site-dist/ quedo listo." -ForegroundColor Yellow
  exit 0
}

Write-Host "`n== Verificando sesion de wrangler ==" -ForegroundColor Cyan
npx wrangler pages project list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "wrangler no puede leer Pages. Corre:" -ForegroundColor Red
  Write-Host "  npx wrangler login" -ForegroundColor Red
  Write-Host "y aceptA los permisos de Cloudflare Pages (el token actual no los tiene)."
  exit 1
}

# Crear el proyecto la primera vez. Si ya existe, wrangler devuelve error y seguimos.
$exists = (npx wrangler pages project list 2>&1) -match $project
if (-not $exists) {
  Write-Host "`n== Creando el proyecto Pages '$project' ==" -ForegroundColor Cyan
  npx wrangler pages project create $project --production-branch main
  if ($LASTEXITCODE -ne 0) { throw "No pude crear el proyecto" }
}

Write-Host "`n== Subiendo a Pages (rama $branch) ==" -ForegroundColor Cyan
npx wrangler pages deploy site-dist --project-name $project --branch $branch --commit-dirty=true
if ($LASTEXITCODE -ne 0) { throw "El deploy fallo" }

Write-Host "`nListo." -ForegroundColor Green
if (-not $Preview) {
  Write-Host "Recorda: /modo-god expone estado interno. Protegelo con Cloudflare Access." -ForegroundColor Yellow
}
