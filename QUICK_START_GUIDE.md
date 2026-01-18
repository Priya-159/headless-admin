# ⚡ Quick Start Guide - FuelABC Admin Panel API Integration

## 🎯 **TL;DR - What You Need To Do**

1. Add 3 Django endpoints (~20 minutes total)
2. Test with Postman
3. Tell me "Ready!"
4. I'll update all React components

---

## 📝 **Minimum Django Implementation**

### **1. Current User Endpoint** (5 min) 🔴 CRITICAL

**File:** `accounts/views.py` (or `API/views/auth.py`)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'role': 'admin' if user.is_staff else 'user',
    })
```

**URL:** Add to `accounts/urls.py`
```python
path('me/', current_user, name='current-user'),
```

**Test:**
```bash
# Get token first
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Then test me endpoint
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### **2. Dashboard Stats Endpoint** (10 min) 🔴 CRITICAL

**File:** `API/views/dashboard.py` (create new file)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from accounts.models import BaseUser  # Adjust to your user model
from vehicle.models import Vehicle  # If you have it
from datetime import datetime, timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    today = timezone.now().date()
    last_month = today - timedelta(days=30)
    
    total_users = BaseUser.objects.count()
    active_users = BaseUser.objects.filter(is_active=True).count()
    new_users = BaseUser.objects.filter(date_joined__gte=last_month).count()
    total_vehicles = Vehicle.objects.count() if Vehicle else 0
    
    return Response({
        'totalUsers': total_users,
        'activeUsers': active_users,
        'newUsersThisMonth': new_users,
        'totalVehicles': total_vehicles,
        'userGrowthPercentage': 12.5,  # Calculate actual percentage
    })
```

**URL:** Create `API/new_urls.py`
```python
from django.urls import path
from .views import dashboard

urlpatterns = [
    path('stats/', dashboard.dashboard_stats),
]
```

**Main urls.py:** Add this line
```python
path('api/dashboard/', include('API.new_urls')),
```

**Test:**
```bash
curl http://localhost:8000/api/dashboard/stats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### **3. User Growth Chart** (5 min) 🟡 IMPORTANT

**File:** `API/views/dashboard.py` (same file as above)

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def users_growth_chart(request):
    today = timezone.now().date()
    data = []
    
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        count = BaseUser.objects.filter(date_joined__date=date).count()
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'day': date.strftime('%a'),
            'users': count,
        })
    
    return Response(data)
```

**URL:** Add to `API/new_urls.py`
```python
urlpatterns = [
    path('stats/', dashboard.dashboard_stats),
    path('charts/users-growth/', dashboard.users_growth_chart),  # Add this
]
```

**Test:**
```bash
curl http://localhost:8000/api/dashboard/charts/users-growth/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔧 **Django Settings**

Make sure you have in `settings.py`:

```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at top
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

---

## 🚀 **React Setup**

### **1. Create `.env` file** in React project root:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### **2. Install packages** (if not done):
```bash
npm install react-router-dom
# or
pnpm add react-router-dom
```

### **3. Start app:**
```bash
npm run dev
# or
pnpm dev
```

---

## ✅ **Testing Checklist**

Before telling me "Ready!":

- [ ] Django server running: `python manage.py runserver`
- [ ] React app running: `npm run dev`
- [ ] Can visit `http://localhost:5173`
- [ ] See login page
- [ ] Login with username: `admin`, password: `admin123`
- [ ] No errors in browser console
- [ ] No errors in Django terminal
- [ ] After login, redirected to dashboard
- [ ] Can see username in navbar (top right)
- [ ] Logout button works

---

## 🐛 **Common Issues**

### **Issue 1: CORS Error**
```
Access to fetch at 'http://localhost:8000/api/auth/login/' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix:** Add to `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

---

### **Issue 2: 401 Unauthorized on /auth/me/**
```
{"detail": "Authentication credentials were not provided."}
```

**Fix:** Token not being sent. Check browser console for errors.

---

### **Issue 3: Module not found**
```
ModuleNotFoundError: No module named 'API.views.dashboard'
```

**Fix:** Make sure you created `API/views/dashboard.py` file

---

### **Issue 4: Can't login**
```
POST /api/auth/login/ 400 Bad Request
```

**Fix:** 
1. Create superuser: `python manage.py createsuperuser`
2. Use those credentials to login

---

## 📞 **When You're Ready**

Just message me:
> "✅ Implemented! Here's my test result: {...}"

Include:
1. Response from `/api/auth/me/`
2. Response from `/api/dashboard/stats/`
3. Any errors you see

I'll then:
1. ✅ Update AccountsDashboard to use real data
2. ✅ Update all other pages
3. ✅ Test everything together
4. ✅ Fix any issues

---

## 📚 **Full Implementation**

For complete code, see:
- `/DJANGO_DASHBOARD_IMPLEMENTATION.py` - All dashboard views
- `/DJANGO_API_ENDPOINTS.md` - All API docs
- `/IMPLEMENTATION_SUMMARY.md` - Full summary

---

## 🎯 **Priority Order**

1. **MUST DO NOW:** `/api/auth/me/` (5 min)
2. **MUST DO NOW:** `/api/dashboard/stats/` (10 min)
3. **DO NEXT:** `/api/dashboard/charts/users-growth/` (5 min)
4. **DO LATER:** Other chart endpoints
5. **DO LATER:** User management endpoints

---

**That's it! Just 3 endpoints and you're ready to go!** 🚀
