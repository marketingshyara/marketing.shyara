@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo Dependencies missing. From this folder run: npm install
  exit /b 1
)

set "NODE_EXE="
for /f "delims=" %%i in ('where node 2^>nul') do (
  set "NODE_EXE=%%i"
  goto :have_node
)
if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe" & goto :have_node
if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe" & goto :have_node

echo Node.js not found. Install LTS from https://nodejs.org/ or run: winget install OpenJS.NodeJS.LTS
exit /b 1

:have_node
cd frontend
"%NODE_EXE%" "..\node_modules\vite\bin\vite.js" --host localhost --port 8080
endlocal
