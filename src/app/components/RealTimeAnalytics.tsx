import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

interface ContextualAnalyticsProps {
    context?:
    'users' | 'trips' | 'notifications' | 'revenue' | 'api-usage' |
    'free-requests' | 'trip-usage' | 'scheduled-campaigns' |
    'logbooks' | 'fuel-prices' | 'vehicles' | 'default';
}

export default function ContextualAnalytics({ context = 'default' }: ContextualAnalyticsProps) {
    const [data, setData] = useState<any[]>([]);
    const [title, setTitle] = useState('Analysis');
    const [period, setPeriod] = useState('6m');
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const loadData = async () => {
            let res: any[] = [];
            let chartTitle = 'Analysis';

            try {
                switch (context) {
                    case 'users':
                        res = await api.dashboard.getUsersGrowth(period);
                        chartTitle = 'User Growth';
                        break;
                    case 'trips':
                        // @ts-ignore
                        res = await api.dashboard.getTripsChart(period);
                        chartTitle = 'Trip Volume';
                        break;
                    case 'notifications':
                        res = await api.dashboard.getNotificationsChart(period);
                        chartTitle = 'Notification Volume';
                        break;
                    case 'revenue':
                        res = await api.dashboard.getRevenueData(period);
                        chartTitle = 'Revenue Overview';
                        break;
                    case 'api-usage':
                        // @ts-ignore
                        res = await api.dashboard.getApiUsageStats(period);
                        chartTitle = 'API Usage';
                        break;
                    case 'free-requests':
                        // @ts-ignore
                        res = await api.dashboard.getFreeRequestStats(period);
                        chartTitle = 'Free Requests Claimed';
                        break;
                    case 'trip-usage':
                        // @ts-ignore
                        res = await api.dashboard.getTripUsageStats(period);
                        chartTitle = 'Trip Usage';
                        break;
                    case 'scheduled-campaigns':
                        // @ts-ignore
                        res = await api.dashboard.getScheduledCampaignStats(period);
                        chartTitle = 'Scheduled Campaigns';
                        break;
                    case 'logbooks':
                        // @ts-ignore
                        res = await api.dashboard.getLogBookStats(period);
                        chartTitle = 'Logbook Entries';
                        break;
                    case 'fuel-prices':
                        // @ts-ignore
                        res = await api.dashboard.getUserFuelPriceStats(period);
                        chartTitle = 'Fuel Price Updates';
                        break;
                    case 'vehicles':
                        // @ts-ignore
                        res = await api.dashboard.getUserVehicleStats(period);
                        chartTitle = 'Total Vehicles';
                        break;
                    default:
                        res = [];
                        chartTitle = 'Overview';
                }

                setTitle(chartTitle);

                const formatted = (res || []).map((item: any) => ({
                    name: item.month || item.label || item.day || item.date,
                    value: item.users || item.trips || item.count || item.revenue || item.value || item.route_api_count || 0
                }));

                setData(formatted);

            } catch (e) {
                console.error(`Failed to fetch chart data for ${context}`, e);
            }
        };
        loadData();
    }, [context, period]);

    // Theme Colors
    const axisColor = isDarkMode ? '#888' : '#666';
    const gridColor = isDarkMode ? '#333' : '#f0f0f0';
    const tooltipBg = isDarkMode ? '#1f2937' : '#fff';
    const tooltipText = isDarkMode ? '#f3f4f6' : '#1f2937';
    const chartColor = isDarkMode ? '#60a5fa' : '#3b82f6'; // Blue-400 vs Blue-500

    return (
        <Card className={`mb-6 border-none shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {title}
                </CardTitle>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className={`text-sm rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1 ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-200'}`}
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                </select>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {/* Use AreaChart for users/revenue (growth), BarChart for counts */}
                        {['users', 'revenue', 'vehicles'].includes(context) ? (
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: axisColor, fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: axisColor, fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ stroke: gridColor }}
                                    contentStyle={{
                                        backgroundColor: tooltipBg,
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        color: tooltipText
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={chartColor}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        ) : (
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: axisColor, fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: axisColor, fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}
                                    contentStyle={{
                                        backgroundColor: tooltipBg,
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        color: tooltipText
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill={chartColor}
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    animationDuration={1000}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
