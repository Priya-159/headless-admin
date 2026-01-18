import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Users, UserCheck, UserX, Globe, MapPin, CreditCard, TrendingUp, Calendar, MessageSquare, Bell, Shield, Edit, Save, Activity, Settings, Phone, Route } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import GenericTable from './GenericTable';
import { StatCard } from './StatCard';
import { useSearch } from '../../contexts/SearchContext';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AccountsDashboardProps {
  section?: string;
}

export function AccountsDashboard({ section }: AccountsDashboardProps) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { searchQuery } = useSearch();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  const [isEditFreeRequestOpen, setIsEditFreeRequestOpen] = useState(false);
  const [currentFreeRequest, setCurrentFreeRequest] = useState<any>(null);

  const handleEditClick = (row: any) => {
    setCurrentNotification({
      ...row,
      // Ensure dates are converted to safe format for inputs if possible, but API expects timestamp or string?
      // Assuming API handles whatever, but usually inputs need YYYY-MM-DDTHH:mm
      scheduled_date_local: row.scheduled_date ? new Date(row.scheduled_date * 1000).toISOString().slice(0, 16) : '',
      expiry_date_local: row.expiry_date ? new Date(row.expiry_date * 1000).toISOString().slice(0, 16) : ''
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateNotificationClick = () => {
    setCurrentNotification({
      feature_name: '',
      notification_title: '',
      priority: 1,
      scheduled_date_local: '',
      expiry_date_local: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveNotification = async () => {
    if (!currentNotification) return;
    try {
      const payload = {
        feature_name: currentNotification.feature_name,
        notification_title: currentNotification.notification_title,
        priority: currentNotification.priority,
        scheduled_date: currentNotification.scheduled_date_local ? new Date(currentNotification.scheduled_date_local).toISOString() : null,
        expiry_date: currentNotification.expiry_date_local ? new Date(currentNotification.expiry_date_local).toISOString() : null,
      };

      // Frontend validation for dates
      if (payload.scheduled_date && payload.expiry_date) {
        if (new Date(payload.scheduled_date) >= new Date(payload.expiry_date)) {
          toast.error("Scheduled date must be before expiry date");
          return;
        }
      }

      if (currentNotification.id) {
        await api.accounts.scheduledNotifications.update(currentNotification.id, payload);
        toast.success('Notification updated successfully');
      } else {
        await api.accounts.scheduledNotifications.create(payload);
        toast.success('Notification created successfully');
      }

      setIsEditDialogOpen(false);
      // Reload data? GenericTable handles its own data but we are distinct. 
      // We might need to refresh page or rely on user navigating back.
      // Actually GenericTable has no ref to reload. 
      // I'll reload window or just close dialog for now.
      window.location.reload();
    } catch (e: any) {
      console.error(e);
      // Extract error message from API response if available
      let errorMessage = 'Failed to update notification';
      if (e.response && e.response.data) {
        // Handle DRF error format (e.g. { field: ["error"] } or ["error"])
        const data = e.response.data;
        if (typeof data === 'object') {
          const messages = Object.values(data).flat().join(', ');
          if (messages) errorMessage = messages;
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleEditFreeRequestClick = (row: any) => {
    setCurrentFreeRequest({ ...row });
    setIsEditFreeRequestOpen(true);
  };

  const handleSaveFreeRequest = async () => {
    if (!currentFreeRequest) return;
    try {
      const payload = {
        granted_requests: parseInt(currentFreeRequest.granted_requests)
      };
      await api.accounts.freeRequestDeviceLogs.patch(currentFreeRequest.id, payload);
      toast.success('Free Request Log updated successfully');
      setIsEditFreeRequestOpen(false);
      window.location.reload();
    } catch (e) {
      toast.error('Failed to update free request log');
      console.error(e);
    }
  };

  const suggestions = {
    titles: ['New Feature Alert', 'Maintenance Update', 'Special Offer', 'System Notification'],
    features: ['Maps', 'Fuel Prices', 'Profile', 'Settings']
  };

  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!section) {
      fetchDashboardData();
    }
  }, [section]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setAccessDenied(false);
    try {
      const statsData = await api.accounts.getSummaryStats();
      setStats(statsData);
    } catch (e: any) {
      console.error(e);
      // Check for 403 Forbidden or specific error message
      if (e.message?.includes('403') || e.message?.includes('permission') || e.response?.status === 403) {
        setAccessDenied(true);
      } else {
        toast.error('Failed to fetch dashboard stats');
      }
    } finally {
      setLoading(false);
    }
  };

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md mb-6">
          You are logged in, but you do not have the required <strong>Admin Permissions</strong> to view this dashboard.
        </p>
        <Button onClick={() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }} variant="destructive">
          Log Out
        </Button>
      </div>
    );
  }



  // Column definitions remain the same...
  const userColumns = [
    { header: 'Username', accessor: 'username' },
    { header: 'U name', accessor: 'u_name' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    { header: 'Paidorfree', accessor: 'paidorfree' },
    { header: 'Totalvehicle', accessor: 'total_vehicle' },
    { header: 'Date joined', accessor: 'date_joined', render: (row: any) => row.date_joined ? new Date(row.date_joined * 1000).toLocaleDateString() : '-' },
  ];

  const apiUsageColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Date', accessor: 'usage_date' },
    { header: 'Route API', accessor: 'route_api_count' },
    { header: 'Toll API', accessor: 'toll_api_count' },
  ];

  const adminControlColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Value', accessor: 'value' },
    { header: 'Description', accessor: 'descripttion' },
  ];

  const countryColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Code', accessor: 'country_code' },
    { header: 'Currency', accessor: 'currency.code' },
  ];

  const emergencyColumns = [
    { header: 'Country', accessor: 'country_name' },
    { header: 'Title', accessor: 'title' },
    { header: 'Detail Name', accessor: 'description' },
    { header: 'Number', accessor: 'number' },
    { header: 'Sequence', accessor: 'sequence' },
  ];

  const freeRequestColumns = [
    { header: 'Device ID Hash', accessor: 'device_id_hash' },
    { header: 'User ID', accessor: 'user_id' },
    { header: 'Granted requests', accessor: 'granted_requests' },
    { header: 'Used requests', accessor: 'used_requests' },
    { header: 'First claimed at', accessor: 'first_claimed_at', render: (row: any) => row.first_claimed_at ? new Date(row.first_claimed_at * 1000).toLocaleString() : '-' },
    { header: 'Last claimed at', accessor: 'last_claimed_at', render: (row: any) => row.last_claimed_at ? new Date(row.last_claimed_at * 1000).toLocaleString() : '-' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleEditFreeRequestClick(row)}>
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
      )
    }
  ];

  const otpColumns = [
    { header: 'OTP', accessor: 'otp' },
    { header: 'Time', accessor: 'time', render: (row: any) => row.time ? new Date(row.time * 1000).toLocaleString() : '-' },
  ];

  const scheduledNotifColumns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Status',
      accessor: 'id',
      render: (row: any) => {
        if (!row.is_active) return <Badge variant="secondary">Disabled</Badge>;

        const now = new Date();
        const start = row.scheduled_date ? new Date(row.scheduled_date * 1000) : null;
        const end = row.expiry_date ? new Date(row.expiry_date * 1000) : null;

        if (end && now > end) return <Badge variant="destructive">Expired</Badge>;
        if (start && now < start) return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Scheduled</Badge>;

        return <Badge className="bg-green-500">Active</Badge>;
      }
    },
    { header: 'Feature Name', accessor: 'feature_name' },
    { header: 'Title', accessor: 'notification_title' },
    { header: 'Is Active', accessor: 'is_active', render: (row: any) => row.is_active ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="secondary">No</Badge> },
    { header: 'Priority', accessor: 'priority' },
    { header: 'Scheduled Date', accessor: 'scheduled_date', render: (row: any) => row.scheduled_date ? new Date(row.scheduled_date * 1000).toLocaleString() : '-' },
    { header: 'Expiry Date', accessor: 'expiry_date', render: (row: any) => row.expiry_date ? new Date(row.expiry_date * 1000).toLocaleString() : '-' },
    { header: 'Created At', accessor: 'created_at', render: (row: any) => row.created_at ? new Date(row.created_at * 1000).toLocaleString() : '-' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleEditClick(row)}>
          <Edit className="w-4 h-4 mr-1" /> Edit
        </Button>
      )
    }
  ];

  const stateColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Country', accessor: 'country' },
  ];

  const subscriptionColumns = [
    { header: 'User', accessor: 'user' },
    { header: 'Subscription price', accessor: 'subscription_price' },
    { header: 'Donation', accessor: 'donation_tree_count' },
    { header: 'Is completed', accessor: 'is_completed', render: (row: any) => row.is_completed ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="destructive">No</Badge> },
    { header: 'Completed at', accessor: 'completed_at', render: (row: any) => row.completed_at ? new Date(row.completed_at * 1000).toLocaleString() : '-' },
  ];

  const tripUsageColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Username', accessor: 'username' },
    { header: 'Number', accessor: 'number' },
    { header: 'Vehicle Name', accessor: 'vehicle_name' },
    { header: 'Vehicle Type', accessor: 'vehicle_type' },
    { header: 'User Type', accessor: 'is_premium', render: (row: any) => row.is_premium ? <Badge className="bg-purple-500">Premium</Badge> : <Badge variant="secondary">Standard</Badge> },
    { header: 'Trip Count', accessor: 'trip_count' },
    { header: 'Trip Date', accessor: 'trip_date', render: (row: any) => row.trip_date ? new Date(row.trip_date * 1000).toLocaleDateString() : '-' },
  ];

  // Main Overview Section
  if (!section) {
    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>Accounts Dashboard</h1>
          <p className="mb-6" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Comprehensive account management and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "API Usage Counts",
              value: stats?.apiUsageCount || 0,
              description: "Route and Toll API statistics",
              icon: Activity,
              iconColor: "#fff",
              iconBgColor: "#3b82f6",
              growth: 18.2,
              path: '/accounts/api-usage'
            },
            {
              title: "Admin Controls",
              value: stats?.adminControlsCount || 0,
              description: "System configuration settings",
              icon: Settings,
              iconColor: "#fff",
              iconBgColor: "#a855f7",
              growth: -5.1,
              path: '/accounts/admin-controls'
            },
            {
              title: "Countries",
              value: stats?.countriesCount || 0,
              description: "Supported countries",
              icon: Globe,
              iconColor: "#fff",
              iconBgColor: "#10b981",
              growth: 3.4,
              path: '/accounts/countries'
            },
            {
              title: "Emergency Numbers",
              value: stats?.emergencyNumbersCount || 0,
              description: "Emergency contact database",
              icon: Phone,
              iconColor: "#fff",
              iconBgColor: "#ef4444",
              growth: 2.1,
              path: '/accounts/emergency-numbers'
            },
            {
              title: "Free Request Device Logs",
              value: stats?.freeRequestsCount || 0,
              description: "Device request tracking",
              icon: Shield,
              iconColor: "#fff",
              iconBgColor: "#6366f1",
              growth: 12.8,
              path: '/accounts/free-requests'
            },
            {
              title: "OTPs",
              value: stats?.otpsCount || 0,
              description: "One-time password logs",
              icon: Bell,
              iconColor: "#fff",
              iconBgColor: "#f59e0b",
              growth: 29.3,
              path: '/accounts/otps'
            },
            {
              title: "Scheduled Notifications",
              value: stats?.scheduledNotificationsCount || 0,
              description: "Notification scheduling",
              icon: Bell,
              iconColor: "#fff",
              iconBgColor: "#ec4899",
              growth: 9.7,
              path: '/accounts/scheduled-notifications'
            },
            {
              title: "States",
              value: stats?.statesCount || 0,
              description: "State-wise data",
              icon: MapPin,
              iconColor: "#fff",
              iconBgColor: "#14b8a6",
              growth: 1.2,
              path: '/accounts/states'
            },
            {
              title: "Total Users",
              value: stats?.usersCount || 0,
              description: "Registered users",
              icon: Users,
              iconColor: "#fff",
              iconBgColor: "#2563eb",
              growth: 5.4,
              path: '/accounts/users'
            },
            {
              title: "Subscriptions",
              value: stats?.subscriptionsCount || 0,
              description: "Total transactions",
              icon: CreditCard,
              iconColor: "#fff",
              iconBgColor: "#16a34a",
              growth: 8.9,
              path: '/accounts/subscriptions'
            },
            {
              title: "Trip Usages",
              value: stats?.tripUsagesCount || 0,
              description: "Total trip records",
              icon: Route,
              iconColor: "#fff",
              iconBgColor: "#9333ea",
              growth: 12.5,
              path: '/accounts/trip-usages'
            }
          ].filter(card => card.title.toLowerCase().includes(searchQuery.toLowerCase())).map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
              iconColor={card.iconColor}
              iconBgColor={card.iconBgColor}
              growth={card.growth}
              onClick={() => navigate(card.path)}
            />
          ))}
        </div>
      </div>

    );
  }

  // Sub-sections
  switch (section) {
    case 'all-users':
    case 'users':
      return <GenericTable title="Users" columns={userColumns} fetchData={(params) => api.accounts.users.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'api-usage':
      return <GenericTable title="API Usage Counts" columns={apiUsageColumns} fetchData={(params) => api.accounts.apiUsageCounts.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'admin-controls':
      return <GenericTable title="Admin Controls" columns={adminControlColumns} fetchData={(params) => api.accounts.adminControls.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'countries':
      return <GenericTable title="Countries" columns={countryColumns} fetchData={(params) => api.accounts.countries.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'emergency':
    case 'emergency-numbers':
      return <GenericTable title="Emergency Numbers" columns={emergencyColumns} fetchData={(params) => api.accounts.emergencyNumbers.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'free-requests':
      return (
        <>
          <GenericTable title="Free Request Device Logs" columns={freeRequestColumns} fetchData={(params) => api.accounts.freeRequestDeviceLogs.list(params)} showAnalytics={false} paginationMode="server" />
          <Dialog open={isEditFreeRequestOpen} onOpenChange={setIsEditFreeRequestOpen}>
            <DialogContent className="sm:max-w-[400px]" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
              <DialogHeader>
                <DialogTitle style={{ color: isDarkMode ? '#fff' : '#000' }}>Edit Free Request Log</DialogTitle>
                <CardDescription style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Update the granted requests for this device.</CardDescription>
              </DialogHeader>
              {currentFreeRequest && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Device ID Hash</Label>
                    <div className="text-sm break-all" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{currentFreeRequest.device_id_hash}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Granted Requests</Label>
                    <Input
                      type="number"
                      value={currentFreeRequest.granted_requests}
                      onChange={(e) => setCurrentFreeRequest({ ...currentFreeRequest, granted_requests: e.target.value })}
                      style={{
                        backgroundColor: isDarkMode ? '#374151' : '#fff',
                        color: isDarkMode ? '#fff' : '#000',
                        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
                      }}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditFreeRequestOpen(false)} style={{ color: isDarkMode ? '#000' : 'inherit' }}>Cancel</Button>
                <Button onClick={handleSaveFreeRequest}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );

    case 'otps':
      return <GenericTable title="OTPs" columns={otpColumns} fetchData={(params) => api.accounts.otps.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'scheduled-notifs':
    case 'scheduled-notifications':
      return (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={handleCreateNotificationClick}>
              + Create Notification
            </Button>
          </div>
          <GenericTable
            title="Scheduled Notifications"
            columns={scheduledNotifColumns}
            fetchData={(params) => api.accounts.scheduledNotifications.list(params)}
            showAnalytics={false}
            paginationMode="server"
            onRowClick={handleEditClick}
          />
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
              <DialogHeader>
                <DialogTitle style={{ color: isDarkMode ? '#fff' : '#000' }}>{currentNotification?.id ? 'Edit' : 'Create'} Scheduled Notification</DialogTitle>
              </DialogHeader>
              {currentNotification && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Feature Name</Label>
                    <Input
                      value={currentNotification.feature_name}
                      onChange={(e) => setCurrentNotification({ ...currentNotification, feature_name: e.target.value })}
                      style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {suggestions.features.map(s => (
                        <Badge key={s} variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setCurrentNotification({ ...currentNotification, feature_name: s })}>
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Notification Title</Label>
                    <Input
                      value={currentNotification.notification_title}
                      onChange={(e) => setCurrentNotification({ ...currentNotification, notification_title: e.target.value })}
                      style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}
                    />
                    <div className="flex gap-2 flex-wrap">
                      {suggestions.titles.map(s => (
                        <Badge key={s} variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setCurrentNotification({ ...currentNotification, notification_title: s })}>
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Scheduled Date</Label>
                    <Input
                      type="datetime-local"
                      value={currentNotification.scheduled_date_local}
                      onChange={(e) => setCurrentNotification({ ...currentNotification, scheduled_date_local: e.target.value })}
                      style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Expiry Date</Label>
                    <Input
                      type="datetime-local"
                      value={currentNotification.expiry_date_local}
                      onChange={(e) => setCurrentNotification({ ...currentNotification, expiry_date_local: e.target.value })}
                      style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} style={{ color: isDarkMode ? '#000' : 'inherit' }}>Cancel</Button>
                <Button onClick={handleSaveNotification}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );

    case 'states':
      return <GenericTable title="States" columns={stateColumns} fetchData={(params) => api.accounts.states.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'subscriptions':
    case 'subscription':
      return <GenericTable title="Subscription Transactions" columns={subscriptionColumns} fetchData={(params) => api.accounts.subscriptionTransactions.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'trip-usages':
      return <GenericTable title="Trip Usages" columns={tripUsageColumns} fetchData={(params) => api.accounts.tripUsages.list(params)} showAnalytics={false} paginationMode="server" />;

    default:
      return <div>Section not found: {section}</div>;
  }
}