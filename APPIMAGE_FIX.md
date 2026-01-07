# AppImage Fix and Performance Improvements

## Fixed Issues

### 1. **AppImage Not Opening**
- ✅ Added `--no-sandbox` flag to AppImage desktop entry
- ✅ Configured proper Linux permissions and execution settings
- ✅ Added desktop integration with proper startup class
- ✅ Set correct executable permissions

### 2. **Performance Improvements**
- ✅ Enabled hardware acceleration (GPU rasterization)
- ✅ Enabled zero-copy rendering for faster graphics
- ✅ Optimized V8 cache with 'code' option
- ✅ Disabled renderer backgrounding for better responsiveness
- ✅ Added Vite build optimizations:
  - Terser minification with console/debugger removal
  - Code splitting for react-vendor and icons
  - Disabled sourcemaps for smaller bundle size
- ✅ Disabled spell checking to reduce memory usage
- ✅ Disabled unnecessary features (WebSQL, etc.)

## How to Build and Run

### Building AppImage:

```bash
cd Frontend
npm install
npm run electron:build:linux
```

### Running the AppImage:

#### Option 1: Direct execution (recommended)
```bash
cd Frontend/release
chmod +x *.AppImage
./*.AppImage --no-sandbox
```

#### Option 2: Using the launch script
```bash
cd Frontend
chmod +x zenix-study-tracker.sh
./zenix-study-tracker.sh
```

### Making AppImage executable permanently:

```bash
cd Frontend/release
chmod +x Zenix-Study-Tracker-*.AppImage
```

## Common Issues and Solutions

### Issue: "AppImage won't open when double-clicked"
**Solution:** 
1. Right-click the AppImage → Properties → Permissions
2. Check "Allow executing file as program"
3. Or run: `chmod +x Zenix-Study-Tracker-*.AppImage`

### Issue: "Sandbox error on older Linux systems"
**Solution:** The AppImage now includes `--no-sandbox` flag by default. If issues persist, run manually:
```bash
./Zenix-Study-Tracker-*.AppImage --no-sandbox
```

### Issue: "App feels slow or laggy"
**Solution:** The performance improvements are now built-in:
- Hardware acceleration enabled
- Optimized chunk loading
- Minified production build
- V8 code caching enabled

### Issue: "Missing icon or desktop integration"
**Solution:** Ensure you have an icon file at `Frontend/public/icon.png`. If not, create a 512x512 PNG icon.

## Performance Tips

1. **Clear electron cache** (if app is slow after updates):
   ```bash
   rm -rf ~/.config/zenix-study-tracker/Cache/*
   ```

2. **Check if hardware acceleration is working:**
   - Open DevTools (Ctrl+Shift+I in development)
   - Go to chrome://gpu in the URL bar
   - Verify GPU acceleration is enabled

3. **Monitor performance:**
   - Open DevTools → Performance tab
   - Record and analyze slow operations
   - Check Network tab to ensure all requests are local

## Technical Details

### Changes Made:

1. **package.json:**
   - Added comprehensive Linux and AppImage configuration
   - Desktop integration with proper categories
   - No-sandbox execution by default

2. **vite.config.js:**
   - Terser minification with dead code elimination
   - Manual code splitting for vendors
   - Disabled sourcemaps for production

3. **electron/main.js:**
   - Hardware acceleration flags
   - GPU rasterization enabled
   - Zero-copy rendering
   - V8 code caching
   - Optimized window settings

## Verification

After building, verify the AppImage:
```bash
file Zenix-Study-Tracker-*.AppImage  # Should show: ELF 64-bit LSB executable
./Zenix-Study-Tracker-*.AppImage --appimage-help  # Shows AppImage options
```

The app should now start faster and run smoother on Linux systems!
