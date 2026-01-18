import { useState, useCallback, useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare, Mail, PhoneCall, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import GenericTable from './GenericTable';
import api from '../../services/api';
import { Badge } from './ui/badge';
import { StatCard } from './StatCard';

interface ContactMessagesPageProps {
  section?: string;
}

const ThreadInfoCell = ({ threadId }: { threadId: number }) => {
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    if (!threadId) return;
    api.contactMessages.threads.get(threadId)
      .then((res: any) => {
        // Compose name and phone
        const parts = [];
        if (res.name) parts.push(res.name);
        if (res.phone_no) parts.push(res.phone_no);
        if (parts.length === 0) setInfo(`Thread #${threadId}`);
        else setInfo(parts.join(' - '));
      })
      .catch(() => setInfo(`Thread #${threadId}`));
  }, [threadId]);

  if (!info) return <span className="text-gray-400 animate-pulse">Loading...</span>;
  return <span className="font-medium text-sm">{info}</span>;
};

export function ContactMessagesPage({ section }: ContactMessagesPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { searchQuery } = useSearch();
  const { isDarkMode } = useTheme();
  const threadId = searchParams.get('thread');
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
      const statsData = await api.contactMessages.getSummaryStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = (row: any) => {
    navigate(`/contact/chat?thread=${row.id}`);
  };

  const handleMessageClick = (row: any) => {
    navigate(`/contact/chat?thread=${row.thread}`);
  };

  const fetchMessages = useCallback((params?: any) => {
    return api.contactMessages.messages.list({
      ...(threadId ? { thread: threadId } : {}),
      ...params
    });
  }, [threadId]);

  const threadColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'User', accessor: 'user' },
    { header: 'Phone no', accessor: 'phone_no', className: 'whitespace-nowrap' },
    { header: 'Name', accessor: 'name', className: 'whitespace-nowrap' },
    { header: 'Last Message', accessor: 'last_message', className: 'whitespace-nowrap' },
    { header: 'Is read', accessor: 'is_read', className: 'whitespace-nowrap', render: (row: any) => row.is_read ? <Badge className="bg-green-500">Yes</Badge> : <Badge variant="secondary">No</Badge> },
  ];

  const messageColumns = [
    { header: 'Thread', accessor: 'thread', render: (row: any) => <ThreadInfoCell threadId={row.thread} /> },
    { header: 'Is admin', accessor: 'is_admin', render: (row: any) => row.is_admin ? 'Yes' : 'No' },
    { header: 'Message', accessor: 'message', className: 'whitespace-nowrap min-w-[300px]' },
    { header: 'Sent at', accessor: 'sent_at', className: 'whitespace-nowrap', render: (row: any) => row.sent_at ? new Date(row.sent_at * 1000).toLocaleString() : '-' },
  ];

  const sendSMSColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'User', accessor: 'user' },
    { header: 'Phone number with code', accessor: 'phone_number_with_code' },
    { header: 'Sent at', accessor: 'sent_at', render: (row: any) => row.sent_at ? new Date(row.sent_at * 1000).toLocaleString() : '-' },
  ];

  if (!section) {
    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>Contact Messages Dashboard</h1>
          <p className="mb-6" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Manage user communications and support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Threads",
              value: stats?.totalThreads || 0,
              description: "Message conversations",
              icon: MessageSquare,
              iconColor: "#fff",
              iconBgColor: "#3b82f6",
              growth: 5.2,
              path: '/contact/threads'
            },
            {
              title: "Total Messages",
              value: stats?.totalMessages || 0,
              description: "All messages sent",
              icon: Mail,
              iconColor: "#fff",
              iconBgColor: "#10b981",
              growth: 12.5,
              path: '/contact/messages'
            },
            {
              title: "Unread Threads",
              value: stats?.unreadThreads || 0,
              description: "Pending responses",
              icon: Users,
              iconColor: "#fff",
              iconBgColor: "#f59e0b",
              growth: -3.1,
              path: '/contact/threads'
            },
            {
              title: "Admin Messages",
              value: stats?.adminMessages || 0,
              description: "Messages from admin",
              icon: PhoneCall,
              iconColor: "#fff",
              iconBgColor: "#a855f7",
              growth: 8.7,
              path: '/contact/messages'
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
    case 'threads':
      return (
        <GenericTable
          title="Message Threads"
          columns={threadColumns}
          fetchData={(params) => api.contactMessages.threads.list(params)}
          onRowClick={handleThreadClick}
          showAnalytics={false}
          paginationMode="server"
        />
      );
    case 'messages':
      return (
        <GenericTable
          title={threadId ? `Messages (Thread ${threadId})` : "All Messages"}
          columns={messageColumns}
          fetchData={fetchMessages}
          onRowClick={handleMessageClick}
          showAnalytics={false}
          paginationMode="server"
        />
      );
    case 'send-sms':
      return <GenericTable title="Send SMS" columns={sendSMSColumns} fetchData={(params) => api.contactMessages.sendSms.list(params)} showAnalytics={false} paginationMode="server" />;
    default:
      return <div>Section not found</div>;
  }
}
