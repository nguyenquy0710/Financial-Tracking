@echo off
setlocal EnableDelayedExpansion
chcp 65001 > nul
cls

:: Get and show current branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%i
echo === You are on branch: !current_branch!
echo.

:: Fetch latest from origin
echo === Fetching latest from origin ===
git fetch origin
echo.

:: Merge 'origin/main' into current branch
echo === Merging 'origin/main' into !current_branch! ===
git merge origin/main
echo.

:: Done
echo === Merge complete ===
pause
endlocal
