# How to Restart Everything - Quick Guide

## 🚀 Quick Restart (Easiest Way)

### Option 1: Use the Batch File (Recommended)
Double-click **`restart-all.bat`** in the project root folder.

This will:
- Stop all running services
- Start backend in a new window
- Start frontend in a new window
- Show you the URLs

### Option 2: Use PowerShell Script
```powershell
.\start-all-services.ps1
```

---

## 📋 Manual Restart Steps

### Step 1: Stop Services

**Option A: Use Batch File**
```cmd
stop-all.bat
```

**Option B: Manual Stop**
- Find the backend window (shows "uvicorn")
- Press `Ctrl+C` to stop it
- Find the frontend window (shows "vite" or "npm")
- Press `Ctrl+C` to stop it

**Option C: Kill Processes**
```cmd
taskkill /F /IM python.exe
taskkill /F /IM node.exe
```

### Step 2: Start Services

**Option A: Use Batch File**
```cmd
start-all.bat
```

**Option B: Manual Start**

**Backend:**
```cmd
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (in a new terminal):**
```cmd
cd frontend
npm run dev
```

---

## 🔄 Restart Scripts Available

### 1. `restart-all.bat` ⭐ **RECOMMENDED**
- Stops everything
- Starts everything
- Opens windows automatically
- **Just double-click it!**

### 2. `start-all.bat`
- Starts services (doesn't stop first)
- Use if services aren't running

### 3. `stop-all.bat`
- Stops all services
- Use to clean up

### 4. `start-all-services.ps1` (PowerShell)
- PowerShell version
- More features than batch file

---

## ✅ Verify Services Are Running

### Check Backend:
Open browser: http://localhost:8000/api/v1/health
Should show: `{"status":"healthy",...}`

### Check Frontend:
Open browser: http://localhost:5173
Should show: BSG Demo Platform homepage

### Check API Docs:
Open browser: http://localhost:8000/docs
Should show: Swagger API documentation

---

## 🐛 Troubleshooting

### Port Already in Use
If you see "port already in use":
1. Run `stop-all.bat` first
2. Wait 5 seconds
3. Run `start-all.bat`

### Services Won't Start
1. Check if Python is installed: `python --version`
2. Check if Node is installed: `node --version`
3. Check if dependencies are installed:
   ```cmd
   cd backend
   pip install -r requirements.txt
   
   cd ..\frontend
   npm install
   ```

### Backend Errors
- Check the backend window for error messages
- Make sure Azure CLI is logged in: `az account show`
- Check database connection

### Frontend Errors
- Check the frontend window for error messages
- Make sure backend is running first
- Clear browser cache and refresh

---

## 📝 Quick Reference

| Action | Command |
|--------|---------|
| **Restart Everything** | `restart-all.bat` |
| **Start Services** | `start-all.bat` |
| **Stop Services** | `stop-all.bat` |
| **Backend Only** | `cd backend && python -m uvicorn app.main:app --reload` |
| **Frontend Only** | `cd frontend && npm run dev` |

---

## 🎯 After Restart

1. Wait 10-15 seconds for services to start
2. Open: http://localhost:5173
3. Go to: **Demo → Deployment Analyzer**
4. Connect to Azure
5. Select resource groups
6. **Namespaces should now appear!** 🎉

---

## 💡 Tips

- **Keep the windows open** - They show logs and errors
- **Use `--reload` flag** - Backend auto-reloads on code changes
- **Check logs** - Error messages appear in the windows
- **Restart after Azure login** - Backend needs restart after `az login`

---

## 🔗 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

---

**That's it! Just double-click `restart-all.bat` whenever you need to restart!** 🚀

