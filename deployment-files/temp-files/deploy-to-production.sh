#!/bin/bash

echo "🚀 AKC CRM One-Click Production Deployment"
echo "=========================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js first from https://nodejs.org/"
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud SDK is not installed"
    echo "Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ Prerequisites checked"
echo ""

# Step 1: Generate environment variables
echo "📋 Step 1: Generating secure environment variables..."
node setup-deployment-env.cjs

echo ""
echo "📋 Step 2: Installing dependencies..."
npm install

echo ""
echo "📋 Step 3: Building the application..."
npm run build

echo ""
echo "📋 Step 4: Deploying to Google Cloud Run..."
gcloud run deploy project-crew-connect \
  --source . \
  --region us-east5 \
  --allow-unauthenticated

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: You still need to:"
echo "1. Run the sessions table migration in Supabase"
echo "2. Set the environment variables using the gcloud command from setup-deployment-env.js"
echo ""
echo "Your app will be available at: https://project-crew-connect-1061142868787.us-east5.run.app"
