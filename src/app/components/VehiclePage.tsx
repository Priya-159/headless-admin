import { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useNavigate } from 'react-router-dom';
import { Car, Route, Bell as AlertBell, FileText, Factory, Layers, Component, MessageSquare, Lightbulb, Settings, Fuel } from 'lucide-react';
import GenericTable from './GenericTable';
import api from '../../services/api';
import { Badge } from './ui/badge';
import { StatCard } from './StatCard';
import { useTheme } from '../../contexts/ThemeContext';

interface VehiclePageProps {
  section?: string;
}


const VehicleModelCell = ({ modelId }: { modelId: string | number }) => {
  const [name, setName] = useState<string>('');
  useEffect(() => {
    if (!modelId) { setName('-'); return; }
    // If it's not a number, render as is (fallback)
    if (typeof modelId !== 'number' && !String(modelId).match(/^\d+$/)) {
      setName(String(modelId));
      return;
    }
    api.vehicle.vehicleModels.get(modelId)
      .then((res: any) => setName(`${modelId}-${res.name}`))
      .catch(() => setName(`${modelId}`));
  }, [modelId]);
  return <span>{name}</span>;
  return <span>{name}</span>;
};

const TripVehicleInfoCell = ({ vehicleId, vehicleName }: { vehicleId: string | number, vehicleName?: string }) => {
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    if (!vehicleId) { setInfo(vehicleName || '-'); return; }

    const fetchData = async () => {
      try {
        const vehicle = await api.vehicle.userVehicles.get(vehicleId);

        // Prioritize username as requested
        let userInfo = 'Unknown';
        if (vehicle.user_id) {
          try {
            const user = await api.accounts.users.get(vehicle.user_id);
            userInfo = user.username || user.phone || user.phone_no || 'Unknown';
          } catch { }
        }

        let modelName = vehicleName || 'Unknown Model';
        if (vehicle.vehicle_model) {
          try {
            const model = await api.vehicle.vehicleModels.get(vehicle.vehicle_model);
            modelName = model.name;
          } catch { }
        }

        setInfo(`${userInfo} - ${modelName}`);
      } catch {
        setInfo(vehicleName || `Vehicle #${vehicleId}`);
      }
    };

    fetchData();
  }, [vehicleId, vehicleName]);

  if (!info) return <span className="text-gray-400 text-xs">Loading...</span>;
  return <span className="font-medium whitespace-nowrap">{info}</span>;
};

export function VehiclePage({ section }: VehiclePageProps) {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!section) {
      fetchStats();
    }
  }, [section]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const statsData = await api.vehicle.getSummaryStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };


  // ... (Columns definitions remain same) ...

  const logBookColumns = [
    { header: 'User', accessor: 'user' },
    { header: 'Vehicle', accessor: 'vehicle_name' },
    { header: 'Type', accessor: 'log_type', render: (row: any) => row.log_type === 'fuel_log' ? <Badge variant="secondary">Fuel</Badge> : <Badge variant="outline">Service</Badge> },
    { header: 'Amount', accessor: 'amount', render: (row: any) => row.amount ? `₹${row.amount}` : '-' },
    { header: 'Odometer', accessor: 'odo_meter_reading' },
    { header: 'Fuel (L)', accessor: 'fuel_volume' },
    { header: 'Date', accessor: 'date' },
  ];

  const notificationColumns = [
    { header: 'User', accessor: 'user' },
    { header: 'Title', accessor: 'title' },
    { header: 'Message', accessor: 'message' },
    { header: 'Created at', accessor: 'created_at', render: (row: any) => row.created_at ? new Date(row.created_at * 1000).toLocaleString() : '-' },
    { header: 'Is read', accessor: 'is_read', render: (row: any) => row.is_read ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="secondary">No</Badge> },
  ];

  const reminderColumns = [
    { header: 'User', accessor: 'user' },
    { header: 'Reminder type', accessor: 'reminder_type' },
    { header: 'Due date', accessor: 'due_date' },
    { header: 'Vehicle number', accessor: 'vehicle_number' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Title', accessor: 'title' },
  ];

  const tipOfDayColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Message', accessor: 'message' },
  ];

  const tripColumns = [
    { header: 'Vehicle', accessor: 'vehicle', render: (row: any) => <TripVehicleInfoCell vehicleId={row.vehicle} vehicleName={row.vehicle_name} /> },
    { header: 'Start time', accessor: 'date', render: (row: any) => row.date ? new Date(row.date * 1000).toLocaleString() : '-' },
    { header: 'End time', accessor: 'end_time', render: (row: any) => row.end_time ? new Date(row.end_time).toLocaleString() : '-' },
    { header: 'Distance', accessor: 'distance' },
    { header: 'Is ended', accessor: 'is_ended', render: (row: any) => row.is_ended ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="destructive">No</Badge> },
    { header: 'Is archieved', accessor: 'is_archieved', render: (row: any) => row.is_archieved ? 'Yes' : 'No' },
  ];

  const userSettingsColumns = [
    { header: 'User', accessor: 'user' },
    { header: 'Lower speed limit', accessor: 'lower_speed_limit' },
    { header: 'Upper speed limit', accessor: 'upper_speed_limit' },
  ];

  const userFuelPriceColumns = [
    { header: 'User', accessor: 'user' },
    { header: 'Petrol price', accessor: 'petrol_price' },
    { header: 'Diesel price', accessor: 'diesel_price' },
    { header: 'Cng price', accessor: 'cng_price' },
    { header: 'Electricity price', accessor: 'electricity_price' },
    { header: 'Modefied at', accessor: 'modefied_at', render: (row: any) => row.modefied_at ? new Date(row.modefied_at * 1000).toLocaleString() : '-' },
  ];

  const userVehiclesColumns = [
    { header: 'User', accessor: 'user' },
    { header: 'Make', accessor: 'vehicle_company' },
    { header: 'Model', accessor: 'vehicle_model', render: (row: any) => <VehicleModelCell modelId={row.vehicle_model} /> },
    { header: 'Type', accessor: 'vehicle_type' },
    { header: 'Plate No.', accessor: 'no_plate' },
    { header: 'Fuel', accessor: 'fuel_type' },
    { header: 'Gears', accessor: 'gears' },
    { header: 'Active', accessor: 'is_active', render: (row: any) => row.is_active ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="destructive">No</Badge> },
  ];

  const vehicleMakerColumns = [
    { header: 'Name', accessor: 'name' },
  ];

  const vehicleModelColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Vehicle Type', accessor: 'vehicle_type' },
    { header: 'Fuel Type', accessor: 'fuel_type' },
    { header: 'Maker', accessor: 'maker' },
    { header: 'Gears', accessor: 'gears' },
  ];

  const vehicleTypeColumns = [
    { header: 'Name', accessor: 'name' },
  ];

  if (!section) {
    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>Vehicle Dashboard</h1>
          <p className="mb-6" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Comprehensive vehicle management and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Vehicles",
              value: stats?.totalVehicles || 0,
              description: "Registered vehicles",
              icon: Car,
              iconColor: "#fff",
              iconBgColor: "#3b82f6",
              growth: 6.8,
              path: '/vehicle/user-vehicles'
            },
            {
              title: "Total Trips",
              value: stats?.totalTrips || 0,
              description: "Completed journeys",
              icon: Route,
              iconColor: "#fff",
              iconBgColor: "#10b981",
              growth: 18.5,
              path: '/vehicle/trips'
            },
            {
              title: "Active Reminders",
              value: stats?.activeReminders || 0,
              description: "Upcoming maintenance",
              icon: AlertBell,
              iconColor: "#fff",
              iconBgColor: "#f59e0b",
              growth: -4.2,
              path: '/vehicle/reminders'
            },
            {
              title: "Total Logbooks",
              value: stats?.totalLogbooks || 0,
              description: "Maintenance records",
              icon: FileText,
              iconColor: "#fff",
              iconBgColor: "#a855f7",
              growth: 11.3,
              path: '/vehicle/logbooks'
            },
            {
              title: "Vehicle Makers",
              value: stats?.totalMakers || 0,
              description: "Registered makers",
              icon: Factory,
              iconColor: "#fff",
              iconBgColor: "#ef4444",
              growth: 2.5,
              path: '/vehicle/makers'
            },
            {
              title: "Vehicle Models",
              value: stats?.totalModels || 0,
              description: "Registered models",
              icon: Component,
              iconColor: "#fff",
              iconBgColor: "#06b6d4",
              growth: 5.1,
              path: '/vehicle/models'
            },
            {
              title: "Vehicle Types",
              value: stats?.totalTypes || 0,
              description: "Registered types",
              icon: Layers,
              iconColor: "#fff",
              iconBgColor: "#8b5cf6",
              growth: 0.5,
              path: '/vehicle/types'
            },
            {
              title: "Vehicle Notifications",
              value: stats?.totalNotifications || 0,
              description: "System notifications",
              icon: MessageSquare,
              iconColor: "#fff",
              iconBgColor: "#6366f1",
              growth: 0.0,
              path: '/vehicle/notifications'
            },
            {
              title: "Tip Of Day",
              value: stats?.totalTips || 0,
              description: "Daily tips",
              icon: Lightbulb,
              iconColor: "#fff",
              iconBgColor: "#eab308",
              growth: 0.0,
              path: '/vehicle/tip-of-day'
            },
            {
              title: "User Settings",
              value: stats?.totalUserSettings || 0,
              description: "Configuration settings",
              icon: Settings,
              iconColor: "#fff",
              iconBgColor: "#64748b",
              growth: 0.0,
              path: '/vehicle/user-settings'
            },
            {
              title: "User Fuel Prices",
              value: stats?.totalUserFuelPrices || 0,
              description: "Fuel price logs",
              icon: Fuel,
              iconColor: "#fff",
              iconBgColor: "#f43f5e",
              growth: 0.0,
              path: '/vehicle/user-fuel-prices'
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

  switch (section) {
    case 'logbooks':
      return <GenericTable title="Log Books" columns={logBookColumns} fetchData={(params) => api.vehicle.logBooks.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'notifications':
      return <GenericTable title="Vehicle Notifications" columns={notificationColumns} fetchData={(params) => api.vehicle.notifications.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'reminders':
      return <GenericTable title="Reminders" columns={reminderColumns} fetchData={(params) => api.vehicle.reminders.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'tip-of-day':
      return <GenericTable title="Tip Of Day" columns={tipOfDayColumns} fetchData={(params) => api.vehicle.tipOfDay.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'trips':
      return <GenericTable title="Trips" columns={tripColumns} fetchData={(params) => api.vehicle.trips.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'user-settings':
      return <GenericTable title="User Settings" columns={userSettingsColumns} fetchData={(params) => api.vehicle.userSettings.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'user-fuel-prices':
      return <GenericTable title="User Fuel Prices" columns={userFuelPriceColumns} fetchData={(params) => api.vehicle.userFuelPrices.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'user-vehicles':
      return <GenericTable title="User Vehicles" columns={userVehiclesColumns} fetchData={(params) => api.vehicle.userVehicles.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'makers':
      return <GenericTable title="Vehicle Makers" columns={vehicleMakerColumns} fetchData={(params) => api.vehicle.vehicleMakers.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'models':
      return <GenericTable title="Vehicle Models" columns={vehicleModelColumns} fetchData={(params) => api.vehicle.vehicleModels.list(params)} showAnalytics={false} paginationMode="server" />;

    case 'types':
      return <GenericTable title="Vehicle Types" columns={vehicleTypeColumns} fetchData={(params) => api.vehicle.vehicleTypes.list(params)} showAnalytics={false} paginationMode="server" />;

    default:
      return <div>Section not found: {section}</div>;
  }
}
