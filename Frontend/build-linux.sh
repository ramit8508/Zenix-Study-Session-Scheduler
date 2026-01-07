#!/bin/bash
# Quick build and test script for Linux

echo "🔨 Building Zenix Study Tracker for Linux..."
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🏗️ Building application..."
npm run electron:build:linux

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📍 AppImage location: release/"
    echo ""
    echo "To run the AppImage:"
    echo "  cd release"
    echo "  chmod +x *.AppImage"
    echo "  ./*.AppImage --no-sandbox"
    echo ""
    
    # Make AppImage executable automatically
    if [ -f release/*.AppImage ]; then
        chmod +x release/*.AppImage
        echo "✅ AppImage made executable"
        echo ""
        echo "🚀 You can now run: ./release/*.AppImage --no-sandbox"
    fi
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
