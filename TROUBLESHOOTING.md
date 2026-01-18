# 🔧 Troubleshooting Guide - "Failed to fetch" Error

## ❌ Error: `TypeError: Failed to fetch`

This error means **your React app cannot connect to the Django backend**.

---

## ✅ Solution: Quick Fix Checklist

### **Step 1: Is Django Running?**

Open a new terminal and run:
```bash
cd your-django-project
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

✅ If you see this → Django is running!
❌ If you see errors → Fix Django issues first

---

### **Step 2: Test Django is Working**

Open your browser and go to:
```
http://localhost:8000/admin/
```

✅ Should see Django admin login page
❌ If you get "Can't reach this page" → Django is not running

---

### **Step 3: Create Django Superuser (First Time Only)**

If you haven't created an admin user yet:
```bash
python manage.py createsuperuser
```

Enter:
- **Username:** `admin`
- **Email:** `admin@fuelabc.com`
- **Password:** `admin123`

---

### **Step 4: Test Django JWT Authentication**

Open a new terminal and test the login endpoint:

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Expected Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

✅ If you get tokens → Authentication is working!
❌ If you get error → Check Django settings below

---

## 🛠️ Common Issues & Fixes

### **Issue 1: Django Not Running**

**Error:** `Failed to fetch`

**Fix:**
```bash
cd your-django-project
python manage.py runserver
```

Keep this terminal open while using the React app!

---

### **Issue 2: Wrong Django Port**

**Error:** `Failed to fetch`

**Fix:** Check if Django is running on a different port

If Django shows:
```
Starting development server at http://127.0.0.1:8001/
```

Update React app URL in `/src/utils/http.js`:
```javascript
const API_BASE_URL = 'http://localhost:8001/api';  // Change port to 8001
```

---

### **Issue 3: JWT Endpoint Missing**

**Error:** `404 Not Found` for `/api/auth/token/`

**Fix:** Add JWT authentication to Django

**1. Install package:**
```bash
pip install djangorestframework-simplejwt
```

**2. Update `settings.py`:**
```python
INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

**3. Update main `urls.py`:**
```python
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # ... existing URLs
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

**4. Restart Django:**
```bash
python manage.py runserver
```

---

### **Issue 4: CORS Error**

**Error:** 
```
Access to fetch at 'http://localhost:8000/api/auth/token/' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Fix:** Enable CORS in Django

**1. Install package:**
```bash
pip install django-cors-headers
```

**2. Update `settings.py`:**
```python
INSTALLED_APPS = [
    # ... existing apps
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this FIRST
    'django.middleware.security.SecurityMiddleware',
    # ... rest of middleware
]

# Allow all origins (for development only)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# For production, use specific origins:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://localhost:5173",
# ]
```

**3. Restart Django:**
```bash
python manage.py runserver
```

---

### **Issue 5: No Superuser Created**

**Error:** `Invalid username or password` (after Django is running)

**Fix:** Create Django superuser
```bash
python manage.py createsuperuser
# Username: admin
# Password: admin123
```

---

### **Issue 6: Different API Base URL**

**Error:** `Failed to fetch`

**Fix:** Check your Django base URL

If your Django is at a different URL, update `/src/utils/http.js`:

```javascript
// For local Django
const API_BASE_URL = 'http://localhost:8000/api';

// For production
// const API_BASE_URL = 'https://your-domain.com/api';

// For custom port
// const API_BASE_URL = 'http://localhost:8001/api';
```

---

## 🧪 Testing Your Setup

### **Test 1: Django is Running**
```bash
curl http://localhost:8000/admin/
# Should return HTML
```

### **Test 2: JWT Login Works**
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Should return access and refresh tokens
```

### **Test 3: Protected Endpoint (with token)**
```bash
# First, get token from Test 2, then:
curl -X GET http://localhost:8000/api/dashboard/stats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
# Should return dashboard stats
```

---

## 📋 Complete Setup Checklist

- [ ] Django is running (`python manage.py runserver`)
- [ ] Django is accessible at `http://localhost:8000`
- [ ] `djangorestframework-simplejwt` is installed
- [ ] JWT endpoints are configured in `urls.py`
- [ ] `django-cors-headers` is installed
- [ ] CORS is configured in `settings.py`
- [ ] Django superuser is created (`username: admin, password: admin123`)
- [ ] React API URL matches Django URL (`/src/utils/http.js`)
- [ ] Both terminals are running (Django + React)

---

## 🚀 Correct Startup Sequence

### **Terminal 1: Django Backend**
```bash
cd your-django-project
python manage.py runserver
# Keep this running!
```

### **Terminal 2: React Frontend**
```bash
cd fuelabc-admin-panel
npm run dev
# Keep this running!
```

### **Browser:**
```
http://localhost:5173/login
```

**Login with:**
- Username: `admin`
- Password: `admin123`

---

## 🔍 Debug: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors

**Common Console Errors:**

### **Error: `Failed to fetch`**
→ Django is not running or wrong URL

### **Error: `CORS policy`**
→ CORS not configured in Django

### **Error: `401 Unauthorized`**
→ Wrong username/password or JWT not configured

### **Error: `404 Not Found`**
→ Endpoint doesn't exist in Django

---

## 📞 Still Not Working?

### **1. Check Both Services**
```bash
# Check Django
curl http://localhost:8000/admin/

# Check React
curl http://localhost:5173/
```

### **2. Check Ports**
Make sure nothing else is using ports 8000 or 5173

### **3. Clear Browser Cache**
```
1. Open DevTools (F12)
2. Right-click Refresh button
3. Click "Empty Cache and Hard Reload"
```

### **4. Check Django Console Output**
Look for errors in the terminal where Django is running

### **5. Verify Django Settings**
Make sure these are in your `settings.py`:
```python
INSTALLED_APPS = [
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

---

## ✅ Success!

Once you see:
```
✅ Django running at http://localhost:8000
✅ React running at http://localhost:5173
✅ Login successful
✅ Dashboard loads
```

You're all set! 🎉

---

## 📝 Quick Reference

**Django Commands:**
```bash
python manage.py runserver              # Start Django
python manage.py createsuperuser        # Create admin user
python manage.py migrate                # Run migrations
```

**React Commands:**
```bash
npm run dev                             # Start React
npm install                             # Install dependencies
```

**Test Endpoints:**
```bash
# Login
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Dashboard Stats (with token)
curl -X GET http://localhost:8000/api/dashboard/stats/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Most Common Fix

**90% of "Failed to fetch" errors are fixed by:**

1. Starting Django:
   ```bash
   python manage.py runserver
   ```

2. Making sure Django is at `http://localhost:8000`

3. Creating superuser if not exists:
   ```bash
   python manage.py createsuperuser
   ```

**That's it!** 🚀
