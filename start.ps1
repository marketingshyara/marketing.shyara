# Shyara Marketing - Development Server Launcher
# This script starts the development server and opens the website in your browser

Write-Host "Starting Shyara Marketing development server..." -ForegroundColor Green

# Start the development server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Wait a few seconds for the server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open the browser to the local development URL
$url = "http://localhost:8080"
Write-Host "Opening browser at $url" -ForegroundColor Green
Start-Process $url

Write-Host "`nDevelopment server is running!" -ForegroundColor Green
Write-Host "Press Ctrl+C in the server window to stop the server." -ForegroundColor Yellow

