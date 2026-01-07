#!/bin/bash
# Zenix Study Tracker Launch Script for Linux
# This script ensures proper permissions and launches the app with --no-sandbox flag

# Get the directory where the script is located
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Make the AppImage executable if it exists
if [ -f "$DIR/release/"*.AppImage ]; then
    chmod +x "$DIR/release/"*.AppImage
    # Launch with no-sandbox for better compatibility
    "$DIR/release/"*.AppImage --no-sandbox "$@"
else
    echo "AppImage not found. Please build the application first using: npm run electron:build:linux"
    exit 1
fi
