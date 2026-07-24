@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "APP_DIR=%ROOT%frontend-playground"
set "ENV_DIR=%ROOT%.venv"
set "NPM_CACHE=%ENV_DIR%\npm-cache"
set "LOCK_FILE=%APP_DIR%\package-lock.json"
set "NODE_VERSION=22.23.1"
set "NPM_VERSION=11.11.0"

if not exist "%LOCK_FILE%" (
  echo ERROR: frontend-playground\package-lock.json was not found.
  echo Run this script from an intact project checkout.
  exit /b 1
)

set "NODE_ARCH=x64"
set "NODE_SHA256=7df0bc9375723f4a86b3aa1b7cc73342423d9677a8df4538aca31a049e309c29"
if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" (
  set "NODE_ARCH=arm64"
  set "NODE_SHA256=b470fdfe3502c05151656e06d495e3f47544f2ee8b1d9c8705090f2dd5996bd0"
)
if /i "%PROCESSOR_ARCHITEW6432%"=="ARM64" (
  set "NODE_ARCH=arm64"
  set "NODE_SHA256=b470fdfe3502c05151656e06d495e3f47544f2ee8b1d9c8705090f2dd5996bd0"
)
if /i "%PROCESSOR_ARCHITECTURE%"=="x86" if "%PROCESSOR_ARCHITEW6432%"=="" (
  set "NODE_ARCH=x86"
  set "NODE_SHA256=e298b368aad86c571447a3650db3ce19063373ffd39d6d73d014a5d9ad31dc62"
)

set "NODE_NAME=node-v%NODE_VERSION%-win-%NODE_ARCH%"
set "NODE_DIR=%ENV_DIR%\%NODE_NAME%"
set "NODE_ZIP=%ENV_DIR%\%NODE_NAME%.zip"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_NAME%.zip"

if not exist "%ENV_DIR%" mkdir "%ENV_DIR%"
if errorlevel 1 (
  echo ERROR: Could not create the project-local .venv directory.
  exit /b 1
)

if not exist "%ENV_DIR%\tmp" mkdir "%ENV_DIR%\tmp"
if not exist "%ENV_DIR%\home" mkdir "%ENV_DIR%\home"
if not exist "%ENV_DIR%\node-gyp" mkdir "%ENV_DIR%\node-gyp"
set "TEMP=%ENV_DIR%\tmp"
set "TMP=%ENV_DIR%\tmp"
set "HOME=%ENV_DIR%\home"
set "npm_config_cache=%NPM_CACHE%"
set "npm_config_userconfig=%ENV_DIR%\npmrc"
set "npm_config_globalconfig=%ENV_DIR%\npm-globalrc"
set "npm_package_config_node_gyp_devdir=%ENV_DIR%\node-gyp"
set "npm_config_update_notifier=false"

if not exist "%NODE_DIR%\node.exe" (
  if not exist "%NODE_ZIP%" (
    echo Downloading project-local Node.js %NODE_VERSION% for %NODE_ARCH%...
    powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing -Uri $env:NODE_URL -OutFile $env:NODE_ZIP"
    if errorlevel 1 (
      echo ERROR: Node.js download failed. Check the internet connection and retry.
      exit /b 1
    )
  )

  call :verify_node_archive
  if errorlevel 1 (
    echo ERROR: The downloaded Node.js archive failed SHA-256 verification.
    del /q "%NODE_ZIP%" 2>nul
    exit /b 1
  )

  echo Extracting Node.js inside .venv...
  powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath $env:NODE_ZIP -DestinationPath $env:ENV_DIR -Force"
  if errorlevel 1 (
    echo ERROR: Node.js extraction failed.
    exit /b 1
  )
)

if not exist "%NODE_DIR%\node.exe" (
  echo ERROR: The project-local Node.js executable is unavailable.
  exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"

echo Installing project-local npm %NPM_VERSION%...
call "%NODE_DIR%\npm.cmd" install --global "npm@%NPM_VERSION%" --prefix "%NODE_DIR%" --no-audit --no-fund
if errorlevel 1 (
  echo ERROR: The project-local npm installation failed.
  exit /b 1
)

echo Installing locked frontend dependencies...
pushd "%APP_DIR%"
call "%NODE_DIR%\npm.cmd" ci --no-audit --no-fund
set "INSTALL_EXIT=%ERRORLEVEL%"
popd
if not "%INSTALL_EXIT%"=="0" (
  echo ERROR: npm ci failed with exit code %INSTALL_EXIT%.
  exit /b %INSTALL_EXIT%
)

for /f "usebackq delims=" %%H in (`powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "(Get-FileHash -LiteralPath $env:LOCK_FILE -Algorithm SHA256).Hash.ToLowerInvariant()"`) do set "LOCK_SHA256=%%H"
if not defined LOCK_SHA256 (
  echo ERROR: Could not fingerprint package-lock.json.
  exit /b 1
)
> "%ENV_DIR%\package-lock.sha256" echo %LOCK_SHA256%

echo.
echo Setup complete. All installed tools and dependencies are inside this project.
echo Run start.bat, then open http://localhost:4200/.
exit /b 0

:verify_node_archive
set "ACTUAL_SHA256="
for /f "usebackq delims=" %%H in (`powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "(Get-FileHash -LiteralPath $env:NODE_ZIP -Algorithm SHA256).Hash.ToLowerInvariant()"`) do set "ACTUAL_SHA256=%%H"
if /i "%ACTUAL_SHA256%"=="%NODE_SHA256%" exit /b 0
exit /b 1
