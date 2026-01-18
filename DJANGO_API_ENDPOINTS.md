 Admin Panel

This document lists all the API endpoints you need to implement in your Django backend.

## Base URL
```
http://localhost:8000/api
```

Set this URL in your `.env` file:
```
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login/`
```json
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. Token Refresh
**POST** `/auth/token/refresh/`
```json
Request:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Get Current User
**GET** `/auth/me/`
```json
Response:
{
  "id": 1,
  "username": "admin",
  "email": "admin@fuelabc.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "superadmin"
}
```

---

## Accounts Endpoints

### 4. Get All Users
**GET** `/accounts/users/`
```json
Query Parameters: ?search=&page=1&page_size=20

Response:
{
  "count": 150,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Rahul Sharma",
      "email": "rahul.sharma@gmail.com",
      "phone": "+91-9876543210",
      "state": "Maharashtra",
      "city": "Mumbai",
      "vehicleType": "Hatchback",
      "vehicleBrand": "Maruti Suzuki",
      "vehicleModel": "Swift",
      "membershipType": "Premium",
      "joinedDate": "2024-01-15",
      "isActive": true
    }
  ]
}
```

### 5. Get User Details
**GET** `/accounts/users/{id}/`

### 6. Update User
**PUT** `/accounts/users/{id}/`
**PATCH** `/accounts/users/{id}/`

### 7. Delete User
**DELETE** `/accounts/users/{id}/`

### 8. Get Blocked Users
**GET** `/accounts/users/blocked/`

### 9. Get Deleted Accounts
**GET** `/accounts/users/deleted/`

### 10. Get User Profiles
**GET** `/accounts/profiles/`

### 11. Get User Vehicles
**GET** `/accounts/vehicles/`

### 12. Get User Activity Logs
**GET** `/accounts/activity-logs/`

### 13. Get User Settings
**GET** `/accounts/settings/`

### 14. Get Payment History
**GET** `/accounts/payments/`

### 15. Get Referrals
**GET** `/accounts/referrals/`

### 16. Get Reward Points
**GET** `/accounts/rewards/`

---

## Contact Messages Endpoints

### 17. Get Contact Messages
**GET** `/contact/messages/`

### 18. Get Inquiries
**GET** `/contact/inquiries/`

### 19. Get Feedback
**GET** `/contact/feedback/`

---

## FCM Devices Endpoints

### 20. Get All Devices
**GET** `/fcm/devices/`

---

## Notification Endpoints

### 21. Get All Notifications
**GET** `/notifications/all/`

### 22. Get Scheduled Notifications
**GET** `/notifications/scheduled/`

### 23. Create Scheduled Notification
**POST** `/notifications/scheduled/`
```json
{
  "title": "Fuel Price Alert",
  "body": "Petrol price increased by ₹2",
  "scheduledDate": "2025-01-10",
  "scheduledTime": "09:00",
  "targetAudience": "all",
  "filters": {
    "states": ["Maharashtra"],
    "cities": ["Mumbai"],
    "vehicleTypes": ["Sedan"]
  }
}
```

### 24. Get Date Range Notifications
**GET** `/notifications/date-range/`

### 25. Get CSV Campaign Notifications
**GET** `/notifications/csv-campaigns/`

### 26. Upload CSV for Campaign
**POST** `/notifications/csv-campaigns/upload/`
```
Content-Type: multipart/form-data
File: campaign.csv
```

### 27. Get Push Notifications
**GET** `/notifications/push/`

### 28. Send Push Notification
**POST** `/notifications/push/`

### 29. Get Email Notifications
**GET** `/notifications/email/`

### 30. Get SMS Notifications
**GET** `/notifications/sms/`

---

## Vehicle Endpoints

### 31. Get Logbooks
**GET** `/vehicles/logbooks/`

### 32. Get Vehicle Notifications
**GET** `/vehicles/notifications/`

### 33. Get Reminders
**GET** `/vehicles/reminders/`

### 34. Get Tips
**GET** `/vehicles/tips/`

### 35. Update Tip
**PUT** `/vehicles/tips/{id}/`
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

### 36. Get Trips
**GET** `/vehicles/trips/`

### 37. Get Vehicle Settings
**GET** `/vehicles/settings/`

### 38. Get Fuel Analytics
**GET** `/vehicles/fuel-analytics/`

### 39. Get Service Records
**GET** `/vehicles/service-records/`

### 40. Get Insurance Data
**GET** `/vehicles/insurance/`

### 41. Get PUC Data
**GET** `/vehicles/puc/`

### 42. Get Document Management
**GET** `/vehicles/documents/`

---

## Dashboard/Statistics Endpoints

### 43. Get Dashboard Stats
**GET** `/dashboard/stats/`
```json
Response:
{
  "totalUsers": 15234,
  "activeUsers": 12456,
  "totalRevenue": 2456789,
  "monthlyGrowth": 12.5
}
```

### 44. Get Chart Data
**GET** `/dashboard/charts/{chartType}/`
```
chartType: users-growth, revenue, notifications, etc.
```

---

## Common Query Parameters

All list endpoints support:
- `?search=keyword` - Search filter
- `?page=1` - Pagination
- `?page_size=20` - Items per page
- `?ordering=field_name` - Sort by field
- `?field_name=value` - Filter by field

---

## Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Django Implementation Guide

### 1. Install Required Packages
```bash
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install django-filter
```

### 2. Settings Configuration
```python
# settings.py

INSTALLED_APPS = [
    ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    # Your apps
    'accounts',
    'contact',
    'fcm_devices',
    'notifications',
    'vehicles',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite default port
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

### 3. URL Configuration
```python
# urls.py

from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('accounts.urls')),  # For /api/auth/me/
    path('api/accounts/', include('accounts.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/fcm/', include('fcm_devices.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
```

### 4. Example ViewSet
```python
# accounts/views.py

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone']
    filterset_fields = ['state', 'city', 'membershipType', 'isActive']
    ordering_fields = ['joinedDate', 'name']
    
    @action(detail=False, methods=['get'])
    def blocked(self, request):
        blocked_users = self.queryset.filter(isActive=False)
        serializer = self.get_serializer(blocked_users, many=True)
        return Response(serializer.data)
```

### 5. Example Serializer
```python
# accounts/serializers.py

from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
```

---

## Response Format

All endpoints should return consistent response format:

### Success Response
```json
{
  "data": {...},
  "message": "Success",
  "status": 200
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400
}
```

### List Response
```json
{
  "count": 100,
  "next": "http://api.../page=2",
  "previous": null,
  "results": [...]
}
```

---

## Testing with Postman/cURL

### Get Access Token
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Use Access Token
```bash
curl -X GET http://localhost:8000/api/accounts/users/ \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Frontend Environment Variables

Create `.env` file in your React project root:
```
REACT_APP_API_URL=http://localhost:8000/api
```

---

## Notes for Django Implementation

1. **Authentication**: Use Django's built-in User model or create custom User model
2. **Permissions**: Implement role-based permissions (superadmin, admin, viewer)
3. **Validation**: Add proper validation in serializers
4. **Error Handling**: Implement global exception handler
5. **Logging**: Add logging for API requests
6. **Rate Limiting**: Consider adding rate limiting for security
7. **File Uploads**: Configure media files for image/document uploads
8. **Database**: Use PostgreSQL for production
9. **Caching**: Consider Redis for caching frequently accessed data
10. **Testing**: Write unit tests for all endpoints

---

This completes the API endpoint documentation. Implement these endpoints in Django REST Framework to connect with your React admin panel.
