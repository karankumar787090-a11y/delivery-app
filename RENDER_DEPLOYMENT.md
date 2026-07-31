# 🚀 RENDER DEPLOYMENT GUIDE

Complete step-by-step guide to deploy your Food Delivery App on Render.

---

## 📋 PREREQUISITES

- ✅ GitHub account with your repo pushed
- ✅ Render account (free at https://render.com)
- ✅ All files ready in backend and frontend

---

## 🔧 STEP 1: Prepare Backend for Deployment

### Files Already Created:
- ✅ `backend/requirements.txt` - Dependencies
- ✅ `backend/Procfile` - Render configuration
- ✅ `backend/main.py` - Updated for environment variables

### What's configured:
```python
✓ DATABASE_URL from environment (supports PostgreSQL)
✓ JWT_SECRET_KEY from environment
✓ PORT from environment (Render assigns dynamically)
✓ Debug mode disabled (debug=False)
✓ Host set to 0.0.0.0 (listens on all interfaces)
```

---

## 📁 STEP 2: Push to GitHub

Make sure all files are on GitHub:

```bash
cd "C:\Users\karan\OneDrive\Desktop\delivery app"

# Initialize git if not done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Push to GitHub
git push origin main
```

---

## 🌐 STEP 3: Deploy Backend on Render

### 3.1 Create New Web Service

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect a GitHub repository"**
4. Search and select your `delivery-app` repo
5. Click **Connect**

### 3.2 Configure Deployment

**Fill in these details:**

| Field | Value |
|-------|-------|
| **Name** | `delivery-app-backend` (or your choice) |
| **Environment** | `Python 3` |
| **Region** | `Frankfurt (eu-central-1)` (choose closest to you) |
| **Branch** | `main` |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `cd backend && gunicorn main:app` |

### 3.3 Add Environment Variables

Click **"Advanced"** and add:

```
DATABASE_URL = postgresql://username:password@hostname/dbname
JWT_SECRET_KEY = your-super-secret-key-here-123456
```

**To get PostgreSQL URL:**
- Keep FREE tier (includes free PostgreSQL)
- Render will provide DATABASE_URL automatically

### 3.4 Deploy

Click **"Create Web Service"** and wait for deployment to complete!

✅ You'll get a URL like: `https://delivery-app-backend.onrender.com`

---

## 🎨 STEP 4: Deploy Frontend

### 4.1 Update Frontend API URL

Open `frontend/app.js`:

```javascript
// Find this line:
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://delivery-app-backend.onrender.com/api';  // ← UPDATE THIS

// Replace with your actual backend URL from Render:
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://YOUR-BACKEND-URL.onrender.com/api';
```

### 4.2 Option A: Deploy to Render (Recommended)

1. Create `frontend/package.json`:

```json
{
  "name": "delivery-app-frontend",
  "version": "1.0.0",
  "scripts": {
    "serve": "http-server -p 3000"
  }
}
```

2. Create `frontend/build-script.sh`:

```bash
echo "Frontend is ready for deployment"
```

3. In Render Dashboard:
   - Click **"New +"** → **"Static Site"**
   - Connect GitHub repo
   - Build Command: `npm install -g http-server`
   - Publish Directory: `frontend`

Or use option B below.

### 4.2 Option B: Deploy Frontend to Netlify (Free Alternative)

1. Go to **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Select GitHub → Choose your repo
4. **Build settings:**
   - Build command: (leave empty)
   - Publish directory: `frontend`
5. Click **"Deploy"**

---

## ✅ STEP 5: Test Deployment

### Test Backend Health Check:
```
GET https://your-backend-url.onrender.com/api/health
```
Should return: `{"status": "Backend is running!"}`

### Test Frontend:
Open the frontend URL from Netlify/Render in your browser
- Update `app.js` with your backend URL
- Test signup
- Test login
- Browse restaurants
- Place orders

---

## 🗄️ STEP 6: Initialize Database (First Time)

### Option A: Via API Call

```bash
curl -X POST https://your-backend-url.onrender.com/api/init-db
```

### Option B: Via Admin Panel

1. Login as admin:
   ```
   Email: admin@delivery.com
   Password: admin123
   ```

2. You'll see sample data loaded

---

## 🔐 IMPORTANT SECURITY NOTES

### Change These Values in Production:

1. **JWT_SECRET_KEY** (in Render environment variables)
   ```
   JWT_SECRET_KEY = generate-a-random-string-here
   ```

2. **Admin Password** (in database)
   - Connect to PostgreSQL and update admin password

3. **CORS Settings** (update in main.py if needed)
   ```python
   CORS(app, origins=["https://your-frontend-url.netlify.app"])
   ```

---

## 📊 FINAL STRUCTURE

```
GitHub Repository
│
├── backend/
│   ├── main.py (Updated for Render)
│   ├── requirements.txt (With gunicorn)
│   └── Procfile
│
├── frontend/
│   ├── index.html
│   ├── app.js (Updated with backend URL)
│   ├── style.css
│   └── package.json
│
├── Dependencies/
│   └── requrement.txt
│
├── .gitignore (Created)
├── README.md
├── SETUP_GUIDE.md
└── RENDER_DEPLOYMENT.md (This file)
```

---

## 🌍 LIVE URLS (After Deployment)

- **Backend API**: `https://your-backend-url.onrender.com`
- **Frontend**: `https://your-frontend-url.netlify.app` or Render

---

## 🐛 TROUBLESHOOTING

### Issue: Backend not starting
- Check Build Command: `pip install -r backend/requirements.txt`
- Check Start Command: `cd backend && gunicorn main:app`
- Check logs in Render Dashboard

### Issue: CORS error
- Backend is running but frontend can't reach it
- Update `API_URL` in `frontend/app.js` with correct backend URL

### Issue: Database connection error
- PostgreSQL not enabled in Render
- Add `DATABASE_URL` environment variable
- Render provides free PostgreSQL automatically

### Issue: Frontend not loading
- Build directory is wrong (should be `frontend`)
- Check if API_URL is updated correctly

---

## 📈 MONITORING & LOGS

### View Backend Logs:
1. Render Dashboard → Select your web service
2. Click **"Logs"** tab
3. See real-time logs

### View Deployment Status:
- Click **"Events"** tab
- See build and deployment status

---

## 💰 PRICING (Free Tier)

- **Render Web Service**: Free (with limitations)
- **Render PostgreSQL**: Free
- **Netlify Frontend**: Free
- **Total Cost**: $0 for hobby projects

---

## 🚀 NEXT STEPS

1. ✅ Update backend on Render
2. ✅ Update frontend URL in app.js
3. ✅ Deploy frontend
4. ✅ Test full flow
5. ✅ Share with friends!

---

## 📞 GETTING HELP

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **GitHub Actions**: https://github.com/features/actions

---

**Your app is now LIVE on the internet! 🎉**

Share your URLs with the world!
