// Mock data for development when Django is not running
export const mockData = {
  // Mock JWT tokens
  auth: {
    login: {
      access: 'mock-access-token-dev-mode',
      refresh: 'mock-refresh-token-dev-mode',
    },
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@fuelabc.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    },
  },

  // Dashboard stats
  dashboard: {
    stats: {
      totalUsers: 15234,
      activeUsers: 12456,
      totalVehicles: 8923,
      totalNotifications: 456,
      totalRevenue: 1234567,
      newUsersToday: 234,
      activeTrips: 145,
      totalMessages: 89,
    },
    usersGrowth: [
      { month: 'Jan', users: 4000 },
      { month: 'Feb', users: 5200 },
      { month: 'Mar', users: 6800 },
      { month: 'Apr', users: 8400 },
      { month: 'May', users: 10200 },
      { month: 'Jun', users: 12456 },
    ],
    notifications: [
      { month: 'Jan', sent: 2400, read: 2100 },
      { month: 'Feb', sent: 3200, read: 2800 },
      { month: 'Mar', sent: 4100, read: 3600 },
      { month: 'Apr', sent: 5000, read: 4400 },
      { month: 'May', sent: 4500, read: 4000 },
      { month: 'Jun', sent: 5200, read: 4700 },
    ],
    trips: [
      { month: 'Jan', trips: 1400 },
      { month: 'Feb', trips: 1600 },
      { month: 'Mar', trips: 1800 },
      { month: 'Apr', trips: 2200 },
      { month: 'May', trips: 2600 },
      { month: 'Jun', trips: 2900 },
    ],
    vehicleTypes: [
      { name: 'Bike', value: 3456 },
      { name: 'Car', value: 4234 },
      { name: 'Truck', value: 867 },
      { name: 'Scooter', value: 366 },
    ],
    memberships: [
      { name: 'Free', value: 8234 },
      { name: 'Basic', value: 3456 },
      { name: 'Premium', value: 1234 },
    ],
    users: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `+91 ${9000000000 + i}`,
      name: `User ${i + 1}`,
      isActive: Math.random() > 0.3,
      isBlocked: Math.random() > 0.9,
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
      lastLogin: new Date(2024, 5, Math.floor(Math.random() * 7) + 1).toISOString(),
    })),
    blockedUsers: Array.from({ length: 5 }, (_, i) => ({
      id: i + 100,
      username: `blocked${i + 1}`,
      email: `blocked${i + 1}@example.com`,
      phone: `+91 ${8000000000 + i}`,
      name: `Blocked User ${i + 1}`,
      isActive: false,
      isBlocked: true,
      blockReason: 'Suspicious activity',
      blockedAt: new Date(2024, 5, i + 1).toISOString(),
      createdAt: new Date(2024, 0, i + 1).toISOString(),
    })),
  },

  // User info
  userInfo: {
    id: 1,
    username: 'admin',
    email: 'admin@fuelabc.com',
    phone: '+91 9876543210',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },

  // Locations
  locations: {
    countries: [
      { id: 1, name: 'India', code: 'IN', currency: 'INR', isActive: true },
      { id: 2, name: 'United States', code: 'US', currency: 'USD', isActive: true },
    ],
    states: [
      { id: 1, name: 'Maharashtra', countryId: 1, code: 'MH', isActive: true },
      { id: 2, name: 'Karnataka', countryId: 1, code: 'KA', isActive: true },
      { id: 3, name: 'Gujarat', countryId: 1, code: 'GJ', isActive: true },
      { id: 4, name: 'Tamil Nadu', countryId: 1, code: 'TN', isActive: true },
      { id: 5, name: 'Delhi', countryId: 1, code: 'DL', isActive: true },
    ],
    cities: [
      { id: 1, name: 'Mumbai', stateId: 1, isActive: true },
      { id: 2, name: 'Pune', stateId: 1, isActive: true },
      { id: 3, name: 'Bangalore', stateId: 2, isActive: true },
      { id: 4, name: 'Ahmedabad', stateId: 3, isActive: true },
      { id: 5, name: 'Chennai', stateId: 4, isActive: true },
    ],
  },

  // Vehicles
  vehicles: {
    stats: {
      totalVehicles: 8923,
      activeVehicles: 7456,
      totalTrips: 45678,
      totalDistance: 234567,
    },
    types: [
      { id: 1, name: 'Bike', icon: '🏍️', isActive: true },
      { id: 2, name: 'Car', icon: '🚗', isActive: true },
      { id: 3, name: 'Truck', icon: '🚚', isActive: true },
      { id: 4, name: 'Scooter', icon: '🛵', isActive: true },
    ],
    makers: [
      { id: 1, name: 'Maruti Suzuki', country: 'India', isActive: true },
      { id: 2, name: 'Hyundai', country: 'South Korea', isActive: true },
      { id: 3, name: 'Tata Motors', country: 'India', isActive: true },
      { id: 4, name: 'Mahindra', country: 'India', isActive: true },
      { id: 5, name: 'Honda', country: 'Japan', isActive: true },
    ],
    models: [
      { id: 1, name: 'Swift', makerId: 1, year: 2024, isActive: true },
      { id: 2, name: 'Alto', makerId: 1, year: 2024, isActive: true },
      { id: 3, name: 'i20', makerId: 2, year: 2024, isActive: true },
      { id: 4, name: 'Creta', makerId: 2, year: 2024, isActive: true },
      { id: 5, name: 'Nexon', makerId: 3, year: 2024, isActive: true },
    ],
    trips: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      vehicleId: Math.floor(Math.random() * 5) + 1,
      vehicleName: `Vehicle ${Math.floor(Math.random() * 5) + 1}`,
      startLocation: 'Mumbai',
      endLocation: 'Pune',
      startTime: new Date(2024, 5, Math.floor(Math.random() * 7) + 1, 9, 0).toISOString(),
      endTime: new Date(2024, 5, Math.floor(Math.random() * 7) + 1, 12, 0).toISOString(),
      distance: Math.floor(Math.random() * 200) + 50,
      fuelUsed: Math.floor(Math.random() * 20) + 5,
      cost: Math.floor(Math.random() * 2000) + 500,
      status: ['completed', 'ongoing', 'planned'][Math.floor(Math.random() * 3)],
    })),
    logbooks: Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      vehicleId: Math.floor(Math.random() * 5) + 1,
      vehicleName: `Vehicle ${Math.floor(Math.random() * 5) + 1}`,
      type: ['Fuel', 'Service', 'Maintenance', 'Other'][Math.floor(Math.random() * 4)],
      description: `Log entry ${i + 1}`,
      amount: Math.floor(Math.random() * 5000) + 500,
      date: new Date(2024, 5, Math.floor(Math.random() * 7) + 1).toISOString(),
      odometer: Math.floor(Math.random() * 50000) + 10000,
    })),
    reminders: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      vehicleId: Math.floor(Math.random() * 5) + 1,
      vehicleName: `Vehicle ${Math.floor(Math.random() * 5) + 1}`,
      type: ['Service', 'Insurance', 'PUC', 'Other'][Math.floor(Math.random() * 4)],
      title: `Reminder ${i + 1}`,
      description: `Reminder description ${i + 1}`,
      dueDate: new Date(2024, 6, i + 1).toISOString(),
      status: ['pending', 'completed', 'overdue'][Math.floor(Math.random() * 3)],
    })),
    emergencyNumbers: [
      { id: 1, serviceName: 'Police', phoneNumber: '+91 100', description: 'Emergency police helpline', isActive: true },
      { id: 2, serviceName: 'Ambulance', phoneNumber: '+91 108', description: 'Emergency medical services', isActive: true },
      { id: 3, serviceName: 'Fire Brigade', phoneNumber: '+91 101', description: 'Fire emergency services', isActive: true },
      { id: 4, serviceName: 'Road Assistance', phoneNumber: '+91 1800-123-4567', description: '24/7 roadside assistance', isActive: true },
    ],
  },

  // Notifications
  notifications: {
    active: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      title: `Notification ${i + 1}`,
      message: `This is notification message ${i + 1}`,
      type: ['info', 'warning', 'success', 'error'][Math.floor(Math.random() * 4)],
      isRead: Math.random() > 0.5,
      createdAt: new Date(2024, 5, Math.floor(Math.random() * 7) + 1, Math.floor(Math.random() * 24)).toISOString(),
      userId: Math.floor(Math.random() * 50) + 1,
    })),
    scheduled: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Scheduled Notification ${i + 1}`,
      message: `This is scheduled message ${i + 1}`,
      scheduledDate: new Date(2024, 6, i + 1, 10, 0).toISOString(),
      status: ['pending', 'sent', 'failed'][Math.floor(Math.random() * 3)],
      createdAt: new Date(2024, 5, i + 1).toISOString(),
    })),
  },

  // Contact Messages
  contactMessages: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    phone: `+91 ${9000000000 + i}`,
    subject: `Message Subject ${i + 1}`,
    message: `This is a contact message from user ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    type: ['inquiry', 'feedback', 'complaint', 'support'][Math.floor(Math.random() * 4)],
    status: ['pending', 'read', 'replied', 'resolved'][Math.floor(Math.random() * 4)],
    isRead: Math.random() > 0.5,
    createdAt: new Date(2024, 5, Math.floor(Math.random() * 7) + 1, Math.floor(Math.random() * 24)).toISOString(),
  })),

  // FCM Devices
  fcmDevices: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    deviceToken: `fcm-token-${i + 1}-${Math.random().toString(36).substr(2, 9)}`,
    platform: ['android', 'ios', 'web'][Math.floor(Math.random() * 3)],
    userId: Math.floor(Math.random() * 50) + 1,
    userName: `User ${Math.floor(Math.random() * 50) + 1}`,
    isActive: Math.random() > 0.2,
    lastUsed: new Date(2024, 5, Math.floor(Math.random() * 7) + 1).toISOString(),
    createdAt: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString(),
  })),

  // Subscription
  subscription: {
    plans: [
      { id: 1, name: 'Free', price: 0, duration: 'Forever', features: ['Basic features', 'Limited trips'] },
      { id: 2, name: 'Basic', price: 299, duration: 'Monthly', features: ['All basic features', 'Unlimited trips', 'Analytics'] },
      { id: 3, name: 'Premium', price: 999, duration: 'Monthly', features: ['All features', 'Priority support', 'Advanced analytics'] },
    ],
    userSubscriptions: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      userId: i + 1,
      userName: `User ${i + 1}`,
      plan: ['Free', 'Basic', 'Premium'][Math.floor(Math.random() * 3)],
      status: 'active',
      startDate: new Date(2024, 0, i + 1).toISOString(),
      endDate: new Date(2024, 11, 31).toISOString(),
      amount: [0, 299, 999][Math.floor(Math.random() * 3)],
    })),
  },

  // Payments
  payments: {
    transactions: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      userId: Math.floor(Math.random() * 50) + 1,
      userName: `User ${Math.floor(Math.random() * 50) + 1}`,
      amount: Math.floor(Math.random() * 1000) + 99,
      status: ['success', 'pending', 'failed'][Math.floor(Math.random() * 3)],
      paymentMethod: ['razorpay', 'upi', 'card'][Math.floor(Math.random() * 3)],
      transactionId: `TXN${Date.now()}${i}`,
      createdAt: new Date(2024, 5, Math.floor(Math.random() * 7) + 1, Math.floor(Math.random() * 24)).toISOString(),
    })),
  },

  // Fuel Prices
  fuelPrices: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'][i % 5],
    state: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal'][i % 5],
    petrol: 100 + Math.floor(Math.random() * 10),
    diesel: 90 + Math.floor(Math.random() * 10),
    updatedAt: new Date(2024, 5, 7).toISOString(),
  })),
};

// Helper to simulate API delay
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses with success/error simulation
export const mockApiResponse = async <T>(data: T, shouldFail = false): Promise<T> => {
  await delay(300); // Simulate network delay

  if (shouldFail) {
    throw new Error('Mock API Error');
  }

  return data;
};
