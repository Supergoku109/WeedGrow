param(
  [Parameter(Position = 0)]
  [ValidateSet("install", "start", "android", "ios", "web", "lint", "typecheck", "reset")]
  [string]$Task = "start"
)

$ErrorActionPreference = "Stop"

switch ($Task) {
  "install" { & npm install }
  "start" { & npm start }
  "android" { & npm run android }
  "ios" { & npm run ios }
  "web" { & npm run web }
  "lint" { & npm run lint }
  "typecheck" { & npm run typecheck }
  "reset" { & npm run reset-project }
}

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
