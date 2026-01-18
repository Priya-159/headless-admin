# 🚀 FuelABC Admin Panel - Complete Setup Guide

## 📋 **What Has Been Done**

### ✅ **Frontend Structure - Cleaned & Optimized**

1. **Removed unnecessary variables and props**
2. **Implemented proper React Router navigation**
3. **Created URL routes for all subtabs**
4. **Cleaned up components to use Django API**
5. **Centralized API service layer**

### ✅ **URL Structure**

All routes now map to Django API endpoints:

```
FRONTEND ROUTES → DJANGO API ENDPOINTS

Dashboard/Accounts:
├─ /                               → Dashboard overview
├─ /accounts                       → GET /api/dashboard/stats/
├─ /accounts/all-users             → GET /api/dashboard/users/
├─ /accounts/blocked-users         → GET /api/dashboard/users/blocked/
├─ /accounts/countries             → GET /api/country_list
├─ /accounts/states                → GET /api/state_list
├─ /accounts/subscription          → GET /api/transaction_history
├─ /accounts/trip-usages           → GET /api/trip_history
├─ /accounts/api-usage             → GET /api/dashboard/api-usage/ (NEW)
├─ /accounts/admin-controls        → GET /api/dashboard/admin-controls/ (NEW)
├─ /accounts/emergency             → GET /api/emergency_numbers
└─ /accounts/free-request          → GET /api/request-status

Contact Messages:
├─ /contact                        → GET /api/message_list
├─ /contact/all-messages           → GET /api/message_list
├─ /contact/inquiries              → GET /api/message_list?type=inquiry
└─ /contact/feedback               → GET /api/message_list?type=feedback

FCM Devices:
└─ /fcm-devices                    → GET /api/devices (NEED TO ADD)

Notifications:
├─ /notifications                  → GET /api/notifications/active
├─ /notifications/all              → GET /api/notification_list
├─ /notifications/scheduled        → GET /api/notifications
├─ /notifications/date-range       → GET /api/notifications/scheduled/campaigns
├─ /notifications/csv-campaign     → GET /api/notifications/campaigns
├─ /notifications/push             → GET /api/notifications/push (NEW)
└─ /notifications/email            → GET /api/notifications/email (NEW)

Vehicles:
├─ /vehicles                       → GET /api/vehicle_config
├─ /vehicles/logbooks              → GET /api/view_log
├─ /vehicles/notifications         → GET /api/notification_list
├─ /vehicles/reminders             → GET /api/reminder
├─ /vehicles/tip-of-day            → GET /api/tip_of_day
├─ /vehicles/trips                 → GET /api/trip_history
├─ /vehicles/settings              → GET /api/user_setting
├─ /vehicles/fuel-analytics        → GET /api/vehicle_cost_analytics
├─ /vehicles/service-records       → GET /api/vehicles/service-records (NEW)
├─ /vehicles/insurance             → GET /api/insurance-callback-data
├─ /vehicles/puc                   → GET /api/vehicles/puc (NEW)
└─ /vehicles/documents             → GET /api/vehicles/documents (NEW)
```

---

## 🎯 **Step-by-Step Setup**

### **STEP 1: Django Backend Setup** ⏱️ 30 minutes

#### **1.1 Create Dashboard Views File**

Create: `API/views/dashboard.py`

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Count
from accounts.models import BaseUser
from datetime import datetime, timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    """Dashboard statistics"""
    today = timezone.now().date()
    last_month = today - timedelta(days=30)
    
    total_users = BaseUser.objects.count()
    active_users = BaseUser.objects.filter(is_active=True).count()
    new_users = BaseUser.objects.filter(date_joined__gte=last_month).count()
    
    return Response({
        'totalUsers': total_users,
        'activeUsers': active_users,
        'newUsersThisMonth': new_users,
        'userGrowthPercentage': 12.5,  # Calculate actual
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def users_growth_chart(request):
    """User growth chart - last 7 days"""
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

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_user_list(request):
    """List all users for admin"""
    users = BaseUser.objects.all().order_by('-date_joined')
    
    data = []
    for user in users:
        data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': getattr(user, 'phone', ''),
            'isActive': user.is_active,
            'dateJoined': user.date_joined.isoformat(),
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def blocked_users_list(request):
    """List blocked users"""
    blocked = BaseUser.objects.filter(is_active=False)
    
    data = []
    for user in blocked:
        data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'dateJoined': user.date_joined.isoformat(),
        })
    
    return Response(data)
```

#### **1.2 Create Current User View**

Add to `accounts/views.py`:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'role': 'admin' if user.is_staff else 'user',
        'isStaff': user.is_staff,
    })
```

#### **1.3 Create Dashboard URLs**

Create: `API/dashboard_urls.py`

```python
from django.urls import path
from .views import dashboard

urlpatterns = [
    # Stats
    path('stats/', dashboard.dashboard_stats, name='dashboard-stats'),
    
    # Charts
    path('charts/users-growth/', dashboard.users_growth_chart, name='users-growth'),
    
    # User Management
    path('users/', dashboard.admin_user_list, name='admin-users'),
    path('users/blocked/', dashboard.blocked_users_list, name='blocked-users'),
]
```

#### **1.4 Update Main URLs**

In your main `fuelabc/urls.py`, update:

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('accounts.urls')),  # For /api/auth/me/
    
    # All API routes
    path('api/', include('API.urls')),
    path('api/dashboard/', include('API.dashboard_urls')),  # NEW
    path('api/accounts/', include('accounts.urls')),
    path('api/contact/', include('contact_messages.urls')),
    path('api/fcm/', include('fuelabc_mmi.urls')),
    path('api/notifications/', include('notification.urls')),
    path('api/vehicles/', include('vehicle.urls')),
]
```

#### **1.5 Update accounts/urls.py**

Add the current_user view:

```python
from django.urls import path
from . import views

urlpatterns = [
    # ... existing URLs ...
    
    # Auth
    path('me/', views.current_user, name='current-user'),
]
```

#### **1.6 Check CORS Settings**

In `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # At top
    'django.middleware.security.SecurityMiddleware',
    # ... other middleware ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",
]

CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

---

### **STEP 2: Frontend Setup** ⏱️ 5 minutes

#### **2.1 Create .env File**

In your React project root (same level as `package.json`):

```env
VITE_API_URL=http://localhost:8000/api
```

**Note:** Use `VITE_API_URL` (not `REACT_APP_API_URL`) if using Vite

#### **2.2 Update http.js (if using Vite)**

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

#### **2.3 Install Dependencies (if needed)**

```bash
npm install react-router-dom
# or
pnpm add react-router-dom
```

---

### **STEP 3: Testing** ⏱️ 10 minutes

#### **3.1 Test Django Endpoints**

**Start Django server:**
```bash
cd /path/to/fuelabc
python manage.py runserver
```

**Test authentication:**
```bash
# Get token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response should be:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Test current user endpoint:**
```bash
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Response should be:
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "firstName": "",
  "lastName": "",
  "role": "admin",
  "isStaff": true
}
```

**Test dashboard stats:**
```bash
curl http://localhost:8000/api/dashboard/stats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Response should be:
{
  "totalUsers": 10,
  "activeUsers": 8,
  "newUsersThisMonth": 3,
  "userGrowthPercentage": 12.5
}
```

#### **3.2 Test React App**

**Start React app:**
```bash
cd /path/to/react-app
npm run dev
# or
pnpm dev
```

**Visit:** `http://localhost:5173`

**Expected behavior:**
1. ✅ See login page
2. ✅ Enter username: `admin`, password: `admin123`
3. ✅ After login, see dashboard
4. ✅ See username in navbar (top right)
5. ✅ Click sidebar items to navigate
6. ✅ Click logout to return to login

---

### **STEP 4: Verify URL Routing** ⏱️ 5 minutes

#### **Test All Routes:**

Navigate to these URLs and check they load:

```
✅ http://localhost:5173/
✅ http://localhost:5173/accounts/all-users
✅ http://localhost:5173/accounts/countries
✅ http://localhost:5173/contact/all-messages
✅ http://localhost:5173/notifications/scheduled
✅ http://localhost:5173/vehicles/trips
```

**Expected:** Each URL should display the correct section and breadcrumb

---

## 🔧 **Troubleshooting**

### **Issue 1: Login doesn't work**

**Symptom:** Can't login with admin/admin123

**Fix:**
```bash
# Create superuser
python manage.py createsuperuser

# Use those credentials instead
```

---

### **Issue 2: CORS error**

**Symptom:**
```
Access to fetch at 'http://localhost:8000/api/auth/login/' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Fix:** Check `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

---

### **Issue 3: 401 Unauthorized**

**Symptom:** All API calls return 401 after login

**Fix:**
1. Check if token is stored: Open browser DevTools → Application → Local Storage
2. Should see `access_token` and `refresh_token`
3. If not, check AuthContext is wrapping the app

---

### **Issue 4: Module not found**

**Symptom:**
```
ModuleNotFoundError: No module named 'API.views.dashboard'
```

**Fix:**
1. Make sure you created `API/views/dashboard.py`
2. Create `API/views/__init__.py` if doesn't exist
3. Restart Django server

---

### **Issue 5: React routes don't work**

**Symptom:** 404 on page refresh

**Fix:**
1. If using Vite, it should work automatically
2. If using Create React App, add to `public/_redirects`:
```
/*    /index.html   200
```

---

## 📊 **API Endpoint Checklist**

Before moving forward, verify these are working:

### **Critical (Must Have):**
- [ ] `POST /api/auth/login/` - Returns JWT tokens
- [ ] `POST /api/auth/token/refresh/` - Refreshes token
- [ ] `GET /api/auth/me/` - Returns current user
- [ ] `GET /api/dashboard/stats/` - Returns dashboard stats
- [ ] `GET /api/dashboard/users/` - Returns user list

### **Important (Should Have):**
- [ ] `GET /api/country_list` - Returns countries
- [ ] `GET /api/state_list` - Returns states
- [ ] `GET /api/message_list` - Returns messages
- [ ] `GET /api/notification_list` - Returns notifications
- [ ] `GET /api/trip_history` - Returns trips

### **Nice to Have:**
- [ ] `GET /api/dashboard/charts/users-growth/` - User growth chart
- [ ] `GET /api/dashboard/users/blocked/` - Blocked users
- [ ] `GET /api/emergency_numbers` - Emergency numbers

---

## 🎯 **Next Steps After Setup**

Once everything is working:

1. **Tell me which endpoints are working**
2. **I'll update components to fetch real data**
3. **We'll test each page together**
4. **Add loading states and error handling**
5. **Implement CRUD operations**

---

## 📞 **Ready to Test?**

Send me:

```
✅ Django server running on: http://localhost:8000
✅ React app running on: http://localhost:5173
✅ Login works: Yes/No
✅ Dashboard shows data: Yes/No
✅ Any errors: [paste here]
```

Then I'll guide you through updating each component! 🚀

---

## 📚 **Files Created/Updated**

### **Created:**
- `/src/services/api.ts` - API service layer
- `/src/utils/http.js` - HTTP client
- `/src/contexts/AuthContext.tsx` - Auth context
- `/src/components/ProtectedRoute.tsx` - Protected routes
- `/API_INTEGRATION_STATUS.md` - Status doc
- `/DJANGO_DASHBOARD_IMPLEMENTATION.py` - Django code
- `/COMPLETE_SETUP_GUIDE.md` - This file

### **Updated:**
- `/src/app/App.tsx` - Added routing
- `/src/app/components/Sidebar.tsx` - Navigation links
- `/src/app/components/LoginPage.tsx` - Uses AuthContext
- `/src/app/components/Navbar.tsx` - Uses AuthContext

---

## 🚀 **Quick Start Commands**

```bash
# Terminal 1 - Django
cd fuelabc
python manage.py runserver

# Terminal 2 - React
cd react-app
npm run dev

# Browser
http://localhost:5173
```

**Login:** admin / admin123

**That's it!** 🎉
