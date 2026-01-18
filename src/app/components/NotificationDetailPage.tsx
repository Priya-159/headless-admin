
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Users, Activity, Save, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import api from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

export function NotificationDetailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const logId = searchParams.get('log');
    const campaignId = searchParams.get('campaign');
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(false);
    const [notificationData, setNotificationData] = useState<any>(null);
    const [formData, setFormData] = useState({
        campaignTitle: '',
        notificationTitle: '',
        notificationBody: '',
        scheduledTime: '',
        targetUsers: '',
        status: ''
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (logId || campaignId) {
            fetchNotificationData();
        }
    }, [logId, campaignId]);

    const fetchNotificationData = async () => {
        setLoading(true);
        try {
            // Fetch campaign or log details
            if (campaignId) {
                const campaign = await api.notification.scheduledCampaigns.get(campaignId);

                if (campaign) {
                    setNotificationData(campaign);
                    setFormData({
                        campaignTitle: campaign.title || '',
                        notificationTitle: campaign.title || '',
                        notificationBody: campaign.body || campaign.message || '', // Check body first as per model
                        scheduledTime: campaign.scheduled_datetime ? new Date(campaign.scheduled_datetime).toISOString().slice(0, 16) : '',
                        targetUsers: `${campaign.total_users || 0} users`,
                        status: campaign.status || ''
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch notification data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDuplicate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload: any = {
                title: formData.campaignTitle,
                body: formData.notificationBody,
                scheduled_datetime: formData.scheduledTime ? new Date(formData.scheduledTime).toISOString() : null,
                is_active: true, // Default to active for new duplicate
            };

            // We need to pass the filter criteria too if we want a true duplicate.
            // notificationData has the original record.
            if (notificationData) {
                Object.assign(payload, {
                    user_type: notificationData.user_type,
                    country: notificationData.country,
                    state: notificationData.state,
                    city: notificationData.city,
                    vehicle_type: notificationData.vehicle_type,
                    vehicle_maker: notificationData.vehicle_maker,
                    vehicle_model: notificationData.vehicle_model,
                    fuel_type: notificationData.fuel_type,
                    last_active_days: notificationData.last_active_days,
                });
            }

            await api.notification.scheduledCampaigns.create(payload);
            toast.success('Campaign duplicated successfully');
            navigate('/notification/scheduled-campaigns');
        } catch (error: any) {
            console.error('Failed to duplicate campaign:', error);
            toast.error('Failed to duplicate campaign');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: any = {
                title: formData.notificationTitle,
                body: formData.notificationBody,
            };

            if (formData.scheduledTime) {
                payload.scheduled_datetime = new Date(formData.scheduledTime).toISOString();
            }

            if (campaignId) {
                await api.notification.scheduledCampaigns.patch(campaignId, payload);
                toast.success('Changes applied successfully');
            } else {
                await api.notification.scheduledCampaigns.create(payload);
                toast.success('Campaign created successfully');
            }
            navigate('/notification/scheduled-campaigns');
        } catch (error) {
            console.error('Failed to save changes:', error);
            toast.error('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading...
            </div>
        );
    }

    // Styles for inputs based on theme
    const inputStyles = `${isDarkMode
        ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
        }`;

    const labelStyles = `block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <div className={`min-h-screen p-6 transition-colors duration-200 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/notification/scheduled-campaigns')}
                        className={`mb-4 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Button>

                    <div className="flex justify-between items-center">
                        <div>
                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                Notification Management
                            </p>
                            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                Edit Scheduled Notification
                            </h1>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/notification/scheduled-campaigns')}
                                className={isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white' : ''}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            {campaignId && (
                                <Button
                                    type="button"
                                    onClick={handleDuplicate}
                                    disabled={saving}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                </Button>
                            )}
                            <Button
                                type="submit"
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {campaignId ? 'Save Changes' : 'Create Campaign'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Campaign Details Form */}
                    <div className="lg:col-span-2">
                        <Card className={`border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-200'}`}>
                            <CardHeader className="pb-4">
                                <CardTitle className={`text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    Campaign Details
                                </CardTitle>
                                <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                    Basic information about the notification campaign
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Campaign Title */}
                                <div>
                                    <label className={labelStyles}>
                                        Campaign Title <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <Input
                                            value={formData.campaignTitle}
                                            onChange={(e) => handleInputChange('campaignTitle', e.target.value)}
                                            placeholder="Morning Fuel Price Update"
                                            className={`pl-9 w-full ${inputStyles}`}
                                        />
                                    </div>
                                </div>

                                {/* Notification Title */}
                                <div>
                                    <label className={labelStyles}>
                                        Notification Title <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Bell className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <Input
                                            value={formData.notificationTitle}
                                            onChange={(e) => handleInputChange('notificationTitle', e.target.value)}
                                            placeholder="e.g., Petrol Price Update"
                                            className={`pl-9 w-full ${inputStyles}`}
                                        />
                                    </div>
                                </div>

                                {/* Notification Body */}
                                <div>
                                    <label className={labelStyles}>
                                        Notification Body <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.notificationBody}
                                        onChange={(e) => handleInputChange('notificationBody', e.target.value)}
                                        placeholder="Enter the notification message..."
                                        className={`w-full min-h-[120px] px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${inputStyles}`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Scheduled Time */}
                                    <div>
                                        <label className={labelStyles}>
                                            Scheduled Time
                                        </label>
                                        <div className="relative">
                                            <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                            <Input
                                                type="datetime-local"
                                                value={formData.scheduledTime}
                                                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                                                className={`pl-9 w-full ${inputStyles} [&::-webkit-calendar-picker-indicator]:filter ${isDarkMode ? '[&::-webkit-calendar-picker-indicator]:invert' : ''}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Target Users */}
                                    <div>
                                        <label className={labelStyles}>
                                            Target Users
                                        </label>
                                        <div className="relative">
                                            <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                            <Input
                                                value={formData.targetUsers}
                                                readOnly
                                                className={`pl-9 w-full ${isDarkMode ? 'bg-gray-800/50 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className={labelStyles}>
                                        Status
                                    </label>
                                    <Badge
                                        variant={
                                            formData.status === 'completed' ? 'default' :
                                                formData.status === 'pending' ? 'secondary' :
                                                    formData.status === 'failed' ? 'destructive' : 'outline'
                                        }
                                        className="text-sm px-3 py-1 capitalize"
                                    >
                                        {formData.status || 'Draft'}
                                    </Badge>
                                </div>

                                {/* Action Buttons */}
                                <div className={`flex gap-3 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/notification/scheduled-campaigns')}
                                        className={isDarkMode ? 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500 transition-colors' : 'hover:bg-gray-100 hover:text-gray-900 border-gray-200 text-gray-700'}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notification Preview */}
                    <div className="lg:col-span-1">
                        <Card className={`sticky top-6 border shadow-sm ${isDarkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-200'}`}>
                            <CardHeader>
                                <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    Notification Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Mobile-like Preview Container */}
                                <div className={`rounded-xl border p-4 shadow-sm transition-colors ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
                                    {/* Notification Card inside Preview */}
                                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                                        {/* Preview Header */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-white font-bold text-xs">FA</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>FuelABC</p>
                                                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>now</p>
                                                </div>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>APP_NAME</p>
                                            </div>
                                        </div>

                                        {/* Preview Content */}
                                        <div className="space-y-1 pl-12">
                                            <h3 className={`text-sm font-semibold leading-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                {formData.notificationTitle || 'Title goes here'}
                                            </h3>
                                            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {formData.notificationBody || 'Notification content will be displayed here...'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Preview Footer */}
                                    <div className={`mt-4 pt-3 border-t text-center ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <div className={`flex items-center justify-center gap-2 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                            <Bell className="w-3 h-3" />
                                            <span>User Lock Screen Preview</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
