#!/bin/bash

# Heroku postbuild script for proper deployment
echo "🚀 Running heroku-postbuild script..."

# Build frontend
echo "📦 Building frontend..."
cd client
npx vite build --outDir ../dist/public --mode production
cd ..

# Build backend
echo "🔧 Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build completed!"