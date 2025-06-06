Write-Host "🔧 Testing Docker build locally..." -ForegroundColor Yellow

# Build the Docker image
Write-Host "`nBuilding Docker image..." -ForegroundColor White
docker build -t test-app .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker build successful!" -ForegroundColor Green

# Test running the container
Write-Host "`nTesting container startup..." -ForegroundColor White
docker run -d `
  --name test-container `
  -p 8080:8080 `
  -e PORT=8080 `
  -e GOOGLE_MAPS_API_KEY=test-key `
  test-app

# Wait for container to start
Start-Sleep -Seconds 5

# Check if container is running
$running = docker ps --format "table {{.Names}}" | Select-String "test-container"
if ($running) {
    Write-Host "✅ Container is running!" -ForegroundColor Green

    # Test health endpoint
    Write-Host "`nTesting health endpoint..." -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri http://localhost:8080/health -UseBasicParsing
        Write-Host "✅ Health check passed: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    }

    # Show logs
    Write-Host "`nContainer logs:" -ForegroundColor Yellow
    docker logs test-container
} else {
    Write-Host "❌ Container failed to start!" -ForegroundColor Red
    Write-Host "`nContainer logs:" -ForegroundColor Yellow
    docker logs test-container
}

# Cleanup
Write-Host "`nCleaning up..." -ForegroundColor White
docker stop test-container 2>$null
docker rm test-container 2>$null

Write-Host "`nTest complete!" -ForegroundColor Green
