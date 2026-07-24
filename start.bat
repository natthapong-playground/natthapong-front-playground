@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "APP_DIR=%ROOT%frontend-playground"
set "ENV_DIR=%ROOT%.venv"
set "NODE_DIR=%ENV_DIR%\node-v22.23.1-win-x64"
set "LOCK_FILE=%APP_DIR%\package-lock.json"
set "NEED_SETUP=0"

if /i "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "NODE_DIR=%ENV_DIR%\node-v22.23.1-win-arm64"
if /i "%PROCESSOR_ARCHITEW6432%"=="ARM64" set "NODE_DIR=%ENV_DIR%\node-v22.23.1-win-arm64"
if /i "%PROCESSOR_ARCHITECTURE%"=="x86" if "%PROCESSOR_ARCHITEW6432%"=="" set "NODE_DIR=%ENV_DIR%\node-v22.23.1-win-x86"

if not exist "%NODE_DIR%\node.exe" set "NEED_SETUP=1"
if not exist "%NODE_DIR%\npm.cmd" set "NEED_SETUP=1"
if not exist "%APP_DIR%\node_modules\@angular\cli\bin\ng.js" set "NEED_SETUP=1"
if not exist "%ENV_DIR%\package-lock.sha256" set "NEED_SETUP=1"

set "INSTALLED_LOCK_SHA256="
set "CURRENT_LOCK_SHA256="
if exist "%ENV_DIR%\package-lock.sha256" set /p "INSTALLED_LOCK_SHA256="<"%ENV_DIR%\package-lock.sha256"
for /f "usebackq delims=" %%H in (`powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "(Get-FileHash -LiteralPath $env:LOCK_FILE -Algorithm SHA256).Hash.ToLowerInvariant()"`) do set "CURRENT_LOCK_SHA256=%%H"
if not "%CURRENT_LOCK_SHA256%"=="%INSTALLED_LOCK_SHA256%" set "NEED_SETUP=1"

if "%NEED_SETUP%"=="1" (
  echo Project-local tools or dependencies need setup. Running setup.bat...
  call "%ROOT%setup.bat"
  if errorlevel 1 exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"
if not exist "%ENV_DIR%\tmp" mkdir "%ENV_DIR%\tmp"
if not exist "%ENV_DIR%\home" mkdir "%ENV_DIR%\home"
if not exist "%ENV_DIR%\node-gyp" mkdir "%ENV_DIR%\node-gyp"
set "TEMP=%ENV_DIR%\tmp"
set "TMP=%ENV_DIR%\tmp"
set "HOME=%ENV_DIR%\home"
set "npm_config_cache=%ENV_DIR%\npm-cache"
set "npm_config_userconfig=%ENV_DIR%\npmrc"
set "npm_config_globalconfig=%ENV_DIR%\npm-globalrc"
set "npm_package_config_node_gyp_devdir=%ENV_DIR%\node-gyp"
set "npm_config_update_notifier=false"

pushd "%APP_DIR%"
if "%~1"=="" (
  call "%NODE_DIR%\npm.cmd" start
) else (
  call "%NODE_DIR%\npm.cmd" start -- %*
)
set "START_EXIT=%ERRORLEVEL%"
popd
exit /b %START_EXIT%
