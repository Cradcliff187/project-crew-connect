#!/bin/bash

echo "🔧 Testing Docker build locally..."

# Build the Docker image
echo "Building Docker image..."
docker build -t test-app . || { echo "❌ Docker build failed"; exit 1; }

echo "✅ Docker build successful!"

# Test running the container
echo "Testing container startup..."
docker run -d \
  --name test-container \
  -p 8080:8080 \
  -e PORT=8080 \
  -e GOOGLE_MAPS_API_KEY=test-key \
  test-app

# Wait for container to start
sleep 5

# Check if container is running
if docker ps | grep -q test-container; then
  echo "✅ Container is running!"

  # Test health endpoint
  echo "Testing health endpoint..."
  curl -f http://localhost:8080/health || echo "❌ Health check failed"

  # Show logs
  echo "Container logs:"
  docker logs test-container
else
  echo "❌ Container failed to start!"
  echo "Container logs:"
  docker logs test-container
fi

# Cleanup
echo "Cleaning up..."
docker stop test-container 2>/dev/null
docker rm test-container 2>/dev/null

echo "Test complete!"
