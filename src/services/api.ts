import http from '../utils/http';
import { mockApi } from './mockApi';

class ApiService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  private async tryRequestWithFallback<T>(
    djangoRequest: () => Promise<T>,
    mockRequest: () => Promise<T>,
    method: string = 'GET',
    endpoint: string = ''
  ): Promise<T> {
    // Only cache GET requests with an endpoint
    if (method === 'GET' && endpoint) {
      const cached = this.cache.get(endpoint);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
        console.log(`[Cache Hit] ${endpoint}`);
        return cached.data;
      }
    }

    // Clear cache on write operations for that resource segment
    if (method !== 'GET' && endpoint) {
      const segment = endpoint.split('/')[1]; // Basic segment invalidation
      for (const key of this.cache.keys()) {
        if (key.includes(`/${segment}/`)) {
          this.cache.delete(key);
        }
      }
    }

    try {
      const response = await djangoRequest();
      if (method === 'GET' && endpoint) {
        this.cache.set(endpoint, { data: response, timestamp: Date.now() });
      }
      return response;
    } catch (error: any) {
      if (error.message === 'NETWORK_ERROR') {
        const mockResponse = await mockRequest();
        if (method === 'GET' && endpoint) {
          this.cache.set(endpoint, { data: mockResponse, timestamp: Date.now() });
        }
        return mockResponse;
      }
      throw error;
    }
  }

  // --- AUTH & PROFILE ---
  auth = {
    updateProfile: (data: any) => this.tryRequestWithFallback(
      () => http.put('/user_update_profile', data),
      () => Promise.resolve({ success: true, msg: 'Profile updated (mock)' }),
      'PUT',
      '/user_update_profile'
    ),
    changePassword: (data: any) => this.tryRequestWithFallback(
      () => http.post('/user_change_password', data),
      () => Promise.resolve({ success: true, msg: 'Password changed (mock)' }),
      'POST',
      '/user_change_password'
    ),
  };

  // Generic Resource Generator
  private createResource(endpoint: string) {
    const mockList = () => Promise.resolve({ results: [] });
    const mockDetail = () => Promise.resolve({});

    return {
      list: (params?: any) => {
        const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
        return this.tryRequestWithFallback(() => http.get(endpoint, params), mockList, 'GET', url);
      },
      get: (id: string | number) => this.tryRequestWithFallback(() => http.get(`${endpoint}${id}/`), mockDetail, 'GET', `${endpoint}${id}/`),
      create: (data: any) => this.tryRequestWithFallback(
        () => data instanceof FormData ? http.upload(endpoint, data) : http.post(endpoint, data),
        mockDetail,
        'POST',
        endpoint
      ),
      update: (id: string | number, data: any) => this.tryRequestWithFallback(() => http.put(`${endpoint}${id}/`, data), mockDetail, 'PUT', `${endpoint}${id}/`),
      patch: (id: string | number, data: any) => this.tryRequestWithFallback(() => http.patch(`${endpoint}${id}/`, data), mockDetail, 'PATCH', `${endpoint}${id}/`),
      delete: (id: string | number) => this.tryRequestWithFallback(() => http.delete(`${endpoint}${id}/`), mockDetail, 'DELETE', `${endpoint}${id}/`),
    };
  }

  // --- DASHBOARD (Keep existing specific methods) ---
  dashboard = {
    getStats: async () => this.tryRequestWithFallback(() => http.get('/dashboard/stats/'), () => mockApi.getDashboardStats(), 'GET', '/dashboard/stats/'),
    getUsersGrowth: async (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/users-growth/', { period }), () => mockApi.getUsersGrowth(), 'GET', `/dashboard/users-growth/${period || ''}`),
    getRevenueData: async (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/revenue-chart/', { period }), () => mockApi.getRevenueData(), 'GET', `/dashboard/revenue-chart/${period || ''}`),
    getCategoryData: async () => this.tryRequestWithFallback(() => http.get('/dashboard/vehicle-types/'), () => mockApi.getCategoryData(), 'GET', '/dashboard/vehicle-types/'),
    getNotificationsChart: async (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/notifications-chart/', { period }), () => mockApi.getNotificationsChart(), 'GET', `/dashboard/notifications-chart/${period || ''}`),
    getTripsChart: async (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/trip-statistics/', { period }), () => mockApi.getTripsChart(), 'GET', `/dashboard/trip-statistics/${period || ''}`),
    getRecentActivities: async () => {
      const res = await this.tryRequestWithFallback(
        () => http.get('/dashboard/stats/'),
        () => mockApi.getRecentActivities(),
        'GET',
        '/dashboard/recent-activities/'
      );
      const activities = (res as any).data?.recentActivities || (res as any).recentActivities;
      return { data: activities || [] };
    },
    // New Stats Methods
    getFreeRequestStats: (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/free-requests-stats/', { period }), () => Promise.resolve([]), 'GET', `/dashboard/free-requests-stats/${period || ''}`),
    getTripUsageStats: (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/trip-usage-stats/', { period }), () => Promise.resolve([]), 'GET', `/dashboard/trip-usage-stats/${period || ''}`),
    getScheduledCampaignStats: (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/scheduled-campaigns-stats/', { period }), () => Promise.resolve([]), 'GET', `/dashboard/scheduled-campaigns-stats/${period || ''}`),
    getLogBookStats: (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/log-book-stats/', { period }), () => Promise.resolve([]), 'GET', `/dashboard/log-book-stats/${period || ''}`),
    getUserFuelPriceStats: (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/user-fuel-price-stats/', { period }), () => Promise.resolve([]), 'GET', `/dashboard/user-fuel-price-stats/${period || ''}`),
    getUserVehicleStats: (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/user-vehicle-stats/', { period }), () => Promise.resolve([]), 'GET', `/dashboard/user-vehicle-stats/${period || ''}`),
    getApiUsageStats: (period?: string) => this.tryRequestWithFallback(() => http.get('/dashboard/api-usage/', { period }), () => Promise.resolve([]), 'GET', `/dashboard/api-usage/${period || ''}`),
  };

  // --- ACCOUNTS TAB ---
  accounts = {
    apiUsageCounts: this.createResource('/api_usage_counts/'),
    adminControls: this.createResource('/admin_controls/'),
    countries: this.createResource('/countries/'),
    emergencyNumbers: this.createResource('/emergency_numbers/'),
    freeRequestDeviceLogs: this.createResource('/free_request_device_logs/'),
    otps: this.createResource('/otps/'),
    scheduledNotifications: this.createResource('/app_scheduled_notifications/'),
    states: this.createResource('/states/'),
    subscriptionTransactions: this.createResource('/subscription_transactions/'),
    tripUsages: this.createResource('/trip_usages/'),
    users: this.createResource('/admin_users/'), // Use new Admin User ViewSet
    // New Consolidated Stats
    getSummaryStats: async () => this.tryRequestWithFallback(
      () => http.get('/dashboard/accounts-stats/'),
      () => Promise.resolve({}), // Mock fallbacks if needed
      'GET',
      '/dashboard/accounts-stats/'
    ),
  };

  // --- CONTACT MESSAGES TAB ---
  contactMessages = {
    threads: {
      ...this.createResource('/message_threads/'),
      toggleBlock: (id: string | number) => this.tryRequestWithFallback(() => http.post(`/message_threads/${id}/toggle_block/`), () => Promise.resolve({}), 'POST', `/message_threads/${id}/toggle_block/`),
      clearHistory: (id: string | number) => this.tryRequestWithFallback(() => http.post(`/message_threads/${id}/clear_history/`), () => Promise.resolve({}), 'POST', `/message_threads/${id}/clear_history/`),
    },
    messages: this.createResource('/messages/'),
    sendSms: this.createResource('/send_sms/'),
    getSummaryStats: async () => this.tryRequestWithFallback(
      () => http.get('/dashboard/contact-messages-stats/'),
      () => Promise.resolve({}),
      'GET',
      '/dashboard/contact-messages-stats/'
    ),
  };

  // --- FCM DEVICES TAB ---
  fcm = {
    devices: this.createResource('/fcm_devices/'),
    getSummaryStats: async () => this.tryRequestWithFallback(
      () => http.get('/dashboard/fcm-devices-stats/'),
      () => Promise.resolve({}),
      'GET',
      '/dashboard/fcm-devices-stats/'
    ),
  };

  // --- NOTIFICATION TAB ---
  notification = {
    csvCampaigns: {
      list: (params?: any) => this.tryRequestWithFallback(
        () => http.get('/notification/campaigns', params),
        () => Promise.resolve({ data: [] }),
        'GET',
        '/notification/campaigns'
      ),
      get: (id: string | number) => http.get(`/notification/campaigns/${id}`),
    },
    csvLogs: this.createResource('/csv_notification_logs/'),
    dateRangeCampaigns: this.createResource('/date_range_notification_campaigns/'),
    dateRangeLogs: this.createResource('/date_range_notification_logs/'),
    scheduledCampaigns: this.createResource('/scheduled_notification_campaigns/'),
    scheduledLogs: {
      list: (params?: any) => this.tryRequestWithFallback(
        () => http.get('/scheduled_notification_logs/', params),
        () => Promise.resolve({ count: 0, results: [] }),
        'GET',
        '/scheduled_notification_logs/'
      ),
      get: (id: string | number) => http.get(`/scheduled_notification_logs/${id}/`),
    },
    getSummaryStats: () => http.get('/dashboard/notification-stats/'),
  };

  // --- VEHICLE TAB ---
  vehicle = {
    logBooks: this.createResource('/log_books/'),
    notifications: this.createResource('/vehicle_notifications/'),
    reminders: this.createResource('/reminders/'),
    tipOfDay: this.createResource('/tip_of_day/'),
    trips: this.createResource('/trips/'),
    userSettings: this.createResource('/user_settings/'),
    userFuelPrices: this.createResource('/user_fuel_prices/'),
    userVehicles: this.createResource('/user_vehicles/'),
    vehicleMakers: this.createResource('/vehicle_makers/'),
    vehicleModels: this.createResource('/dashboard/vehicle-models/'),
    vehicleTypes: this.createResource('/vehicle_types/'),
    getSummaryStats: async () => this.tryRequestWithFallback(() => http.get('/dashboard/vehicle-stats/'), () => Promise.resolve({
      totalVehicles: 0,
      totalTrips: 0,
      activeReminders: 0,
      totalLogbooks: 0,
      totalMakers: 0,
      totalModels: 0,
      totalTypes: 0,
      totalNotifications: 0,
      totalTips: 0,
      totalUserSettings: 0,
      totalUserFuelPrices: 0
    })),
  };

  // Keep legacy aggregators if used by Home
  analytics = {
    getPageViews: async () => this.tryRequestWithFallback(() => http.get('/analytics/page-views/'), () => mockApi.getPageViewsData()),
    getDeviceStats: async () => this.tryRequestWithFallback(() => http.get('/analytics/devices/'), () => mockApi.getDeviceData()),
    getTopPages: async () => this.tryRequestWithFallback(() => http.get('/analytics/top-pages/'), () => mockApi.getTopPagesData()),
    getCountriesStats: async () => this.tryRequestWithFallback(() => http.get('/analytics/countries/'), () => mockApi.getCountriesData()),
  };
}

const api = new ApiService();
export default api;