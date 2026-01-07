# Zenix Study Tracker - Fully Offline Linux Application

## 🔒 100% OFFLINE - Zero Network Required

This application is **completely offline** and requires **0 kbps** internet bandwidth. All features work locally using:
- **Local SQLite Database** - All data stored on your machine
- **Localhost-only Backend** - Express server bound to 127.0.0.1
- **System Fonts** - No external font CDN
- **Bundled Dependencies** - All packages included in build
- **Network Blocking** - Electron blocks all external network requests

## 🐧 Linux Installation (Student OS)

### Option 1: AppImage (Universal)
```bash
chmod +x Zenix-Study-Tracker-*.AppImage
./Zenix-Study-Tracker-*.AppImage
```

### Option 2: Debian Package
```bash
sudo dpkg -i zenix-study-tracker_*.deb
zenix-study-tracker
```

## 🛠️ Building for Linux (Offline)

### Prerequisites
```bash
# Install dependencies ONCE (online)
cd Frontend
npm install
cd ../Backend
npm install
```

### Build Offline Package
```bash
cd Frontend
npm run electron:build:linux
```

The build will create:
- **AppImage**: `Frontend/release/Zenix-Study-Tracker-*.AppImage`
- **DEB Package**: `Frontend/release/zenix-study-tracker_*.deb`

## 📦 What's Included (All Offline)
- ✅ Electron app with embedded backend
- ✅ SQLite database (stored in user data directory)
- ✅ All Node.js dependencies bundled
- ✅ System fonts (no external CDN)
- ✅ Localhost-only server (127.0.0.1:5000)

## 🔐 Security Features
- Content Security Policy blocks external resources
- Backend binds only to localhost (127.0.0.1)
- Network filter blocks all non-localhost requests
- No telemetry, analytics, or tracking
- No auto-updates or version checks

## 🗂️ Data Storage (Linux Paths)
- **Database**: `~/.config/zenix-study-tracker/study_tracker.db`
- **Logs**: `~/.config/zenix-study-tracker/logs/`
- **Settings**: `~/.config/zenix-study-tracker/settings.json`

## 🚀 Running in Student OS

### As Standalone App
```bash
zenix-study-tracker
```

### From AppImage
```bash
./Zenix-Study-Tracker-*.AppImage
```

## ⚡ Performance on Linux
- **RAM Usage**: ~150-200 MB
- **Disk Space**: ~200 MB installed
- **CPU**: Minimal (idle: <1%)
- **Network**: 0 bytes (completely offline)

## 🔧 Troubleshooting

### App won't start
```bash
# Check if port 5000 is available
netstat -tuln | grep 5000

# Run with verbose logging
ELECTRON_ENABLE_LOGGING=1 zenix-study-tracker
```

### Database locked
```bash
# Close all instances and restart
pkill zenix-study-tracker
zenix-study-tracker
```

## 📋 System Requirements
- **OS**: Linux (any distribution)
- **RAM**: 512 MB minimum, 1 GB recommended
- **Disk**: 300 MB free space
- **Network**: None required (0 kbps)

## 🎓 Perfect for Student OS
- Works completely offline
- Lightweight and fast
- No internet distractions
- Privacy-focused (all data local)
- Open source backend

---

**Note**: This app is designed for the Student OS environment where internet access may be limited or intentionally restricted for focused study sessions.
