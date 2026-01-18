# ============================================
# DJANGO DASHBOARD VIEWS IMPLEMENTATION
# ============================================
# Save this as: API/views/dashboard.py
# ============================================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, Avg
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from django.utils import timezone

# Import your models (adjust based on your actual model locations)
from accounts.models import BaseUser  # or your User model
from vehicle.models import Vehicle, Trip, Logbook  # Adjust to your actual models
from notification.models import ScheduledNotification  # Adjust to your actual model
from contact_messages.models import ContactMessage  # Adjust to your actual model

User = get_user_model()


# ============================================
# 1. DASHBOARD STATISTICS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_stats(request):
    """
    Overview statistics for admin dashboard
    Returns: Total users, active users, growth, etc.
    """
    today = timezone.now().date()
    last_month = today - timedelta(days=30)
    last_week = today - timedelta(days=7)
    
    # User Statistics
    total_users = BaseUser.objects.count()
    active_users = BaseUser.objects.filter(is_active=True).count()
    new_users_this_month = BaseUser.objects.filter(
        date_joined__gte=last_month
    ).count()
    new_users_this_week = BaseUser.objects.filter(
        date_joined__gte=last_week
    ).count()
    
    # Premium Users (adjust based on your membership field)
    premium_users = BaseUser.objects.filter(
        # membership_type='premium'  # Adjust field name
    ).count() if hasattr(BaseUser, 'membership_type') else 0
    
    # Vehicle Statistics
    total_vehicles = Vehicle.objects.count() if Vehicle else 0
    
    # Trip Statistics
    total_trips = Trip.objects.count() if Trip else 0
    active_trips = Trip.objects.filter(
        # is_active=True  # Adjust field name
    ).count() if Trip and hasattr(Trip, 'is_active') else 0
    
    # Notification Statistics
    total_notifications = ScheduledNotification.objects.count() if ScheduledNotification else 0
    sent_notifications = ScheduledNotification.objects.filter(
        # status='sent'  # Adjust field name
    ).count() if ScheduledNotification and hasattr(ScheduledNotification, 'status') else 0
    
    # Contact Statistics
    pending_messages = ContactMessage.objects.filter(
        # status='pending'  # Adjust field name
    ).count() if ContactMessage and hasattr(ContactMessage, 'status') else 0
    total_messages = ContactMessage.objects.count() if ContactMessage else 0
    
    # Calculate user growth percentage
    previous_month_start = last_month - timedelta(days=30)
    previous_month_users = BaseUser.objects.filter(
        date_joined__gte=previous_month_start,
        date_joined__lt=last_month
    ).count()
    
    if previous_month_users > 0:
        growth_percentage = ((new_users_this_month - previous_month_users) / previous_month_users) * 100
    else:
        growth_percentage = 100 if new_users_this_month > 0 else 0
    
    # Revenue (if you have payment model)
    try:
        from accounts.models import Transaction  # Adjust import
        total_revenue = Transaction.objects.filter(
            # status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        monthly_revenue = Transaction.objects.filter(
            # created_at__gte=last_month,
            # status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
    except:
        total_revenue = 0
        monthly_revenue = 0
    
    return Response({
        # User Stats
        'totalUsers': total_users,
        'activeUsers': active_users,
        'premiumUsers': premium_users,
        'newUsersThisMonth': new_users_this_month,
        'newUsersThisWeek': new_users_this_week,
        'userGrowthPercentage': round(growth_percentage, 2),
        
        # Vehicle Stats
        'totalVehicles': total_vehicles,
        
        # Trip Stats
        'totalTrips': total_trips,
        'activeTrips': active_trips,
        
        # Notification Stats
        'totalNotifications': total_notifications,
        'sentNotifications': sent_notifications,
        
        # Message Stats
        'totalMessages': total_messages,
        'pendingMessages': pending_messages,
        
        # Revenue Stats
        'totalRevenue': float(total_revenue),
        'monthlyRevenue': float(monthly_revenue),
    })


# ============================================
# 2. USER GROWTH CHART
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def users_growth_chart(request):
    """
    User registration growth over last 7 days
    """
    today = timezone.now().date()
    data = []
    
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        count = BaseUser.objects.filter(
            date_joined__date=date
        ).count()
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'day': date.strftime('%a'),  # Mon, Tue, etc.
            'users': count,
            'label': date.strftime('%b %d')  # Jan 01
        })
    
    return Response(data)


# ============================================
# 3. NOTIFICATIONS CHART
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def notifications_chart(request):
    """
    Notifications sent over last 7 days
    """
    today = timezone.now().date()
    data = []
    
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        
        # Adjust field name based on your model
        count = ScheduledNotification.objects.filter(
            # sent_at__date=date,  # or created_at__date
            # status='sent'
        ).count() if ScheduledNotification else 0
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'day': date.strftime('%a'),
            'count': count,
            'label': date.strftime('%b %d')
        })
    
    return Response(data)


# ============================================
# 4. VEHICLE TYPES DISTRIBUTION
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def vehicle_types_chart(request):
    """
    Distribution of vehicle types
    """
    if not Vehicle:
        return Response([])
    
    vehicle_types = Vehicle.objects.values('vehicle_type').annotate(
        count=Count('id')
    ).order_by('-count')[:5]  # Top 5 vehicle types
    
    data = []
    for vtype in vehicle_types:
        data.append({
            'name': vtype['vehicle_type'] or 'Unknown',
            'value': vtype['count']
        })
    
    return Response(data)


# ============================================
# 5. MEMBERSHIP DISTRIBUTION
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def membership_distribution_chart(request):
    """
    Distribution of membership types
    """
    # If your User model has membership_type field
    if hasattr(BaseUser, 'membership_type'):
        memberships = BaseUser.objects.values('membership_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        data = []
        for membership in memberships:
            data.append({
                'name': membership['membership_type'] or 'Free',
                'value': membership['count']
            })
    else:
        # Default data if no membership field
        data = [
            {'name': 'Free', 'value': BaseUser.objects.count()},
        ]
    
    return Response(data)


# ============================================
# 6. REVENUE CHART (Optional)
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def revenue_chart(request):
    """
    Revenue over last 7 days
    """
    try:
        from accounts.models import Transaction  # Adjust import
        
        today = timezone.now().date()
        data = []
        
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            revenue = Transaction.objects.filter(
                # created_at__date=date,
                # status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'day': date.strftime('%a'),
                'revenue': float(revenue),
                'label': date.strftime('%b %d')
            })
        
        return Response(data)
    except:
        return Response([])


# ============================================
# 7. TRIP STATISTICS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def trip_statistics_chart(request):
    """
    Trip statistics over last 7 days
    """
    if not Trip:
        return Response([])
    
    today = timezone.now().date()
    data = []
    
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        count = Trip.objects.filter(
            # created_at__date=date  # or start_date__date
        ).count()
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'day': date.strftime('%a'),
            'trips': count,
            'label': date.strftime('%b %d')
        })
    
    return Response(data)


# ============================================
# 8. ADMIN USER LIST (For User Management)
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_user_list(request):
    """
    Get all users for admin panel with pagination
    """
    # Get query parameters
    search = request.GET.get('search', '')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    
    # Base queryset
    users = BaseUser.objects.all()
    
    # Search filter
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(phone__icontains=search) if hasattr(BaseUser, 'phone') else Q()
        )
    
    # Count total
    total_count = users.count()
    
    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    users_page = users[start:end]
    
    # Serialize data
    data = []
    for user in users_page:
        data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': getattr(user, 'phone', ''),
            'isActive': user.is_active,
            'dateJoined': user.date_joined.isoformat(),
            'membershipType': getattr(user, 'membership_type', 'Free'),
            # Add more fields as needed
        })
    
    return Response({
        'count': total_count,
        'page': page,
        'pageSize': page_size,
        'totalPages': (total_count + page_size - 1) // page_size,
        'results': data
    })


# ============================================
# 9. BLOCKED USERS
# ============================================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def blocked_users_list(request):
    """
    Get list of blocked/inactive users
    """
    blocked_users = BaseUser.objects.filter(is_active=False)
    
    data = []
    for user in blocked_users:
        data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': getattr(user, 'phone', ''),
            'dateJoined': user.date_joined.isoformat(),
        })
    
    return Response(data)


# ============================================
# URLS CONFIGURATION
# ============================================
"""
Add this to your API/urls.py or create API/new_urls.py:

from django.urls import path
from .views import dashboard

urlpatterns = [
    # Dashboard Stats
    path('stats/', dashboard.dashboard_stats, name='dashboard-stats'),
    
    # Charts
    path('charts/users-growth/', dashboard.users_growth_chart, name='users-growth'),
    path('charts/notifications/', dashboard.notifications_chart, name='notifications-chart'),
    path('charts/vehicle-types/', dashboard.vehicle_types_chart, name='vehicle-types'),
    path('charts/memberships/', dashboard.membership_distribution_chart, name='memberships'),
    path('charts/revenue/', dashboard.revenue_chart, name='revenue-chart'),
    path('charts/trips/', dashboard.trip_statistics_chart, name='trips-chart'),
    
    # Admin User Management
    path('users/', dashboard.admin_user_list, name='admin-users'),
    path('users/blocked/', dashboard.blocked_users_list, name='blocked-users'),
]

Then in your main urls.py:
    path('api/dashboard/', include('API.new_urls')),
"""


# ============================================
# CURRENT USER VIEW (for /api/auth/me/)
# ============================================
"""
Add this to API/views/auth.py or accounts/views.py:
"""

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Get current authenticated user details
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'phone': getattr(user, 'phone', ''),
        'role': 'admin' if user.is_staff else 'user',
        'isStaff': user.is_staff,
        'isSuperuser': user.is_superuser,
        'isActive': user.is_active,
        'dateJoined': user.date_joined.isoformat(),
    })
