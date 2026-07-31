# 📸 RENDER DEPLOYMENT - VISUAL QUICK REFERENCE

## 🎯 EXACT COMMANDS TO COPY-PASTE

Keep this guide open while deploying!

---

## 1️⃣ BUILD COMMAND

**What to enter in "Build Command" field:**

```
pip install -r backend/requirements.txt
```

**Click in the field and paste exactly this ⬆️**

---

## 2️⃣ START COMMAND  

**What to enter in "Start Command" field:**

```
cd backend && gunicorn main:app
```

**Click in the field and paste exactly this ⬆️**

---

## 3️⃣ ENVIRONMENT VARIABLES

**Add TWO variables:**

### Variable #1
```
Key:   JWT_SECRET_KEY
Value: your-secret-key-change-this-123456789
```

### Variable #2 (Render adds automatically)
```
Key:   DATABASE_URL
Value: (Leave empty or it's auto-filled)
```

---

## ✅ DEPLOYMENT FLOW

```
1. Go to https://dashboard.render.com
   ↓
2. Click "New +" → "Web Service"
   ↓
3. Connect GitHub repo
   ↓
4. Enter Name: delivery-app-backend
   ↓
5. Select Environment: Python 3
   ↓
6. Build Command: pip install -r backend/requirements.txt
   ↓
7. Start Command: cd backend && gunicorn main:app
   ↓
8. Click Advanced → Add Environment Variables
   ↓
9. Add: JWT_SECRET_KEY = your-secret-key
   ↓
10. Click "Create Web Service"
    ↓
11. Wait 3-5 minutes for deployment
    ↓
12. Get Backend URL from dashboard
    ↓
13. Update frontend/app.js with URL
    ↓
14. Deploy frontend
    ↓
15. Test in browser
```

---

## 🔗 ENVIRONMENT VARIABLES TABLE

| Key | Value | Notes |
|-----|-------|-------|
| `JWT_SECRET_KEY` | `your-secret-here` | Change this! |
| `DATABASE_URL` | Auto-filled | Render provides |

---

## ❌ TROUBLESHOOTING CHECKLIST

```
❌ Build failed?
   ✅ Check backend/requirements.txt has all packages

❌ Start command error?
   ✅ Make sure it's: cd backend && gunicorn main:app

❌ Port error?
   ✅ Already fixed in main.py ✓

❌ Database error?
   ✅ Create PostgreSQL in Render Data section

❌ CORS error on frontend?
   ✅ Update frontend/app.js with your backend URL

❌ Deployment stuck?
   ✅ Click Redeploy button
```

---

## 🧪 TEST AFTER DEPLOYMENT

### Test Backend:
Open in browser:
```
https://delivery-app-backend.onrender.com/api/health
```

Should show:
```json
{"status": "Backend is running!"}
```

### Initialize Database:
Open in browser:
```
https://delivery-app-backend.onrender.com/api/init-db
```

### Test Frontend:
Open your frontend URL and:
- Try to sign up
- Try to login
- Browse restaurants

---

## 📋 BEFORE YOU DEPLOY

Run this checklist:

- [ ] All files pushed to GitHub
- [ ] backend/requirements.txt exists
- [ ] backend/main.py is updated
- [ ] backend/Procfile exists with: `web: gunicorn main:app`
- [ ] frontend/app.js has API_URL logic
- [ ] .gitignore file created

---

## 🚀 MOST IMPORTANT COMMANDS

**Just copy these TWO commands:**

**Command 1 (Build):**
```
pip install -r backend/requirements.txt
```

**Command 2 (Start):**
```
cd backend && gunicorn main:app
```

**That's all you need! The rest is clicking buttons!** ✅

---

## 📞 IF SOMETHING GOES WRONG

1. Check **Logs** tab in Render (most errors shown there)
2. Look for "Error" or "Failed" in logs
3. Read the error message carefully
4. Click **Redeploy** to try again
5. Check that files are in right folders:
   - `backend/main.py` ✓
   - `backend/requirements.txt` ✓
   - `backend/Procfile` ✓
   - `frontend/app.js` ✓

---

**Good luck! You've got this! 🎉**
