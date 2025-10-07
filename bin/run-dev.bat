:: =============================================================================
:: Script: run-dev.bat
:: Description: Start the development environment for the project.
:: Author: Nguyen Quy
:: Date: 2025-10-07
:: Version: 1.0
:: Last Updated: 2025-10-07
:: Dependencies: Node.js, npm, MongoDB, nssm (Non-Sucking Service Manager)
:: Usage: Just double-click this script or run it from the command line.
:: =============================================================================

@echo off
setlocal EnableDelayedExpansion
chcp 65001 > nul
cls

:: Show current directory
echo === Current Directory: %cd%
echo .

:: Check MongoDB service status
echo === Checking MongoDB service (nqdev-mongodb-service) status ===
sc query "nqdev-mongodb-service" | findstr /i "RUNNING" > nul
if errorlevel 1 (
    echo MongoDB service is NOT running. Starting service...
    nssm start nqdev-mongodb-service
    timeout /t 5 /nobreak > nul
) else (
    echo MongoDB service is already running.
)

:: Check if node_modules folder exists
if not exist node_modules (
    echo === node_modules not found. Installing npm packages ===
    call npm install --force --no-audit --no-fund --loglevel error
    if %ERRORLEVEL% NEQ 0 (
        echo !!! npm install failed. Please check the errors above.
        goto end
    )
) else (
    echo === node_modules already exists. Skipping npm install ===
)

:: Run code formatter
echo === Running code formatter ===
call npm run format
if %ERRORLEVEL% NEQ 0 (
    echo !!! npm run format failed. Please check the errors above.
    goto end
)

:: Run lint fix
echo === Running lint fix ===
call npm run lint:fix
if %ERRORLEVEL% NEQ 0 (
    echo !!! npm run lint:fix failed. Please check the errors above.
    goto end
)

:: Run development server
echo === Starting development server ===
call npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo !!! npm run dev failed. Please check the errors above.
    goto end
)

:end
echo.
echo === All done ===
pause
endlocal
