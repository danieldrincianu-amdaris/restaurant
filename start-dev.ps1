# RestaurantFlow Development Server Starter
# Runs `pnpm dev` in a separate window to avoid terminal interference

Write-Host "Starting RestaurantFlow development servers..." -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'RestaurantFlow Dev Servers' -ForegroundColor Yellow; pnpm dev" -WindowStyle Normal

Write-Host "Development servers started in separate window!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Close the window or press Ctrl+C in it to stop the servers." -ForegroundColor Gray
