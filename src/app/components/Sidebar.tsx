import { MessageSquare, Car, Smartphone, Bell, X, ChevronDown, ChevronRight, Users, FileText, Calendar, MapPin, Settings, CreditCard, BarChart2, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../../assets/logo.webp';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['accounts']);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const menuItems = [

    {
      id: 'accounts',
      label: 'Accounts',
      icon: Users,
      path: '/accounts',
      subItems: [
        { id: 'api-usage', label: 'API Usage Counts', path: '/accounts/api-usage' },
        { id: 'admin-controls', label: 'Admin Controls', path: '/accounts/admin-controls' },
        { id: 'countries', label: 'Countries', path: '/accounts/countries' },
        { id: 'emergency', label: 'Emergency Numbers', path: '/accounts/emergency-numbers' },
        { id: 'free-requests', label: 'Free Request Logs', path: '/accounts/free-requests' },
        { id: 'otps', label: 'OTPs', path: '/accounts/otps' },
        { id: 'scheduled-notifs', label: 'Scheduled Notifications', path: '/accounts/scheduled-notifications' },
        { id: 'states', label: 'States', path: '/accounts/states' },
        { id: 'subscriptions', label: 'Subscription Transactions', path: '/accounts/subscriptions' },
        { id: 'trip-usages', label: 'Trip Usages', path: '/accounts/trip-usages' },
        { id: 'users', label: 'Users', path: '/accounts/users' },
      ]
    },
    {
      id: 'contact',
      label: 'Contact Messages',
      icon: MessageSquare,
      path: '/contact',
      subItems: [
        { id: 'threads', label: 'Message Threads', path: '/contact/threads' },
        { id: 'messages', label: 'Messages', path: '/contact/messages' },
        { id: 'send-sms', label: 'Send SMS', path: '/contact/send-sms' },
      ]
    },
    {
      id: 'fcm',
      label: 'FCM Devices',
      icon: Smartphone,
      path: '/fcm-devices',
      subItems: []
    },
    {
      id: 'notification',
      label: 'Notification',
      icon: Bell,
      path: '/notification',
      subItems: [
        { id: 'csv-campaigns', label: 'CSV Campaigns', path: '/notification/csv-campaigns' },
        { id: 'csv-logs', label: 'CSV Logs', path: '/notification/csv-logs' },
        { id: 'date-campaigns', label: 'Date Range Campaigns', path: '/notification/date-range-campaigns' },
        { id: 'date-logs', label: 'Date Range Logs', path: '/notification/date-range-logs' },
        { id: 'sched-campaigns', label: 'Scheduled Campaigns', path: '/notification/scheduled-campaigns' },
        { id: 'sched-logs', label: 'Scheduled Logs', path: '/notification/scheduled-logs' },
      ]
    },
    {
      id: 'vehicle',
      label: 'Vehicle',
      icon: Car,
      path: '/vehicle',
      subItems: [
        { id: 'logbooks', label: 'Log Books', path: '/vehicle/logbooks' },
        { id: 'notifications', label: 'Notifications', path: '/vehicle/notifications' },
        { id: 'reminders', label: 'Reminders', path: '/vehicle/reminders' },
        { id: 'tip-of-day', label: 'Tip Of Day', path: '/vehicle/tip-of-day' },
        { id: 'trips', label: 'Trips', path: '/vehicle/trips' },
        { id: 'settings', label: 'User Settings', path: '/vehicle/user-settings' },
        { id: 'fuel-prices', label: 'User Fuel Prices', path: '/vehicle/user-fuel-prices' },
        { id: 'user-vehicles', label: 'User Vehicles', path: '/vehicle/user-vehicles' },
        { id: 'makers', label: 'Vehicle Makers', path: '/vehicle/makers' },
        { id: 'models', label: 'Vehicle Models', path: '/vehicle/models' },
        { id: 'types', label: 'Vehicle Types', path: '/vehicle/types' },
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    if (sectionId) {
      toggleSection(sectionId);
    }
    navigate(path);
    onClose();
  };

  const isActiveItem = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed lg:sticky top-0 left-0 w-80 min-h-screen flex flex-col shadow-2xl h-screen overflow-y-auto flex-shrink-0 z-50 transition-transform duration-300 scrollbar-hide ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ backgroundColor: isDarkMode ? '#16213e' : '#FFF0F5', color: isDarkMode ? '#e8e8e8' : '#1f2937' }}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 lg:hidden transition-colors z-50 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo Section */}
        <div className={`px-6 py-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <img
              src={Logo}
              alt="FuelABC Logo"
              className="h-16 w-auto mb-3"
            />
            <p className={`text-sm text-center font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Just Fuel, Money and the Environment!</p>
          </motion.div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isExpanded = expandedSections.includes(item.id);
              const isItemActive = isActiveItem(item.path);

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Main Item */}
                  <button
                    onClick={() => handleNavigation(item.path, item.subItems.length > 0 ? item.id : undefined)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${isItemActive
                      ? (isDarkMode ? 'bg-[#5BC0DE] text-white shadow-lg' : 'bg-[#4DA6FF] text-white shadow-lg')
                      : (isDarkMode ? 'text-gray-300 hover:bg-gray-700/70' : 'text-gray-700 hover:bg-gray-200/70')
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.subItems.length > 0 && (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )
                    )}
                  </button>

                  {/* Sub Items */}
                  <AnimatePresence>
                    {isExpanded && item.subItems.length > 0 && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.subItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <motion.li
                              key={subItem.id}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <button
                                onClick={() => handleNavigation(subItem.path)}
                                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${isSubActive
                                  ? (isDarkMode ? 'bg-[#5BC0DE]/20 text-[#5BC0DE] font-medium border-l-2 border-[#5BC0DE]' : 'bg-[#4DA6FF]/20 text-[#4DA6FF] font-medium border-l-2 border-[#4DA6FF]')
                                  : (isDarkMode ? 'text-gray-400 hover:bg-gray-700/70 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900')
                                  }`}
                              >
                                {subItem.label}
                              </button>
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Dark Mode Toggle */}
        <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2024 FuelABC Admin Panel
          </p>
        </div>
      </div>
    </>
  );
}