$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ─── 0. Docker health check ──────────────────────────────────────────────────
Write-Host "[0/3] Checking if Docker is running ..."
$dockerRunning = $true
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) { $dockerRunning = $false }
} catch {
    $dockerRunning = $false
}
if (-not $dockerRunning) {
    Write-Host "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}
Write-Host "      Docker is running."

$ruleChainPath = Join-Path $rootDir "apps\api\src\thingsboard\base_rule_chain.json"
$nextConfigPath = Join-Path $rootDir "apps\front\next.config.ts"

# ─── 1. base_rule_chain.json: api → localhost ───────────────────────────────
Write-Host "[1/3] Patching $ruleChainPath ..."
$content = Get-Content $ruleChainPath -Raw
$content = $content -replace [regex]::Escape("http://api:3003/api/proxy/telemetry"), "http://localhost:3003/api/proxy/telemetry"
[System.IO.File]::WriteAllText($ruleChainPath, $content)
Write-Host "      Done."

# ─── 2. next.config.ts: localhost → Docker/K8s DNS ──────────────────────────
Write-Host "[2/3] Patching $nextConfigPath ..."
$content = Get-Content $nextConfigPath -Raw
$content = $content -replace [regex]::Escape("http://api:3003/api/:path*"),   "http://localhost:3003/api/:path*"
$content = $content -replace [regex]::Escape("http://api:3003/fhir/:path*"),  "http://localhost:3003/fhir/:path*"
$content = $content -replace [regex]::Escape("http://thingsboard:8080/assets/:path*"),"http://localhost:8088/assets/:path*"
[System.IO.File]::WriteAllText($nextConfigPath, $content)
Write-Host "      Done." 

# ─── 3. Docker Compose – ThingsBoard install ─────────────────────────────────
Write-Host "[3/3] Running ThingsBoard CE install (INSTALL_TB=true, LOAD_DEMO=true) ..."
Write-Host "Note: If you're running this for the second time it will throw error, you can safely ignore it"
Set-Location (Join-Path $rootDir "backend")
docker compose run --rm -e INSTALL_TB=true -e LOAD_DEMO=true thingsboard-ce

Write-Host "init.ps1 completed successfully."
