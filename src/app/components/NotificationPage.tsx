import { useState, useCallback, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Users, CheckCircle, XCircle, Clock, Calendar, MessageSquare, Send, FileSpreadsheet, FileText, Edit, Eye, Save } from 'lucide-react';
import GenericTable from './GenericTable';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { Badge } from './ui/badge';
import { StatCard } from './StatCard';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface NotificationPageProps {
  section?: string;
}

const UserCell = ({ row }: { row: any }) => {
  const [userInfo, setUserInfo] = useState<string>('');

  useEffect(() => {
    if (!row.user) {
      setUserInfo(row.topic_name ? `Topic: ${row.topic_name}` : '-');
      return;
    }

    api.accounts.users.get(row.user)
      .then((res: any) => setUserInfo(res.username || res.email || `User #${row.user}`))
      .catch((e) => {
        console.error("Failed to fetch user", row.user, e);
        setUserInfo(`User #${row.user}`);
      });
  }, [row.user, row.topic_name]);

  if (!row.user && !row.topic_name) return <span className="text-gray-400">-</span>;
  if (!userInfo) return <span className="text-gray-400 animate-pulse">Loading...</span>;

  return <span className="font-medium">{userInfo}</span>;
};

const DateRangeCampaignCell = ({ campaignId }: { campaignId: number }) => {
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    if (!campaignId) return;
    api.notification.dateRangeCampaigns.get(campaignId)
      .then((res: any) => {
        const parts = [];
        if (res.title) parts.push(res.title);
        if (res.start_date || res.end_date) parts.push(`${res.start_date || '?'} to ${res.end_date || '?'}`);

        const memMap: any = { 'all': 'All Users', 'premium': 'Premium Users', 'non_premium': 'Non-Premium Users' };
        if (res.membership_filter) parts.push(memMap[res.membership_filter] || res.membership_filter);

        if (res.filter_no_vehicle) parts.push("No Vehicle");
        else if (res.vehicle_type_filter) parts.push(`Vehicle Type ${res.vehicle_type_filter}`);

        if (res.status) parts.push(res.status);

        setInfo(parts.join(' - '));
      })
      .catch(() => setInfo(`Campaign #${campaignId}`));
  }, [campaignId]);

  if (!info) return <span className="text-gray-400 animate-pulse">Loading...</span>;
  return <span className="text-sm">{info}</span>;
};

const StateInfoCell = ({ stateId }: { stateId: number | null }) => {
  const [name, setName] = useState<string>('');
  useEffect(() => {
    if (!stateId) { setName('All States'); return; }
    api.accounts.states.get(stateId).then((res: any) => {
      let countryName = res.country || '';
      // Remove code like ' (91)' if present
      const match = countryName.match(/^(.*)\s\(\d+\)$/);
      if (match) countryName = match[1];
      setName(`${countryName} - ${res.name}`);
    }).catch(() => setName(`State #${stateId}`));
  }, [stateId]);
  return <span>{name}</span>;
};



const UserByNameCell = ({ username }: { username: string }) => {
  const [info, setInfo] = useState<string>(username || '-');

  useEffect(() => {
    if (!username) return;
    api.accounts.users.list({ search: username })
      .then((res: any) => {
        const results = res.results || res.data || [];
        // Exact match check to avoid partial search results
        const user = results.find((u: any) => u.username === username);
        if (user) {
          const name = user.u_name || user.username;
          setInfo(user.email ? `${name} (${user.email})` : name);
        }
      })
      .catch(() => { });
  }, [username]);

  return <span className="text-sm">{info}</span>;
};

const ScheduledCampaignCell = ({ campaignId }: { campaignId: number }) => {
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    if (!campaignId) return;

    const fetchData = async () => {
      try {
        const camp = await api.notification.scheduledCampaigns.get(campaignId);

        let stateName = '';
        if (camp.state) {
          try {
            const st = await api.accounts.states.get(camp.state);
            stateName = st.name;
          } catch {
            stateName = `State #${camp.state}`;
          }
        }

        const parts = [];
        if (camp.title) parts.push(camp.title);
        if (camp.scheduled_datetime) parts.push(new Date(camp.scheduled_datetime * 1000).toLocaleString()); // Assuming timestamp from serializer

        const sendTypeMap: any = { 'send_now': 'Send Now', 'schedule_later': 'Schedule Later' };
        if (camp.send_type) parts.push(sendTypeMap[camp.send_type] || camp.send_type);

        const memMap: any = { 'all': 'All Users', 'premium': 'Premium Users', 'non_premium': 'Non-Premium Users' };
        if (camp.membership_filter) parts.push(memMap[camp.membership_filter] || camp.membership_filter);

        if (stateName) parts.push(stateName);

        if (camp.status) parts.push(camp.status);

        setInfo(parts.join(' - '));
      } catch (e) {
        setInfo(`Campaign #${campaignId}`);
      }
    };

    fetchData();
  }, [campaignId]);

  return <span className="text-sm">{info}</span>;
};

export function NotificationPage({ section }: NotificationPageProps) {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Scheduled Campaign State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  const [states, setStates] = useState<any[]>([]);

  useEffect(() => {
    if (!section) {
      fetchStats();
    }
  }, [section]);

  useEffect(() => {
    if (isDialogOpen) {
      fetchStates();
    }
  }, [isDialogOpen]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const statsRes = await api.notification.getSummaryStats();
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await api.accounts.states.list({ page_size: 100 });
      setStates(res.results || []);
    } catch (e) {
      console.error('Failed to fetch states', e);
    }
  };

  const handleCsvClick = (row: any) => navigate(`/notification/csv-logs?campaign=${row.id}`);
  const handleDateRangeClick = (row: any) => navigate(`/notification/date-range-logs?campaign=${row.id}`);

  // handleScheduledClick now opens edit dialog
  const formatDate = (val: any) => {
    if (!val) return '-';
    // If number, assume seconds (Django ViewSets often return seconds timestamp)
    if (typeof val === 'number') return new Date(val * 1000).toLocaleString();
    // If string, assume ISO (Django APIViews often return ISO string)
    return new Date(val).toLocaleString();
  };

  const handleScheduledClick = (row: any) => {
    let dateStr = '';
    if (row.scheduled_datetime) {
      const d = typeof row.scheduled_datetime === 'number'
        ? new Date(row.scheduled_datetime * 1000)
        : new Date(row.scheduled_datetime);
      dateStr = d.toISOString().slice(0, 16);
    }

    setCurrentCampaign({
      ...row,
      // Ensure specific fields are mapped strictly if needed
      state: row.state,
      scheduled_datetime: dateStr
    });
    setIsDialogOpen(true);
  };

  const handleCreateCampaignClick = () => {
    setCurrentCampaign({
      title: '',
      body: '',
      send_type: 'schedule_later',
      scheduled_datetime: '',
      membership_filter: 'all',
      state: null // or ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveCampaign = async () => {
    if (!currentCampaign) return;
    try {
      const payload = {
        title: currentCampaign.title,
        body: currentCampaign.body,
        send_type: currentCampaign.send_type,
        membership_filter: currentCampaign.membership_filter,
        state: currentCampaign.state || null,
        // Only include scheduled_datetime if it's 'schedule_later' and present
        scheduled_datetime: currentCampaign.send_type === 'schedule_later' && currentCampaign.scheduled_datetime
          ? new Date(currentCampaign.scheduled_datetime).toISOString()
          : null
      };

      if (currentCampaign.id) {
        await api.notification.scheduledCampaigns.update(currentCampaign.id, payload);
        toast.success('Campaign updated successfully');
      } else {
        await api.notification.scheduledCampaigns.create(payload);
        toast.success('Campaign created successfully');
      }
      setIsDialogOpen(false);
      window.location.reload(); // Simple reload to refresh table
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to save campaign');
    }
  };



  const handleViewLogs = (id: number, type: string) => {
    navigate(`/notification/${type}-logs?campaign=${id}`);
  };

  const handleLogClick = (row: any) => navigate(`/notification/detail?log=${row.id}&campaign=${row.campaign}`);

  const fetchCsvLogs = useCallback((params?: any) => api.notification.csvLogs.list({ ...(campaignId ? { campaign: campaignId } : {}), ...params, page_size: 1000 }), [campaignId]);
  const fetchDateRangeLogs = useCallback((params?: any) => api.notification.dateRangeLogs.list({ ...(campaignId ? { campaign: campaignId } : {}), ...params, page_size: 1000 }), [campaignId]);
  const fetchScheduledLogs = useCallback((params?: any) => api.notification.scheduledLogs.list({ ...(campaignId ? { campaign: campaignId } : {}), ...params, page_size: 1000 }), [campaignId]);

  const csvCampaignColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Total Rows', accessor: 'total_rows' },
    { header: 'Matched', accessor: 'matched_users' },
    { header: 'With Devices', accessor: 'users_with_devices' },
    { header: 'No Devices', accessor: 'users_without_devices' },
    { header: 'Sent', accessor: 'notifications_sent' },
    { header: 'Failed', accessor: 'notifications_failed' },
    { header: 'Created By', accessor: 'created_by' },
    { header: 'Created At', accessor: 'created_at', render: (row: any) => formatDate(row.created_at) },
    { header: 'Status', accessor: 'status', render: (row: any) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewLogs(row.id, 'csv')}>
          <FileText className="w-4 h-4 mr-1" /> View Logs
        </Button>
      )
    }
  ];

  const csvLogColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Campaign', accessor: 'campaign' },
    { header: 'User', accessor: 'user' },
    { header: 'Status', accessor: 'status', render: (row: any) => <StatusBadge status={row.status} /> },
    { header: 'Sent At', accessor: 'sent_at', render: (row: any) => formatDate(row.sent_at) },
  ];

  const dateRangeCampaignColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    {
      header: 'Date Range', accessor: 'id', render: (row: any) => {
        const start = row.start_date || '-';
        const end = row.end_date || '-';
        return `${start} to ${end}`;
      }
    },
    { header: 'Filter Type', accessor: 'filter_type' },
    { header: 'Membership', accessor: 'membership_filter' },
    {
      header: 'Vehicle Filter', accessor: 'id', render: (row: any) => {
        if (row.filter_no_vehicle) return "No Vehicle";
        if (row.vehicle_type_filter) return `Type ${row.vehicle_type_filter}`;
        return "All";
      }
    },
    { header: 'Total Users', accessor: 'total_users' },
    { header: 'With Devices', accessor: 'users_with_devices' },
    { header: 'No Devices', accessor: 'users_without_devices' },
    { header: 'Sent', accessor: 'notifications_sent' },
    { header: 'Failed', accessor: 'notifications_failed' },
    { header: 'Created By', accessor: 'created_by' },
    { header: 'Created At', accessor: 'created_at', render: (row: any) => formatDate(row.created_at) },
    { header: 'Status', accessor: 'status', render: (row: any) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewLogs(row.id, 'date-range')}>
          <FileText className="w-4 h-4 mr-1" /> View Logs
        </Button>
      )
    }
  ];

  const dateRangeLogColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Campaign', accessor: 'campaign', render: (row: any) => <DateRangeCampaignCell campaignId={row.campaign} /> },
    { header: 'User', accessor: 'user', render: (row: any) => <UserCell row={row} /> },
    { header: 'Status', accessor: 'status', render: (row: any) => <StatusBadge status={row.status} /> },
    { header: 'Sent At', accessor: 'sent_at', render: (row: any) => formatDate(row.sent_at) },
  ];

  const scheduledCampaignColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Send Type', accessor: 'send_type', render: (row: any) => row.send_type === 'send_now' ? 'Send Now' : (row.send_type === 'schedule_later' ? 'Schedule for Later' : row.send_type) },
    { header: 'Membership', accessor: 'membership_filter' },
    { header: 'State', accessor: 'state', render: (row: any) => <StateInfoCell stateId={row.state} /> },
    { header: 'Total States', accessor: 'total_states' },
    { header: 'Total Users', accessor: 'total_users' },
    { header: 'With Devices', accessor: 'users_with_devices' },
    { header: 'No Devices', accessor: 'users_without_devices' },
    { header: 'Sent', accessor: 'notifications_sent' },
    { header: 'Failed', accessor: 'notifications_failed' },
    { header: 'Created By', accessor: 'created_by', render: (row: any) => <UserByNameCell username={row.created_by} /> },
    { header: 'Scheduled Date', accessor: 'scheduled_datetime', render: (row: any) => formatDate(row.scheduled_datetime) },
    { header: 'Created At', accessor: 'created_at', render: (row: any) => formatDate(row.created_at) },
    { header: 'Status', accessor: 'status', render: (row: any) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row: any) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => handleViewLogs(row.id, 'scheduled')}>
            <Eye className="w-4 h-4 mr-1" /> View Logs
          </Button>
        </div>
      )
    }
  ];

  const scheduledLogColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Campaign', accessor: 'campaign', render: (row: any) => <ScheduledCampaignCell campaignId={row.campaign} /> },
    { header: 'User', accessor: 'user', render: (row: any) => <UserCell row={row} /> },
    { header: 'State name', accessor: 'state_name' },
    { header: 'Topic name', accessor: 'topic_name' },
    { header: 'Notification type', accessor: 'notification_type' },
    { header: 'Status', accessor: 'status', render: (row: any) => <StatusBadge status={row.status} /> },
    { header: 'Sent At', accessor: 'sent_at', render: (row: any) => formatDate(row.sent_at) },
  ];

  if (!section) {
    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>Notification Dashboard</h1>
          <p className="mb-6" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Manage app notifications and announcements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "CSV Campaigns",
              value: stats?.totalCsvCampaigns || 0,
              description: "Bulk upload campaigns",
              icon: FileSpreadsheet,
              iconColor: "#fff",
              iconBgColor: "#3b82f6",
              growth: 0.0,
              path: '/notification/csv-campaigns'
            },
            {
              title: "CSV Logs",
              value: stats?.totalCsvLogs || 0,
              description: "Delivery logs for CSV",
              icon: FileText,
              iconColor: "#fff",
              iconBgColor: "#6366f1",
              growth: 0.0,
              path: '/notification/csv-logs'
            },
            {
              title: "Date Range Campaigns",
              value: stats?.totalDateRangeCampaigns || 0,
              description: "Time-based campaigns",
              icon: Calendar,
              iconColor: "#fff",
              iconBgColor: "#22c55e",
              growth: 0.0,
              path: '/notification/date-range-campaigns'
            },
            {
              title: "Date Range Logs",
              value: stats?.totalDateRangeLogs || 0,
              description: "Logs for date range",
              icon: FileText,
              iconColor: "#fff",
              iconBgColor: "#10b981",
              growth: 0.0,
              path: '/notification/date-range-logs'
            },
            {
              title: "Scheduled Campaigns",
              value: stats?.totalScheduledCampaigns || 0,
              description: "Future notifications",
              icon: Clock,
              iconColor: "#fff",
              iconBgColor: "#f97316",
              growth: 0.0,
              path: '/notification/scheduled-campaigns'
            },
            {
              title: "Scheduled Logs",
              value: stats?.totalScheduledLogs || 0,
              description: "Logs for scheduled",
              icon: FileText,
              iconColor: "#fff",
              iconBgColor: "#fbbf24",
              growth: 0.0,
              path: '/notification/scheduled-logs'
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
    case 'csv-campaigns':
      return <GenericTable title="CSV Notification Campaigns" columns={csvCampaignColumns} fetchData={(params) => api.notification.csvCampaigns.list({ ...params, page_size: 1000 })} onRowClick={handleCsvClick} showAnalytics={false} />;

    case 'csv-logs':
      return <GenericTable title={campaignId ? `CSV Logs(Campaign ${campaignId})` : "CSV Logs"} columns={csvLogColumns} fetchData={fetchCsvLogs} showAnalytics={false} />;

    case 'date-range-campaigns':
      return <GenericTable title="Date Range Notification Campaigns" columns={dateRangeCampaignColumns} fetchData={(params) => api.notification.dateRangeCampaigns.list({ ...params, page_size: 1000 })} onRowClick={handleDateRangeClick} showAnalytics={false} />;

    case 'date-range-logs':
      return <GenericTable title={campaignId ? `Date Range Logs(Campaign ${campaignId})` : "Date Range Logs"} columns={dateRangeLogColumns} fetchData={fetchDateRangeLogs} showAnalytics={false} />;

    case 'scheduled-campaigns':
      return (
        <>
          <div className="flex flex-col sm:flex-row justify-end mb-4">
            <Button
              onClick={handleCreateCampaignClick}
              className={`w-full sm:w-auto ${isDarkMode ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              + Create Notification
            </Button>
          </div>
          <GenericTable title="Scheduled Notification Campaigns" columns={scheduledCampaignColumns} fetchData={(params) => api.notification.scheduledCampaigns.list({ ...params, page_size: 1000 })} onRowClick={handleScheduledClick} showAnalytics={false} />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
              <DialogHeader>
                <DialogTitle style={{ color: isDarkMode ? '#fff' : '#000' }}>{currentCampaign?.id ? 'Edit' : 'Create'} Scheduled Campaign</DialogTitle>
                <DialogDescription style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  {currentCampaign?.id ? 'Update the details of your scheduled campaign.' : 'Schedule a new notification campaign.'}
                </DialogDescription>
              </DialogHeader>

              {currentCampaign && (
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                  {/* Title */}
                  <div className="grid gap-2">
                    <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Title</Label>
                    <Input
                      value={currentCampaign.title}
                      onChange={(e) => setCurrentCampaign({ ...currentCampaign, title: e.target.value })}
                      placeholder="Notification Title"
                      style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}
                    />
                  </div>

                  {/* Body */}
                  <div className="grid gap-2">
                    <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Body</Label>
                    <Textarea
                      value={currentCampaign.body}
                      onChange={(e) => setCurrentCampaign({ ...currentCampaign, body: e.target.value })}
                      placeholder="Notification Body/Message"
                      style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Send Type */}
                    <div className="grid gap-2">
                      <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Send Type</Label>
                      <Select
                        value={currentCampaign.send_type}
                        onValueChange={(val) => setCurrentCampaign({ ...currentCampaign, send_type: val })}
                      >
                        <SelectTrigger style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                          <SelectItem value="send_now">Send Now</SelectItem>
                          <SelectItem value="schedule_later">Schedule Later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Membership Filter */}
                    <div className="grid gap-2">
                      <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Membership Filter</Label>
                      <Select
                        value={currentCampaign.membership_filter}
                        onValueChange={(val) => setCurrentCampaign({ ...currentCampaign, membership_filter: val })}
                      >
                        <SelectTrigger style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}>
                          <SelectValue placeholder="Select filter" />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="premium">Premium Users</SelectItem>
                          <SelectItem value="non_premium">Non-Premium Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Scheduled Date (Conditional) */}
                  {currentCampaign.send_type === 'schedule_later' && (
                    <div className="grid gap-2">
                      <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>Scheduled Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={currentCampaign.scheduled_datetime}
                        onChange={(e) => setCurrentCampaign({ ...currentCampaign, scheduled_datetime: e.target.value })}
                        style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}
                      />
                    </div>
                  )}

                  {/* State Filter (Optional) */}
                  {currentCampaign.membership_filter === 'all' && (
                    <div className="grid gap-2">
                      <Label style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>State (Optional)</Label>
                      <Select
                        value={currentCampaign.state ? String(currentCampaign.state) : "none"}
                        onValueChange={(val) => setCurrentCampaign({ ...currentCampaign, state: val === 'none' ? null : Number(val) })}
                      >
                        <SelectTrigger style={{ backgroundColor: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#4b5563' : '#e5e7eb' }}>
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#374151' : '#e5e7eb', maxHeight: '200px' }}>
                          <SelectItem value="none">All States</SelectItem>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={String(state.id)}>{state.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} style={{ color: isDarkMode ? '#000' : 'inherit' }}>Cancel</Button>
                <Button onClick={handleSaveCampaign}><Save className="w-4 h-4 mr-2" /> Save Campaign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );

    case 'scheduled-logs':
      return <GenericTable title={campaignId ? `Scheduled Logs(Campaign ${campaignId})` : "Scheduled Logs"} columns={scheduledLogColumns} fetchData={fetchScheduledLogs} showAnalytics={false} />;

    default:
      return <div>Section not found: {section}</div>;
  }
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";

  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
    case 'sent':
      variant = 'default';
      break;
    case 'failed':
    case 'cancelled':
      variant = 'destructive';
      break;
    case 'pending':
    case 'scheduled':
    case 'processing':
      variant = 'secondary';
      break;
    default:
      variant = 'outline';
  }

  return <Badge variant={variant}>{status}</Badge>;
}