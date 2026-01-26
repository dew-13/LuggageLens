# BaggageLens - Multi-Access Setup Guide

## 🚀 Quick Start

### **Option 1: Local Development (Easiest)**

```bash
# Terminal 1 - Backend
cd backend
npm start
```

```bash
# Terminal 2 - Frontend  
cd web
npm start
```

**Access:** `http://localhost:3000`

---

### **Option 2: With ngrok (Public Access)**

#### **Step 1: Start Services Locally**

```bash
# Terminal 1 - Backend
cd backend
npm start
```

```bash
# Terminal 2 - Frontend
cd web
npm start
```

#### **Step 2: Create ngrok Tunnels**

```bash
# Terminal 3 - Backend ngrok tunnel
ngrok http 5000
```

Copy the URL (e.g., `https://abc123-xyz.ngrok.io`)

```bash
# Terminal 4 - Frontend ngrok tunnel
ngrok http 3000
```

Copy the URL (e.g., `https://def456-uvw.ngrok.io`)

#### **Step 3: Update Configuration**

**Update `web/.env`:**
```env
REACT_APP_API_URL=https://abc123-xyz.ngrok.io/api
```
(Replace with your Backend ngrok URL from Step 2)

**Backend `.env` is already configured** ✓

#### **Step 4: Access App**

Open your browser: `https://def456-uvw.ngrok.io`
(Use Frontend URL from Step 2)

---

### **Option 3: VS Code Dev Tunnels**

Same as ngrok but use Dev Tunnels URLs instead.

**Update `web/.env`:**
```env
REACT_APP_API_URL=https://your-backend-devtunnel.devtunnels.ms/api
```

---

## 📋 Access Methods Summary

| Method | Backend | Frontend | API URL |
|--------|---------|----------|---------|
| **Localhost** | `http://localhost:5000` | `http://localhost:3000` | `http://localhost:5000/api` |
| **ngrok** | `https://xxxx.ngrok.io` | `https://yyyy.ngrok.io` | `https://xxxx.ngrok.io/api` |
| **Dev Tunnels** | `https://xxxx.devtunnels.ms` | `https://yyyy.devtunnels.ms` | `https://xxxx.devtunnels.ms/api` |

---

## ✅ CORS Configuration

Backend CORS is already configured to accept:
- ✅ `http://localhost:3000`
- ✅ `https://*.ngrok.io`
- ✅ `https://*.devtunnels.ms`
- ✅ `https://*.gitpod.io`
- ✅ `https://*.github.dev`

**No backend changes needed!**

---

## 🔧 Troubleshooting

### API calls returning CORS errors?
- Check `REACT_APP_API_URL` in `web/.env`
- Make sure Backend `CORS_ORIGIN` includes your frontend URL
- **Restart frontend after changing .env**

### ngrok URLs expired?
- ngrok URLs change each session (unless you have Pro)
- Update `web/.env` with new URLs
- Restart frontend

### MongoDB connection failing?
- Atlas cluster should be active
- IP whitelist includes `0.0.0.0/0` ✓
- MONGO_URI is correct in `backend/.env` ✓

---

## 📝 Environment Variables

### **web/.env**
```env
# Only ONE of these should be active:
REACT_APP_API_URL=http://localhost:5000/api          # Local
# REACT_APP_API_URL=https://xxxx.ngrok.io/api        # ngrok
# REACT_APP_API_URL=https://xxxx.devtunnels.ms/api   # Dev Tunnels

REACT_APP_GOOGLE_CLIENT_ID=334957135392-2curpj1ki3placf80ktuogu5mtm16rmd.apps.googleusercontent.com
```

### **backend/.env**
```env
PORT=5000
CORS_ORIGIN=http://localhost:3000,https://*.ngrok.io,https://*.devtunnels.ms
MONGO_URI=mongodb+srv://admin:UT8MxnQC8sWzZiln@luggagelens-cluster.dx2hggt.mongodb.net/?appName=luggagelens-cluster
```

---

## 🎯 Tips

1. **Always start Backend first** - Frontend depends on it
2. **Keep ngrok windows open** - They show tunnel status
3. **Port 5000 & 3000 must be free** - Check with `netstat -an`
4. **MongoDB Atlas connection works globally** - No changes needed
5. **Save .env changes and restart frontend** - Important!
