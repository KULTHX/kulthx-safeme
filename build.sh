#!/bin/bash

# Build script for Koyeb deployment
echo "🚀 Building KULTHX SAFEME..."

# Create dist directory
mkdir -p dist

# Build frontend from client directory
echo "📦 Building frontend..."
cd client
npx vite build --outDir ../dist/public
cd ..

# Build backend
echo "🔧 Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build completed!"
ls -la dist/