import { useState, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { Smartphone, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import GenericTable from './GenericTable';
import api from '../../services/api';
import { Badge } from './ui/badge';
import { StatCard } from './StatCard';
import { useTheme } from '../../contexts/ThemeContext';

const UserCell = ({ userId }: { userId: number | null }) => {
  const [info, setInfo] = useState<string>('-');

  useEffect(() => {
    if (!userId) {
      setInfo('-');
      return;
    }
    // Check if userId looks like an ID
    api.accounts.users.get(userId)
      .then((res: any) => {
        const display = res.username || res.phone || res.phone_no || res.email || `User #${userId}`;
        setInfo(display);
      })
      .catch(() => setInfo(`${userId}`));
  }, [userId]);

  if (!userId) return <span className="text-gray-400">-</span>;
  if (info === '-') return <span className="text-gray-400 animate-pulse">Loading...</span>;
  return <span className="font-medium">{info}</span>;
};

export function FCMDevicesPage() {
  const { searchQuery } = useSearch();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const statsData = await api.fcm.getSummaryStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTable = () => {
    const tableElement = document.getElementById('fcm-devices-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'FCM device', accessor: 'registration_id', render: (row: any) => <div className="max-w-[200px] truncate" title={row.registration_id}>{row.registration_id}</div> },
    { header: 'Device ID', accessor: 'device_id', render: (row: any) => row.device_id || '-' },
    { header: 'Name', accessor: 'name', render: (row: any) => row.name || '-' },
    { header: 'Type', accessor: 'type' },
    { header: 'User', accessor: 'user', render: (row: any) => <UserCell userId={row.user} /> },
    { header: 'Active', accessor: 'active', render: (row: any) => row.active ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="destructive">No</Badge> },
    { header: 'Creation date', accessor: 'date_created', render: (row: any) => row.date_created ? new Date(row.date_created * 1000).toLocaleString() : '-' },
  ];

  if (loading) return <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>FCM Devices Dashboard</h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Monitor Firebase Cloud Messaging devices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Devices",
            value: stats?.totalDevices || 0,
            description: "Registered FCM devices",
            icon: Smartphone,
            iconColor: "#fff",
            iconBgColor: "#3b82f6",
            growth: 7.3,
            onClick: scrollToTable
          },
          {
            title: "Active Devices",
            value: stats?.activeDevices || 0,
            description: "Currently active",
            icon: CheckCircle,
            iconColor: "#fff",
            iconBgColor: "#10b981",
            growth: 4.2,
            onClick: scrollToTable
          },
          {
            title: "Android Devices",
            value: stats?.androidDevices || 0,
            description: "Android platform",
            icon: Wifi,
            iconColor: "#fff",
            iconBgColor: "#a855f7",
            growth: 12.1,
            onClick: scrollToTable
          },
          {
            title: "iOS Devices",
            value: stats?.iosDevices || 0,
            description: "iOS platform",
            icon: WifiOff,
            iconColor: "#fff",
            iconBgColor: "#f59e0b",
            growth: -2.5,
            onClick: scrollToTable
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
            onClick={card.onClick}
          />
        ))}
      </div>

      <div id="fcm-devices-table">
        <GenericTable
          title="FCM Devices"
          columns={columns}
          fetchData={(params) => api.fcm.devices.list(params)}
          showAnalytics={false}
          paginationMode="server"
        />
      </div>
    </div>
  );
}
