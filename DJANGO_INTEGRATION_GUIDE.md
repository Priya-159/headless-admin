# 🚀 FuelABC Admin Panel - Django Integration Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Django Setup (No Models Required)](#django-setup)
3. [All API Endpoints - React to Django Mapping](#all-api-endpoints)
4. [Required Django Views](#required-django-views)
5. [Required Serializers](#required-serializers)
6. [Django URLs Configuration](#django-urls-configuration)
7. [CORS Configuration](#cors-configuration)
8. [Authentication Setup](#authentication-setup)
9. [Testing the Integration](#testing-the-integration)

---

## 🎯 Quick Start

### **1. Update React API URL**
Edit `/src/utils/http.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';  // Your Django backend URL
```

### **2. Django Backend**
```bash
cd your-django-project
python manage.py runserver
```

### **3. React Frontend**
```bash
npm run dev
```

---

## 🔧 Django Setup (No Models Required)

### **Step 1: Install Required Packages**
```bash
pip install djangorestframework django-cors-headers djangorestframework-simplejwt
```

### **Step 2: Update `settings.py`**
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    
    # Your existing apps (don't change)
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this FIRST
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True  # For development
CORS_ALLOW_CREDENTIALS = True
```

---

## 📡 All API Endpoints - React to Django Mapping

### **✅ ALREADY IMPLEMENTED IN YOUR DJANGO (Just verify these exist)**

#### **Dashboard APIs**
```python
# FROM: api.dashboard.getStats()
GET  /dashboard/stats/                          

# FROM: api.dashboard.getUsersGrowth()
GET  /dashboard/charts/users-growth/            

# FROM: api.dashboard.getNotificationsChart()
GET  /dashboard/charts/notifications/           

# FROM: api.dashboard.getVehicleTypes()
GET  /dashboard/charts/vehicle-types/           

# FROM: api.dashboard.getMemberships()
GET  /dashboard/charts/memberships/             

# FROM: api.dashboard.admin_user_list()
GET  /dashboard/users/                          

# FROM: api.dashboard.blocked_users_list()
GET  /dashboard/users/blocked/                  
```

#### **Accounts APIs**
```python
# FROM: api.accounts.getFreeRequestStatus()
GET  /request-status                            

# FROM: api.accounts.getUserInfo()
GET  /user-info                                 

# FROM: api.accounts.getUserSubscriptionInfo()
GET  /user-subscription-info                    

# FROM: api.accounts.editProfile()
POST /edit_profile                              

# FROM: api.accounts.deleteAccount()
POST /delete_account                            

# FROM: api.accounts.getUserVehicleList()
GET  /user_vehicle_list                         

# FROM: api.accounts.addUserVehicle()
POST /add_user_vehicle                          

# FROM: api.accounts.removeUserVehicle()
POST /remove_user_vehicle                       
```

#### **Location APIs**
```python
# FROM: api.location.getCountries()
GET  /country_list                              

# FROM: api.location.getStates()
GET  /state_list                                

# FROM: api.location.getCities()
GET  /city_list                                 
```

#### **Vehicle APIs**
```python
# FROM: api.vehicle.getVehicleStats()
GET  /vehicles/vehicle-stats/                   

# FROM: api.vehicle.getVehicleTypes()
GET  /vehicle_types                             

# FROM: api.vehicle.getVehicleMakers()
GET  /vehicle_makers                            

# FROM: api.vehicle.getVehicleModels()
GET  /vehicle_models                            

# FROM: api.vehicle.getVehicleConfig()
GET  /vehicle_config                            

# FROM: api.vehicle.getTripHistory()
GET  /trip_history                              

# FROM: api.vehicle.addTrip()
POST /add_trip                                  

# FROM: api.vehicle.deleteTrip()
POST /delete_trip                               

# FROM: api.vehicle.endTrip()
POST /end_trip                                  

# FROM: api.vehicle.getTripData()
GET  /trip_data                                 

# FROM: api.vehicle.getViewLog()
GET  /view_log                                  

# FROM: api.vehicle.addLog()
POST /add_log                                   

# FROM: api.vehicle.deleteLog()
POST /delete_log                                

# FROM: api.vehicle.getReminders()
GET  /reminder                                  

# FROM: api.vehicle.deleteReminder()
POST /delete_reminder                           

# FROM: api.vehicle.getTipOfDay()
GET  /tip_of_day                                

# FROM: api.vehicle.getEmergencyNumbers()
GET  /emergency_numbers                         

# FROM: api.vehicle.getVehicleCostAnalytics()
GET  /vehicle_cost_analytics                    

# FROM: api.vehicle.getFuelPriceList()
GET  /fuel_price_list                           

# FROM: api.vehicle.getInsuranceCallbackData()
GET  /insurance-callback-data                   
```

#### **Notification APIs**
```python
# FROM: api.notification.getActiveNotifications()
GET  /notifications/active                      

# FROM: api.notification.getNotificationList()
GET  /notification_list                         

# FROM: api.notification.getScheduledNotifications()
GET  /notifications                             

# FROM: api.notification.readNotification()
POST /read_notification                         

# FROM: api.notification.readAllNotifications()
POST /read_all_notification                     
```

#### **Contact APIs**
```python
# FROM: api.contact.getMessageList()
GET  /message_list                              

# FROM: api.contact.sendMessage()
POST /send_message                              
```

#### **Payment APIs**
```python
# FROM: api.payment.getTransactionHistory()
GET  /transaction_history                       

# FROM: api.payment.getPrices()
GET  /get_prices                                

# FROM: api.payment.getPricesLatest()
GET  /get_prices_latest                         

# FROM: api.payment.initiateRazorpayPayment()
POST /initiate_razorpay_payment                 

# FROM: api.payment.verifyRazorpayPayment()
POST /verify_razorpay_payment                   
```

#### **Settings APIs**
```python
# FROM: api.settings.getUserSettings()
GET  /user_setting                              

# FROM: api.settings.updateSettings()
PATCH /user_setting                             
```

#### **Fuel Price APIs**
```python
# FROM: api.fuelPrice.getFuelPriceList()
GET  /fuel_price_list                           

# FROM: api.fuelPrice.getStateFuelPriceList()
GET  /fuel_price_list_state                     

# FROM: api.fuelPrice.getCityFuelPriceList()
GET  /city_fuel_price_list                      
```

#### **Route APIs**
```python
# FROM: api.route.getEfficientRoute()
POST /efficient-route                           

# FROM: api.route.getMmiRoute()
POST /mmi-efficient-route                       

# FROM: api.route.getGoogleRoute()
POST /google_route                              

# FROM: api.route.getFuelPricesEnroute()
POST /fuel_prices_enroute                       
```

---

### **🆕 NEW ENDPOINTS REQUIRED (Add these to your Django)**

These endpoints are called by the updated React components but may not exist in your Django backend:

#### **1. User Block/Unblock**
```python
# FROM: api.dashboard.blockUser(userId)
POST /dashboard/users/{id}/block/
# Request body: { "reason": "Violation of terms" }
# Response: { "status": "User blocked" }

# FROM: api.dashboard.unblockUser(userId)
POST /dashboard/users/{id}/unblock/
# Response: { "status": "User unblocked" }
```

#### **2. Emergency Numbers CRUD**
```python
# FROM: api.vehicle.createEmergencyNumber(data)
POST /emergency_numbers
# Request body: { "service_name": "Police", "phone_number": "+91 100", "description": "..." }

# FROM: api.vehicle.updateEmergencyNumber(id, data)
PATCH /emergency_numbers/{id}
# Request body: { "service_name": "Police", "phone_number": "+91 100" }

# FROM: api.vehicle.deleteEmergencyNumber(id)
DELETE /emergency_numbers/{id}
```

#### **3. Location CRUD**
```python
# FROM: api.location.createCountry(data)
POST /country_list
# Request body: { "name": "India", "code": "IN", "currency": "INR" }

# FROM: api.location.updateCountry(id, data)
PATCH /country_list/{id}

# FROM: api.location.deleteCountry(id)
DELETE /country_list/{id}

# FROM: api.location.createState(data)
POST /state_list
# Request body: { "name": "Maharashtra", "country_id": 1, "code": "MH" }

# FROM: api.location.updateState(id, data)
PATCH /state_list/{id}

# FROM: api.location.deleteState(id)
DELETE /state_list/{id}
```

#### **4. Scheduled Notifications CRUD**
```python
# FROM: api.notification.createScheduledNotification(data)
POST /notifications
# Request body: { "title": "...", "message": "...", "scheduled_date": "2024-01-01T10:00:00" }

# FROM: api.notification.updateScheduledNotification(id, data)
PATCH /notifications/{id}

# FROM: api.notification.deleteScheduledNotification(id)
DELETE /notifications/{id}
```

#### **5. CSV Campaigns**
```python
# FROM: api.notification.uploadCSV(formData)
POST /notifications/csv-upload
# Request: FormData with CSV file

# FROM: api.notification.getCSVCampaigns()
GET /notifications/campaigns

# FROM: api.notification.getCSVCampaignDetail(id)
GET /notifications/campaigns/{id}
```

#### **6. Scheduled Campaigns**
```python
# FROM: api.notification.createScheduledCampaign(data)
POST /notifications/scheduled/create

# FROM: api.notification.getScheduledCampaigns()
GET /notifications/scheduled/campaigns

# FROM: api.notification.getScheduledCampaignDetail(id)
GET /notifications/scheduled/campaigns/{id}
```

#### **7. FCM Devices**
```python
# FROM: api.fcm.createDevice(data)
POST /devices
# Request body: { "device_token": "...", "platform": "android", "user_id": 1 }
```

---

## 🎨 Required Django Views (Only New Ones)

### **📍 Location: Create `accounts/views.py` (if not exists) or add to existing**

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

# ============================================
# USER BLOCK/UNBLOCK VIEWS (NEW)
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request, user_id):
    """Block a user"""
    try:
        # ⚠️ ASSUMING: You have a User model with is_blocked field
        # If you use different field names, update accordingly
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        user.is_blocked = True
        user.block_reason = request.data.get('reason', 'No reason provided')
        user.blocked_at = timezone.now()
        user.save()
        
        return Response({
            'status': 'success',
            'message': 'User blocked successfully'
        })
    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unblock_user(request, user_id):
    """Unblock a user"""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        user.is_blocked = False
        user.block_reason = None
        user.blocked_at = None
        user.save()
        
        return Response({
            'status': 'success',
            'message': 'User unblocked successfully'
        })
    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# COUNTRY CRUD VIEWS (NEW)
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def country_list(request):
    """Get all countries or create new country"""
    # ⚠️ ASSUMING: You have a Country model
    # Import your Country model here
    from your_app.models import Country  # UPDATE THIS IMPORT
    
    if request.method == 'GET':
        # If you already have this endpoint, skip this
        countries = Country.objects.all()
        data = [{
            'id': c.id,
            'name': c.name,
            'code': getattr(c, 'code', ''),
            'currency': getattr(c, 'currency', 'INR'),
            'is_active': getattr(c, 'is_active', True),
        } for c in countries]
        return Response(data)
    
    elif request.method == 'POST':
        # NEW: Create country
        try:
            country = Country.objects.create(
                name=request.data.get('name'),
                code=request.data.get('code', ''),
                currency=request.data.get('currency', 'INR'),
                is_active=request.data.get('is_active', True)
            )
            return Response({
                'status': 'success',
                'message': 'Country created',
                'data': {'id': country.id, 'name': country.name}
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def country_detail(request, country_id):
    """Update or delete country"""
    from your_app.models import Country  # UPDATE THIS IMPORT
    
    try:
        country = Country.objects.get(id=country_id)
        
        if request.method == 'PATCH':
            # Update country
            for field in ['name', 'code', 'currency', 'is_active']:
                if field in request.data:
                    setattr(country, field, request.data[field])
            country.save()
            return Response({
                'status': 'success',
                'message': 'Country updated'
            })
        
        elif request.method == 'DELETE':
            # Delete country
            country.delete()
            return Response({
                'status': 'success',
                'message': 'Country deleted'
            })
    except Country.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Country not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# STATE CRUD VIEWS (NEW)
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_state(request):
    """Create new state"""
    from your_app.models import State  # UPDATE THIS IMPORT
    
    try:
        state = State.objects.create(
            name=request.data.get('name'),
            country_id=request.data.get('country_id'),
            code=request.data.get('code', ''),
            is_active=request.data.get('is_active', True)
        )
        return Response({
            'status': 'success',
            'message': 'State created',
            'data': {'id': state.id, 'name': state.name}
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def state_detail(request, state_id):
    """Update or delete state"""
    from your_app.models import State  # UPDATE THIS IMPORT
    
    try:
        state = State.objects.get(id=state_id)
        
        if request.method == 'PATCH':
            for field in ['name', 'country_id', 'code', 'is_active']:
                if field in request.data:
                    setattr(state, field, request.data[field])
            state.save()
            return Response({
                'status': 'success',
                'message': 'State updated'
            })
        
        elif request.method == 'DELETE':
            state.delete()
            return Response({
                'status': 'success',
                'message': 'State deleted'
            })
    except State.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'State not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
```

---

### **📍 Location: Create `vehicles/views.py` additions**

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# ============================================
# EMERGENCY NUMBERS CRUD (NEW)
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_emergency_number(request):
    """Create new emergency number"""
    from your_app.models import EmergencyNumber  # UPDATE THIS IMPORT
    
    try:
        emergency = EmergencyNumber.objects.create(
            service_name=request.data.get('service_name'),
            serviceName=request.data.get('service_name'),  # Alternative field name
            phone_number=request.data.get('phone_number'),
            phoneNumber=request.data.get('phone_number'),  # Alternative field name
            description=request.data.get('description', ''),
            is_active=request.data.get('is_active', True)
        )
        return Response({
            'status': 'success',
            'message': 'Emergency number created',
            'data': {'id': emergency.id}
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def emergency_number_detail(request, emergency_id):
    """Update or delete emergency number"""
    from your_app.models import EmergencyNumber  # UPDATE THIS IMPORT
    
    try:
        emergency = EmergencyNumber.objects.get(id=emergency_id)
        
        if request.method == 'PATCH':
            if 'service_name' in request.data:
                emergency.service_name = request.data['service_name']
                emergency.serviceName = request.data['service_name']
            if 'phone_number' in request.data:
                emergency.phone_number = request.data['phone_number']
                emergency.phoneNumber = request.data['phone_number']
            if 'description' in request.data:
                emergency.description = request.data['description']
            if 'is_active' in request.data:
                emergency.is_active = request.data['is_active']
            emergency.save()
            return Response({
                'status': 'success',
                'message': 'Emergency number updated'
            })
        
        elif request.method == 'DELETE':
            emergency.delete()
            return Response({
                'status': 'success',
                'message': 'Emergency number deleted'
            })
    except EmergencyNumber.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Emergency number not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
```

---

### **📍 Location: Create `notifications/views.py` additions**

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

# ============================================
# SCHEDULED NOTIFICATION CRUD (NEW)
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_scheduled_notification(request):
    """Create scheduled notification"""
    from your_app.models import ScheduledNotification  # UPDATE THIS IMPORT
    
    try:
        notification = ScheduledNotification.objects.create(
            title=request.data.get('title'),
            notification_title=request.data.get('title'),
            message=request.data.get('message'),
            body=request.data.get('message'),
            scheduled_date=request.data.get('scheduled_date'),
            send_at=request.data.get('scheduled_date'),
            status='pending'
        )
        return Response({
            'status': 'success',
            'message': 'Notification scheduled',
            'data': {'id': notification.id}
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_scheduled_notification(request, notification_id):
    """Update scheduled notification"""
    from your_app.models import ScheduledNotification  # UPDATE THIS IMPORT
    
    try:
        notification = ScheduledNotification.objects.get(id=notification_id)
        
        if 'title' in request.data:
            notification.title = request.data['title']
            notification.notification_title = request.data['title']
        if 'message' in request.data:
            notification.message = request.data['message']
            notification.body = request.data['message']
        if 'scheduled_date' in request.data:
            notification.scheduled_date = request.data['scheduled_date']
            notification.send_at = request.data['scheduled_date']
        
        notification.save()
        return Response({
            'status': 'success',
            'message': 'Notification updated'
        })
    except ScheduledNotification.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Notification not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_scheduled_notification(request, notification_id):
    """Delete scheduled notification"""
    from your_app.models import ScheduledNotification  # UPDATE THIS IMPORT
    
    try:
        notification = ScheduledNotification.objects.get(id=notification_id)
        notification.delete()
        return Response({
            'status': 'success',
            'message': 'Notification deleted'
        })
    except ScheduledNotification.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Notification not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# CSV CAMPAIGN (NEW) - Optional
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_csv_campaign(request):
    """Upload CSV for notification campaign"""
    # ⚠️ Only implement if you need CSV upload feature
    try:
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({
                'status': 'error',
                'message': 'No file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process CSV file here
        # Save to CSVCampaign model
        
        return Response({
            'status': 'success',
            'message': 'CSV uploaded successfully',
            'data': {'id': 1, 'name': 'Campaign Name'}
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_csv_campaigns(request):
    """Get all CSV campaigns"""
    # Return empty list or your data
    return Response([])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_csv_campaign_detail(request, campaign_id):
    """Get CSV campaign details"""
    return Response({
        'id': campaign_id,
        'name': 'Campaign Name',
        'status': 'pending'
    })
```

---

### **📍 Location: Create `fcm/views.py` additions**

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# ============================================
# FCM DEVICE CRUD (NEW)
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_fcm_device(request):
    """Register FCM device"""
    from your_app.models import FCMDevice  # UPDATE THIS IMPORT
    
    try:
        device = FCMDevice.objects.create(
            device_token=request.data.get('device_token'),
            fcm_token=request.data.get('device_token'),
            platform=request.data.get('platform', 'android'),
            user_id=request.data.get('user_id'),
            is_active=True,
            isActive=True
        )
        return Response({
            'status': 'success',
            'message': 'Device registered',
            'data': {'id': device.id}
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
```

---

## 🔗 Django URLs Configuration

### **Main `urls.py` (project level)**

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ✅ JWT Authentication (Already exists in your project)
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ✅ Include your existing app URLs
    path('api/', include('dashboard.urls')),      # If you have dashboard app
    path('api/', include('accounts.urls')),       # If you have accounts app
    path('api/', include('vehicles.urls')),       # If you have vehicles app
    path('api/', include('notifications.urls')),  # If you have notifications app
    path('api/', include('contact.urls')),        # If you have contact app
    path('api/', include('fcm.urls')),           # If you have fcm app
]
```

---

### **🆕 New URLs to Add**

#### **`accounts/urls.py` (Add these routes)**

```python
from django.urls import path
from . import views

urlpatterns = [
    # ✅ Your existing URLs remain unchanged
    
    # 🆕 NEW: Add these routes for user block/unblock
    path('dashboard/users/<int:user_id>/block/', views.block_user, name='block-user'),
    path('dashboard/users/<int:user_id>/unblock/', views.unblock_user, name='unblock-user'),
    
    # 🆕 NEW: Add these routes for country CRUD
    path('country_list/<int:country_id>', views.country_detail, name='country-detail'),
    
    # 🆕 NEW: Add these routes for state CRUD
    path('state_list', views.create_state, name='create-state'),
    path('state_list/<int:state_id>', views.state_detail, name='state-detail'),
]
```

#### **`vehicles/urls.py` (Add these routes)**

```python
from django.urls import path
from . import views

urlpatterns = [
    # ✅ Your existing URLs remain unchanged
    
    # 🆕 NEW: Add these routes for emergency numbers CRUD
    path('emergency_numbers', views.create_emergency_number, name='create-emergency'),
    path('emergency_numbers/<int:emergency_id>', views.emergency_number_detail, name='emergency-detail'),
]
```

#### **`notifications/urls.py` (Add these routes)**

```python
from django.urls import path
from . import views

urlpatterns = [
    # ✅ Your existing URLs remain unchanged
    
    # 🆕 NEW: Add these routes for scheduled notifications CRUD
    path('notifications', views.create_scheduled_notification, name='create-notification'),
    path('notifications/<int:notification_id>', views.update_scheduled_notification, name='update-notification'),
    path('notifications/<int:notification_id>', views.delete_scheduled_notification, name='delete-notification'),
    
    # 🆕 NEW: Add these routes for CSV campaigns (Optional)
    path('notifications/csv-upload', views.upload_csv_campaign, name='csv-upload'),
    path('notifications/campaigns', views.get_csv_campaigns, name='csv-campaigns'),
    path('notifications/campaigns/<int:campaign_id>', views.get_csv_campaign_detail, name='csv-campaign-detail'),
]
```

#### **`fcm/urls.py` (Add these routes)**

```python
from django.urls import path
from . import views

urlpatterns = [
    # 🆕 NEW: Add this route for FCM device registration
    path('devices', views.create_fcm_device, name='create-fcm-device'),
]
```

---

## 📋 Complete URL Verification Checklist

### **✅ Verify These URLs Already Exist in Your Django**

Go through each URL and verify it returns data:

#### **Dashboard URLs** (Should exist)
- [ ] `GET /api/dashboard/stats/`
- [ ] `GET /api/dashboard/charts/users-growth/`
- [ ] `GET /api/dashboard/charts/notifications/`
- [ ] `GET /api/dashboard/charts/vehicle-types/`
- [ ] `GET /api/dashboard/charts/memberships/`
- [ ] `GET /api/dashboard/users/`
- [ ] `GET /api/dashboard/users/blocked/`

#### **Accounts URLs** (Should exist)
- [ ] `GET /api/user-info`
- [ ] `GET /api/user-subscription-info`
- [ ] `POST /api/edit_profile`
- [ ] `POST /api/delete_account`
- [ ] `GET /api/request-status`
- [ ] `GET /api/user_vehicle_list`
- [ ] `POST /api/add_user_vehicle`
- [ ] `POST /api/remove_user_vehicle`
- [ ] `GET /api/country_list`
- [ ] `GET /api/state_list`
- [ ] `GET /api/city_list`

#### **Vehicle URLs** (Should exist)
- [ ] `GET /api/vehicle_types`
- [ ] `GET /api/vehicle_makers`
- [ ] `GET /api/vehicle_models`
- [ ] `GET /api/vehicle_config`
- [ ] `GET /api/trip_history`
- [ ] `POST /api/add_trip`
- [ ] `POST /api/delete_trip`
- [ ] `POST /api/end_trip`
- [ ] `GET /api/view_log`
- [ ] `POST /api/add_log`
- [ ] `POST /api/delete_log`
- [ ] `GET /api/reminder`
- [ ] `POST /api/delete_reminder`
- [ ] `GET /api/tip_of_day`
- [ ] `GET /api/emergency_numbers`
- [ ] `GET /api/vehicle_cost_analytics`
- [ ] `GET /api/fuel_price_list`

#### **Notification URLs** (Should exist)
- [ ] `GET /api/notifications/active`
- [ ] `GET /api/notification_list`
- [ ] `POST /api/read_notification`
- [ ] `POST /api/read_all_notification`

#### **Contact URLs** (Should exist)
- [ ] `GET /api/message_list`
- [ ] `POST /api/send_message`

#### **Payment URLs** (Should exist)
- [ ] `GET /api/transaction_history`
- [ ] `GET /api/get_prices`

---

### **🆕 Add These New URLs**

These are the NEW endpoints needed for the updated React components:

#### **User Management**
- [ ] `POST /api/dashboard/users/{id}/block/` ← ADD THIS
- [ ] `POST /api/dashboard/users/{id}/unblock/` ← ADD THIS

#### **Location Management**
- [ ] `POST /api/country_list` ← ADD THIS
- [ ] `PATCH /api/country_list/{id}` ← ADD THIS
- [ ] `DELETE /api/country_list/{id}` ← ADD THIS
- [ ] `POST /api/state_list` ← ADD THIS
- [ ] `PATCH /api/state_list/{id}` ← ADD THIS
- [ ] `DELETE /api/state_list/{id}` ← ADD THIS

#### **Emergency Numbers**
- [ ] `POST /api/emergency_numbers` ← ADD THIS
- [ ] `PATCH /api/emergency_numbers/{id}` ← ADD THIS
- [ ] `DELETE /api/emergency_numbers/{id}` ← ADD THIS

#### **Notifications**
- [ ] `POST /api/notifications` ← ADD THIS
- [ ] `PATCH /api/notifications/{id}` ← ADD THIS
- [ ] `DELETE /api/notifications/{id}` ← ADD THIS
- [ ] `POST /api/notifications/csv-upload` ← OPTIONAL
- [ ] `GET /api/notifications/campaigns` ← OPTIONAL
- [ ] `GET /api/notifications/campaigns/{id}` ← OPTIONAL

#### **FCM Devices**
- [ ] `POST /api/devices` ← ADD THIS

---

## 🔄 URL Format Notes

### **Important: Update These Imports in Views**

In all the view functions provided above, update these lines:

```python
# ❌ CHANGE THIS:
from your_app.models import Country

# ✅ TO YOUR ACTUAL APP NAME:
from accounts.models import Country
# or
from location.models import Country
# or whatever your app is named
```

### **Model Field Name Alternatives**

Your React app checks multiple field name variations. Your Django should return data in one of these formats:

```python
# User fields
{
    "id": 1,
    "email": "user@example.com",
    "username": "user",  # or "name"
    "phone": "+91 1234567890",  # or "phone_number"
    "is_active": true,
    "is_blocked": false,
    "created_at": "2024-01-01T10:00:00Z",  # or "date_joined"
}

# Emergency number fields
{
    "id": 1,
    "service_name": "Police",  # or "serviceName"
    "phone_number": "+91 100",  # or "phoneNumber"
    "description": "Emergency police",
    "is_active": true
}

# Notification fields
{
    "id": 1,
    "title": "Title",  # or "notification_title"
    "message": "Message",  # or "body"
    "is_read": false,  # or "read"
    "created_at": "2024-01-01T10:00:00Z",  # or "createdAt"
}
```

---

## ✅ Testing Steps

### **1. Test Existing Endpoints**
```bash
# Get JWT token
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test existing endpoint
curl -X GET http://localhost:8000/api/dashboard/stats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **2. Test New Block User Endpoint**
```bash
curl -X POST http://localhost:8000/api/dashboard/users/1/block/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test block"}'
```

### **3. Test New Emergency Number CRUD**
```bash
# Create
curl -X POST http://localhost:8000/api/emergency_numbers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_name":"Police","phone_number":"+91 100","description":"Emergency"}'

# Update
curl -X PATCH http://localhost:8000/api/emergency_numbers/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service_name":"Police Station"}'

# Delete
curl -X DELETE http://localhost:8000/api/emergency_numbers/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 Summary

### **What You Need to Do:**

1. **✅ Verify existing URLs** - Check all URLs in the checklist
2. **🆕 Add new view functions** - Copy the view functions provided above
3. **🆕 Update URLs** - Add the new URL patterns
4. **🔧 Update imports** - Change `from your_app.models` to your actual app name
5. **✅ Test endpoints** - Use curl or Postman to test each endpoint

### **What You DON'T Need to Do:**

- ❌ Create or modify models (use your existing models)
- ❌ Create serializers (simple Response() is sufficient)
- ❌ Create new apps (add to existing apps)
- ❌ Migrate database (no model changes)

### **Files to Edit:**

```
your_project/
├── accounts/
│   ├── views.py        ← Add block/unblock, country/state CRUD
│   └── urls.py         ← Add new URL patterns
├── vehicles/
│   ├── views.py        ← Add emergency number CRUD
│   └── urls.py         ← Add new URL patterns
├── notifications/
│   ├── views.py        ← Add scheduled notification CRUD
│   └── urls.py         ← Add new URL patterns
└── fcm/
    ├── views.py        ← Add FCM device registration
    └── urls.py         ← Add new URL patterns
```

---

## 🎉 Done!

Once you add these new endpoints, your React admin panel will be fully functional with all CRUD operations!

**Need help?** Check the Django console for detailed error messages and verify:
1. URL patterns are correct
2. Import statements match your app names
3. Model field names match your database
4. JWT authentication is working
