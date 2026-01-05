# 🐧 Linux OS Integration Guide - Zenix Study Tracker

## ✅ **GOOD NEWS: ZERO INSTALLATIONS NEEDED!**

Your developers **DO NOT** need to install anything for the database! Everything is bundled and ready to use.

---

## 📦 **What's Already Included:**

- ✅ SQLite database (embedded, no server needed)
- ✅ All Node.js dependencies (in `node_modules`)
- ✅ Backend integrated into Electron
- ✅ Complete offline functionality

---

## 🚀 **For Your Linux OS Developers:**

### Option 1: Run as Standalone App (Recommended)

**Just run this command:**
```bash
cd "Frontend"
npm run electron:dev
```

**That's it!** The app will:
- Start automatically
- Create the SQLite database
- Run completely offline
- No installation needed

### Option 2: Build Linux Package

**To create distributable packages:**
```bash
cd Frontend
npm run electron:build:linux
```

This creates:
- **AppImage** (portable, works on any Linux distro)
- **DEB** package (for Debian/Ubuntu-based systems)

Output location: `Frontend/release/`

---

## 👤 **Where to See User Login Details?**

### Method 1: Check the SQLite Database

**Database Location:**
```
~/.config/zenix-study-tracker/zenix-study-tracker.db
```

**View users with SQLite command:**
```bash
# Install sqlite3 if needed (one-time only)
sudo apt install sqlite3

# Open database
sqlite3 ~/.config/zenix-study-tracker/zenix-study-tracker.db

# View all users
SELECT id, name, email, created_at FROM users;

# Exit
.quit
```

**Example output:**
```
id | name  | email           | created_at
---|-------|-----------------|---------------------------
1  | Ramit | ramit@gmail.com | 2026-01-05 21:35:12
```

### Method 2: Use DB Browser (GUI Tool)

```bash
# Install DB Browser for SQLite
sudo apt install sqlitebrowser

# Open the database
sqlitebrowser ~/.config/zenix-study-tracker/zenix-study-tracker.db
```

Then browse the `users` table to see all login details.

### Method 3: Check During Runtime (Dev Console)

When the app is running:
1. Open DevTools (F12 or Ctrl+Shift+I)
2. Go to **Console** tab
3. Type:
```javascript
localStorage.getItem('user')
```

This shows the currently logged-in user.

---

## 🗄️ **Database Structure:**

### Users Table:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,  -- (hashed with bcrypt)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Study Sessions Table:
```sql
CREATE TABLE study_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  type TEXT DEFAULT 'Study',
  duration INTEGER NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔐 **Current Test User:**

**Email:** `ramit@gmail.com`  
**Password:** (hashed in database)

**Note:** Passwords are encrypted with bcrypt for security. You cannot see the plain text password.

---

## 🔧 **Integration into Your Linux OS:**

### As a Pre-installed App:

1. **Copy the built AppImage to your OS:**
```bash
cp Frontend/release/zenix-study-tracker.AppImage /usr/local/bin/
chmod +x /usr/local/bin/zenix-study-tracker.AppImage
```

2. **Create desktop entry:**
```bash
sudo nano /usr/share/applications/zenix-study-tracker.desktop
```

```ini
[Desktop Entry]
Name=Zenix Study Tracker
Comment=Track your study sessions offline
Exec=/usr/local/bin/zenix-study-tracker.AppImage
Icon=zenix-study-tracker
Terminal=false
Type=Application
Categories=Education;Office;
```

3. **Done!** Users can now launch it from the app menu.

### As Part of Your OS Source:

1. **Copy the entire project to your OS repo:**
```bash
cp -r Zenix-Study-Tracker /path/to/your/os/apps/
```

2. **Add to your OS build script:**
```bash
cd apps/Zenix-Study-Tracker/Frontend
npm install
npm run electron:build:linux
```

3. **Include in OS installation:**
   - Copy AppImage to `/usr/local/bin/`
   - Copy desktop entry to `/usr/share/applications/`
   - Add to your OS app launcher

---

## 📂 **File Locations on Linux:**

| Item | Location |
|------|----------|
| Database | `~/.config/zenix-study-tracker/zenix-study-tracker.db` |
| User Preferences | `~/.config/zenix-study-tracker/` |
| App Config | `~/.config/zenix-study-tracker/` |
| Desktop Entry | `/usr/share/applications/zenix-study-tracker.desktop` |
| AppImage (if installed) | `/usr/local/bin/zenix-study-tracker.AppImage` |

---

## 🔍 **Quick Commands for Developers:**

### View Current User:
```bash
# Via SQLite
sqlite3 ~/.config/zenix-study-tracker/zenix-study-tracker.db "SELECT * FROM users;"

# Via Node.js (in project directory)
node -e "console.log(require('child_process').execSync('sqlite3 ~/.config/zenix-study-tracker/zenix-study-tracker.db \"SELECT * FROM users;\"').toString())"
```

### View All Sessions:
```bash
sqlite3 ~/.config/zenix-study-tracker/zenix-study-tracker.db "SELECT * FROM study_sessions;"
```

### Reset Database (for testing):
```bash
rm ~/.config/zenix-study-tracker/zenix-study-tracker.db
# App will create a new one on next launch
```

---

## 🛠️ **Dependencies Already Included:**

✅ **No external database server needed**  
✅ **No MongoDB installation**  
✅ **No PostgreSQL**  
✅ **No MySQL**  

The SQLite library is already included in the `node_modules` and will be bundled with Electron.

---

## 📝 **For Your OS Documentation:**

**System Requirements:**
- Linux (any modern distro)
- No additional software needed
- Works completely offline

**Installation:**
- Double-click the AppImage, or
- Run from terminal, or
- Pre-installed in OS

**Data Storage:**
- All data stored locally in `~/.config/zenix-study-tracker/`
- No cloud, no internet required
- Fully private and offline

---

## 🎯 **Summary for Your Developers:**

| Question | Answer |
|----------|--------|
| Need to install database? | ❌ NO - SQLite is embedded |
| Need internet? | ❌ NO - Fully offline |
| Need MongoDB/MySQL? | ❌ NO - Uses SQLite |
| Where are user details? | `~/.config/zenix-study-tracker/zenix-study-tracker.db` |
| How to view users? | Use `sqlite3` command or DB Browser |
| Can we integrate directly? | ✅ YES - Copy AppImage or include in build |
| Dependencies needed? | ❌ NO - Everything bundled |

---

## 🚀 **Quick Start for Testing:**

```bash
# 1. Go to project
cd "d:\StudentOS Project\Zenix-Study-Tracker\Frontend"

# 2. Run the app
npm run electron:dev

# 3. Login with test account or create new user

# 4. Check database (in another terminal)
sqlite3 ~/.config/zenix-study-tracker/zenix-study-tracker.db "SELECT * FROM users;"
```

---

**That's it! Your developers can integrate this with ZERO installations!** 🎉

The app is 100% self-contained and ready to ship with your Linux OS!
