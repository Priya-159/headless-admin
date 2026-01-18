# 🚀 Quick Start - Fix "Failed to fetch" Error

## ⚡ 3-Step Fix

### **Step 1: Start Django Backend**
```bash
# Open Terminal 1
cd your-django-project
python manage.py runserver
```

✅ **You should see:** `Starting development server at http://127.0.0.1:8000/`

---

### **Step 2: Create Django Admin User (First Time Only)**
```bash
# In the same terminal or a new one
python manage.py createsuperuser
```

**Enter these values:**
```
Username: admin
Email: admin@fuelabc.com
Password: admin123
Password (again): admin123
```

---

### **Step 3: Start React Frontend**
```bash
# Open Terminal 2 (keep Django running in Terminal 1!)
npm run dev
```

✅ **You should see:** `Local: http://localhost:5173/`

---

## 🌐 Open Browser

Go to: **http://localhost:5173/login**

**Login with:**
- Username: `admin`
- Password: `admin123`

---

## ❌ Still Getting "Failed to fetch"?

### **Check 1: Is Django Running?**
Open browser: http://localhost:8000/admin/
- ✅ See Django admin page? → Good!
- ❌ Can't connect? → Django is not running

### **Check 2: Test Django Login Endpoint**
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Should return:**
```json
{
  "access": "eyJ0yXAi...",
  "refresh": "eyJ0yXAi..."
}
```

---

## 🔧 Install Django Dependencies (If Needed)

If Django endpoints don't work, install required packages:

```bash
pip install djangorestframework djangorestframework-simplejwt django-cors-headers
```

Then add to `settings.py`:
```python
INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add FIRST
    # ... existing middleware
]

CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

And add to main `urls.py`:
```python
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # ... existing URLs
    path('api/auth/token/', TokenObtainPairView.as_view()),
    path('api/auth/token/refresh/', TokenRefreshView.as_view()),
]
```

Restart Django:
```bash
python manage.py runserver
```

---

## 📋 Checklist

- [ ] Django running in Terminal 1
- [ ] React running in Terminal 2
- [ ] Django accessible at http://localhost:8000
- [ ] React accessible at http://localhost:5173
- [ ] Admin user created (`admin` / `admin123`)
- [ ] JWT endpoints working
- [ ] CORS enabled

---

## ✅ Success!

If login works, you're done! 🎉

Check `/TROUBLESHOOTING.md` for detailed help.
Check `/DJANGO_INTEGRATION_GUIDE.md` for complete API setup.

---

## 🎯 Remember

**Always keep BOTH terminals running:**
1. Terminal 1: Django (`python manage.py runserver`)
2. Terminal 2: React (`npm run dev`)

**Don't close these terminals while using the app!**
