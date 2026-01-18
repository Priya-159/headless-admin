// Mock API Service - Returns mock data when Django is not available
import { mockData, delay } from '../utils/mockData';

class MockApiService {
  private showedMockWarning = false;

  private showMockModeWarning() {
    if (!this.showedMockWarning) {
      console.log('%c🔧 DEVELOPMENT MODE ACTIVE', 'background: #FFA500; color: white; font-size: 14px; padding: 8px;');
      console.log('%c→ Using mock data because Django is not running', 'color: #FFA500; font-size: 12px;');
      console.log('%c→ Start Django to use real data: python manage.py runserver', 'color: #666; font-size: 11px;');
      this.showedMockWarning = true;
    }
  }

  async handleMockRequest<T>(handler: () => Promise<T> | T): Promise<T> {
    this.showMockModeWarning();
    await delay(300); // Simulate network delay
    return handler();
  }

  // Authentication
  async login(username: string, password: string) {
    return this.handleMockRequest(() => {
      if (username === 'admin' && password === 'admin123') {
        return mockData.auth.login;
      }
      throw new Error('Invalid credentials');
    });
  }

  async getUserInfo() {
    return this.handleMockRequest(() => mockData.auth.user);
  }

  // Dashboard
  async getDashboardStats() {
    return this.handleMockRequest(() => mockData.dashboard.stats);
  }

  async getUsersGrowth() {
    return this.handleMockRequest(() => mockData.dashboard.usersGrowth);
  }

  async getNotificationsChart() {
    return this.handleMockRequest(() => mockData.dashboard.notifications);
  }

  async getTripsChart() {
    return this.handleMockRequest(() => mockData.dashboard.trips);
  }

  async getVehicleTypes() {
    return this.handleMockRequest(() => mockData.dashboard.vehicleTypes);
  }

  async getMemberships() {
    return this.handleMockRequest(() => mockData.dashboard.memberships);
  }

  async getUsers() {
    return this.handleMockRequest(() => mockData.dashboard.users);
  }

  async getBlockedUsers() {
    return this.handleMockRequest(() => mockData.dashboard.blockedUsers);
  }

  async blockUser(userId: string) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'User blocked successfully (mock)',
    }));
  }

  async unblockUser(userId: string) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'User unblocked successfully (mock)',
    }));
  }

  // Locations
  async getCountries() {
    return this.handleMockRequest(() => mockData.locations.countries);
  }

  async getStates() {
    return this.handleMockRequest(() => mockData.locations.states);
  }

  async getCities() {
    return this.handleMockRequest(() => mockData.locations.cities);
  }

  async createCountry(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Country created (mock)',
      data: { id: Date.now(), ...data },
    }));
  }

  async updateCountry(id: string, data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Country updated (mock)',
    }));
  }

  async deleteCountry(id: string) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Country deleted (mock)',
    }));
  }

  // Vehicles
  async getVehicleStats() {
    return this.handleMockRequest(() => mockData.vehicles.stats);
  }

  async getVehicleMakers() {
    return this.handleMockRequest(() => mockData.vehicles.makers);
  }

  async getVehicleModels() {
    return this.handleMockRequest(() => mockData.vehicles.models);
  }

  async getTrips() {
    return this.handleMockRequest(() => mockData.vehicles.trips);
  }

  async addTrip(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Trip added (mock)',
      data: { id: Date.now(), ...data },
    }));
  }

  async deleteTrip(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Trip deleted (mock)',
    }));
  }

  async endTrip(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Trip ended (mock)',
    }));
  }

  async getLogbooks() {
    return this.handleMockRequest(() => mockData.vehicles.logbooks);
  }

  async addLog(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Log added (mock)',
      data: { id: Date.now(), ...data },
    }));
  }

  async deleteLog(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Log deleted (mock)',
    }));
  }

  async getReminders() {
    return this.handleMockRequest(() => mockData.vehicles.reminders);
  }

  async deleteReminder(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Reminder deleted (mock)',
    }));
  }

  async getEmergencyNumbers() {
    return this.handleMockRequest(() => mockData.vehicles.emergencyNumbers);
  }

  async createEmergencyNumber(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Emergency number created (mock)',
      data: { id: Date.now(), ...data },
    }));
  }

  async updateEmergencyNumber(id: string, data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Emergency number updated (mock)',
    }));
  }

  async deleteEmergencyNumber(id: string) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Emergency number deleted (mock)',
    }));
  }

  // Notifications
  async getActiveNotifications() {
    return this.handleMockRequest(() => mockData.notifications.active);
  }

  async getScheduledNotifications() {
    return this.handleMockRequest(() => mockData.notifications.scheduled);
  }

  async createScheduledNotification(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Notification scheduled (mock)',
      data: { id: Date.now(), ...data },
    }));
  }

  async updateScheduledNotification(id: string, data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Notification updated (mock)',
    }));
  }

  async deleteScheduledNotification(id: string) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Notification deleted (mock)',
    }));
  }

  async readNotification(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Notification marked as read (mock)',
    }));
  }

  async readAllNotifications() {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'All notifications marked as read (mock)',
    }));
  }

  // Contact Messages
  async getMessages() {
    return this.handleMockRequest(() => mockData.contactMessages);
  }

  async sendMessage(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Message sent (mock)',
    }));
  }

  // FCM Devices
  async getFCMDevices() {
    return this.handleMockRequest(() => mockData.fcmDevices);
  }

  async createDevice(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Device registered (mock)',
      data: { id: Date.now(), ...data },
    }));
  }

  // Subscription
  async getSubscriptionPlans() {
    return this.handleMockRequest(() => mockData.subscription.plans);
  }

  async getUserSubscriptions() {
    return this.handleMockRequest(() => mockData.subscription.userSubscriptions);
  }

  // Payments
  async getTransactions() {
    return this.handleMockRequest(() => mockData.payments.transactions);
  }

  // Fuel Prices
  async getFuelPrices() {
    return this.handleMockRequest(() => mockData.fuelPrices);
  }

  // Settings
  async getUserSettings() {
    return this.handleMockRequest(() => ({
      data: {
        id: 1,
        userId: 1,
        theme: 'light',
        notifications: true,
        language: 'en',
        distanceUnit: 'km',
        fuelUnit: 'liters',
        currency: 'INR',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-07T00:00:00Z',
      }
    }));
  }

  // Additional Vehicle Methods
  async getTipOfDay() {
    return this.handleMockRequest(() => ({
      data: {
        id: 1,
        title: 'Check Your Tire Pressure',
        description: 'Maintaining proper tire pressure improves fuel efficiency by up to 3% and extends tire life.',
        category: 'Maintenance',
        createdAt: '2025-01-07T00:00:00Z',
      }
    }));
  }

  async getVehicleCostAnalytics() {
    return this.handleMockRequest(() => ({
      data: {
        totalCost: 125000,
        fuelCost: 75000,
        maintenanceCost: 35000,
        insuranceCost: 15000,
        monthlyBreakdown: [
          { month: 'Jan', fuel: 6500, maintenance: 2500, insurance: 1250 },
          { month: 'Feb', fuel: 6300, maintenance: 2800, insurance: 1250 },
          { month: 'Mar', fuel: 6700, maintenance: 3200, insurance: 1250 },
          { month: 'Apr', fuel: 6200, maintenance: 2600, insurance: 1250 },
          { month: 'May', fuel: 6800, maintenance: 3100, insurance: 1250 },
          { month: 'Jun', fuel: 6400, maintenance: 2900, insurance: 1250 },
        ]
      }
    }));
  }

  async getInsuranceCallbackData() {
    return this.handleMockRequest(() => ({
      data: {
        id: 1,
        vehicleId: 1,
        provider: 'ICICI Lombard',
        policyNumber: 'ICICI-2024-1234567',
        coverageAmount: 500000,
        premium: 15000,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        status: 'active',
        claimStatus: 'none',
        createdAt: '2024-01-01T00:00:00Z',
      }
    }));
  }

  // Accounts Page Data
  async getAccountTransactions() {
    return this.handleMockRequest(() => ({
      data: [
        { id: 1, type: 'income', description: 'Product Sale - iPhone 15', amount: 999, date: '2024-12-30', status: 'completed', category: 'Sales' },
        { id: 2, type: 'expense', description: 'Server Hosting', amount: 299, date: '2024-12-29', status: 'completed', category: 'Infrastructure' },
        { id: 3, type: 'income', description: 'Subscription Payment', amount: 49.99, date: '2024-12-29', status: 'completed', category: 'Recurring' },
        { id: 4, type: 'expense', description: 'Marketing Campaign', amount: 1500, date: '2024-12-28', status: 'completed', category: 'Marketing' },
        { id: 5, type: 'income', description: 'Product Sale - MacBook', amount: 1999, date: '2024-12-28', status: 'pending', category: 'Sales' },
        { id: 6, type: 'income', description: 'Service Payment', amount: 750, date: '2024-12-27', status: 'completed', category: 'Services' },
        { id: 7, type: 'expense', description: 'Office Supplies', amount: 234.50, date: '2024-12-27', status: 'completed', category: 'Operations' },
      ]
    }));
  }

  async getAccountInvoices() {
    return this.handleMockRequest(() => ({
      data: [
        { id: 'INV-001', client: 'Acme Corp', amount: 5499, status: 'paid', dueDate: '2024-12-25', paidDate: '2024-12-24' },
        { id: 'INV-002', client: 'TechStart Inc', amount: 3200, status: 'pending', dueDate: '2025-01-05', paidDate: null },
        { id: 'INV-003', client: 'Digital Agency', amount: 7800, status: 'overdue', dueDate: '2024-12-20', paidDate: null },
        { id: 'INV-004', client: 'StartUp Labs', amount: 2100, status: 'paid', dueDate: '2024-12-28', paidDate: '2024-12-27' },
      ]
    }));
  }

  async getAccountChartData() {
    return this.handleMockRequest(() => ({
      data: [
        { month: 'Jul', income: 35000, expenses: 15000 },
        { month: 'Aug', income: 42000, expenses: 18000 },
        { month: 'Sep', income: 38000, expenses: 16000 },
        { month: 'Oct', income: 45000, expenses: 19000 },
        { month: 'Nov', income: 52000, expenses: 21000 },
        { month: 'Dec', income: 48000, expenses: 17000 },
      ]
    }));
  }

  async getBalanceStats() {
    return this.handleMockRequest(() => ({
      data: {
        balance: 125430.50,
        income: 45231.89,
        expenses: 12450.30,
      }
    }));
  }

  // Analytics Page Data
  async getPageViewsData() {
    return this.handleMockRequest(() => ({
      data: [
        { time: '00:00', views: 1200, users: 450 },
        { time: '04:00', views: 800, users: 280 },
        { time: '08:00', views: 2400, users: 890 },
        { time: '12:00', views: 3100, users: 1200 },
        { time: '16:00', views: 2800, users: 1050 },
        { time: '20:00', views: 2200, users: 820 },
      ]
    }));
  }

  async getDeviceData() {
    return this.handleMockRequest(() => ({
      data: [
        { name: 'Desktop', value: 45, color: '#3b82f6' },
        { name: 'Mobile', value: 38, color: '#10b981' },
        { name: 'Tablet', value: 17, color: '#f59e0b' },
      ]
    }));
  }

  async getTopPagesData() {
    return this.handleMockRequest(() => ({
      data: [
        { page: '/dashboard', views: 12543, bounce: 32 },
        { page: '/products', views: 9821, bounce: 28 },
        { page: '/about', views: 7234, bounce: 45 },
        { page: '/contact', views: 5123, bounce: 38 },
        { page: '/blog', views: 4321, bounce: 52 },
      ]
    }));
  }

  async getCountriesData() {
    return this.handleMockRequest(() => ({
      data: [
        { country: 'India', users: 5420, flag: '🇮🇳' },
        { country: 'United States', users: 3210, flag: '🇺🇸' },
        { country: 'United Kingdom', users: 2150, flag: '🇬🇧' },
        { country: 'Canada', users: 1840, flag: '🇨🇦' },
        { country: 'Australia', users: 1230, flag: '🇦🇺' },
      ]
    }));
  }

  // Chat/Fuel Price Queries
  async getFuelPriceQueries() {
    return this.handleMockRequest(() => ({
      data: [
        { id: 1, sender: 'Rajesh Kumar', contact: '+91 98765 43210', status: 'active', subject: 'Fuel Price Query', lastMessage: 'Hi, I noticed the petrol price in Mumbai increased...', timestamp: '09:15 AM' },
        { id: 2, sender: 'Priya Sharma', contact: '+91 87654 32109', status: 'resolved', subject: 'Diesel Rate Update', lastMessage: 'Can you confirm the current diesel rate?', timestamp: '08:45 AM' },
        { id: 3, sender: 'Amit Patel', contact: '+91 76543 21098', status: 'pending', subject: 'Fuel Price Query', lastMessage: 'I would like to know about CNG prices...', timestamp: 'Yesterday' },
      ]
    }));
  }

  async getChatMessages(queryId: number) {
    return this.handleMockRequest(() => ({
      data: [
        {
          id: 1,
          queryId,
          sender: 'user',
          content: 'Hi, I noticed the petrol price in Mumbai increased by ₹3 yesterday. Is this correct?',
          timestamp: '09:15 AM',
          status: 'read',
        },
        {
          id: 2,
          queryId,
          sender: 'admin',
          content: 'Yes, that is correct. The petrol price was updated to ₹106.50/L in Mumbai effective from yesterday.',
          timestamp: '09:18 AM',
          status: 'read',
        },
      ]
    }));
  }

  async sendChatMessage(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Message sent (mock)',
      data: { id: Date.now(), ...data, timestamp: new Date().toISOString() },
    }));
  }

  // Products
  async getProducts() {
    return this.handleMockRequest(() => ({
      data: [
        { id: 1, name: 'iPhone 15 Pro', category: 'Electronics', price: '$999', stock: 45, status: 'in-stock' },
        { id: 2, name: 'MacBook Air M2', category: 'Electronics', price: '$1,199', stock: 23, status: 'in-stock' },
        { id: 3, name: 'AirPods Pro', category: 'Electronics', price: '$249', stock: 0, status: 'out-of-stock' },
        { id: 4, name: 'iPad Pro 12.9"', category: 'Electronics', price: '$1,099', stock: 12, status: 'in-stock' },
        { id: 5, name: 'Apple Watch Series 9', category: 'Electronics', price: '$399', stock: 8, status: 'low-stock' },
      ]
    }));
  }

  async createProduct(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Product created (mock)',
      data: { id: Date.now(), ...data },
    }));
  }

  async updateProduct(id: number, data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Product updated (mock)',
    }));
  }

  async deleteProduct(id: number) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'Product deleted (mock)',
    }));
  }

  // Users Management
  async getUsersList() {
    return this.handleMockRequest(() => ({
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', joined: '2024-01-15', lastActive: '2 hours ago', orders: 45 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active', joined: '2024-02-20', lastActive: '5 mins ago', orders: 23 },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'active', joined: '2024-03-10', lastActive: '1 hour ago', orders: 12 },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'inactive', joined: '2024-01-05', lastActive: '2 days ago', orders: 67 },
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'active', joined: '2024-04-12', lastActive: '30 mins ago', orders: 8 },
      ]
    }));
  }

  async createUserAccount(data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'User created (mock)',
      data: { id: Date.now(), ...data, joined: new Date().toISOString() },
    }));
  }

  async updateUserAccount(id: number, data: any) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'User updated (mock)',
    }));
  }

  async deleteUserAccount(id: number) {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: 'User deleted (mock)',
    }));
  }

  // Dashboard Revenue and Categories
  async getRevenueData() {
    return this.handleMockRequest(() => ({
      data: [
        { month: 'Jan', revenue: 4000, sales: 2400 },
        { month: 'Feb', revenue: 3000, sales: 1398 },
        { month: 'Mar', revenue: 2000, sales: 9800 },
        { month: 'Apr', revenue: 2780, sales: 3908 },
        { month: 'May', revenue: 1890, sales: 4800 },
        { month: 'Jun', revenue: 2390, sales: 3800 },
        { month: 'Jul', revenue: 3490, sales: 4300 },
      ]
    }));
  }

  async getCategoryData() {
    return this.handleMockRequest(() => ({
      data: [
        { name: 'Electronics', value: 4000 },
        { name: 'Clothing', value: 3000 },
        { name: 'Books', value: 2000 },
        { name: 'Home', value: 2780 },
        { name: 'Sports', value: 1890 },
      ]
    }));
  }

  async getRecentActivities() {
    return this.handleMockRequest(() => ({
      data: [
        {
          id: 1,
          action: 'New user registration',
          user: 'rajesh.kumar@gmail.com',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          type: 'user',
          description: 'New user signed up from Mumbai'
        },
        {
          id: 2,
          action: 'Vehicle added',
          user: 'Maruti Swift VXI',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          type: 'vehicle',
          description: 'User added new vehicle to account'
        },
        {
          id: 3,
          action: 'Payment received',
          user: '₹499 - Premium Plan',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          type: 'payment',
          description: 'Subscription payment completed'
        },
        {
          id: 4,
          action: 'Trip completed',
          user: 'Mumbai to Pune - 148 km',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          type: 'trip',
          description: 'User completed trip tracking'
        },
        {
          id: 5,
          action: 'Notification sent',
          user: '1,234 users',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          type: 'notification',
          description: 'Fuel price update notification'
        },
      ]
    }));
  }

  // Generic fallback for any endpoint
  async genericMock(endpoint: string, method: string = 'GET') {
    return this.handleMockRequest(() => ({
      status: 'success',
      message: `Mock response for ${method} ${endpoint}`,
      data: [],
    }));
  }
}

export const mockApi = new MockApiService();