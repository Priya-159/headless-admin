import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SearchProvider } from '../contexts/SearchContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

import { AccountsDashboard } from './components/AccountsDashboard';
import { AdminControlsPage } from './components/AdminControlsPage';
import { ContactMessagesPage } from './components/ContactMessagesPage';
import { ChatPage } from './components/ChatPage';
import { FCMDevicesPage } from './components/FCMDevicesPage';
import { NotificationPage } from './components/NotificationPage';
import { NotificationDetailPage } from './components/NotificationDetailPage';
import { VehiclePage } from './components/VehiclePage';
import { LoginPage } from './components/LoginPage';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

function AdminPanel() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isMockMode } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: isDarkMode ? '#1a1a2e' : '#FFF0F5',
        boxShadow: isDarkMode ? 'inset 0 0 100px rgb(91 192 222 / 0.2)' : 'inset 0 0 100px rgb(0 127 255 / 0.2)'
      }}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Development Mode Banner */}
        {isMockMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 shadow-md"
          >
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <AlertCircle className="w-5 h-5" />
              <span>
                🔧 <strong>DEVELOPMENT MODE</strong> - Using mock data because Django is not running.
                <span className="hidden sm:inline"> Start Django with <code className="bg-white/20 px-2 py-0.5 rounded mx-1">python manage.py runserver</code> to use real data.</span>
              </span>
            </div>
          </motion.div>
        )}

        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Routes>
                  {/* Dashboard/Accounts Routes */}
                  <Route path="/" element={<AccountsDashboard />} />

                  <Route path="/accounts" element={<AccountsDashboard />} />
                  <Route path="/accounts/all-users" element={<AccountsDashboard section="all-users" />} />
                  <Route path="/accounts/users" element={<AccountsDashboard section="users" />} />
                  <Route path="/accounts/blocked-users" element={<AccountsDashboard section="blocked-users" />} />
                  <Route path="/accounts/countries" element={<AccountsDashboard section="countries" />} />
                  <Route path="/accounts/states" element={<AccountsDashboard section="states" />} />
                  <Route path="/accounts/subscriptions" element={<AccountsDashboard section="subscriptions" />} />
                  <Route path="/accounts/trip-usages" element={<AccountsDashboard section="trip-usages" />} />
                  <Route path="/accounts/api-usage" element={<AccountsDashboard section="api-usage" />} />
                  <Route path="/accounts/admin-controls" element={<AdminControlsPage />} />
                  <Route path="/accounts/emergency-numbers" element={<AccountsDashboard section="emergency-numbers" />} />
                  <Route path="/accounts/free-requests" element={<AccountsDashboard section="free-requests" />} />
                  <Route path="/accounts/otps" element={<AccountsDashboard section="otps" />} />
                  <Route path="/accounts/scheduled-notifications" element={<AccountsDashboard section="scheduled-notifications" />} />

                  {/* Contact Messages Routes */}
                  <Route path="/contact" element={<ContactMessagesPage />} />
                  <Route path="/contact/threads" element={<ContactMessagesPage section="threads" />} />
                  <Route path="/contact/messages" element={<ContactMessagesPage section="messages" />} />
                  <Route path="/contact/send-sms" element={<ContactMessagesPage section="send-sms" />} />
                  <Route path="/contact/chat" element={<ChatPage />} />

                  {/* FCM Devices Routes */}
                  <Route path="/fcm-devices" element={<FCMDevicesPage />} />

                  {/* Notification Routes (Singular /notification prefix as per Sidebar) */}
                  <Route path="/notification" element={<NotificationPage />} />
                  <Route path="/notification/csv-campaigns" element={<NotificationPage section="csv-campaigns" />} />
                  <Route path="/notification/csv-logs" element={<NotificationPage section="csv-logs" />} />
                  <Route path="/notification/date-range-campaigns" element={<NotificationPage section="date-range-campaigns" />} />
                  <Route path="/notification/date-range-logs" element={<NotificationPage section="date-range-logs" />} />
                  <Route path="/notification/scheduled-campaigns" element={<NotificationPage section="scheduled-campaigns" />} />
                  <Route path="/notification/scheduled-logs" element={<NotificationPage section="scheduled-logs" />} />
                  <Route path="/notification/detail" element={<NotificationDetailPage />} />

                  {/* Vehicle Routes (Singular /vehicle prefix as per Sidebar) */}
                  <Route path="/vehicle" element={<VehiclePage />} />
                  <Route path="/vehicle/logbooks" element={<VehiclePage section="logbooks" />} />
                  <Route path="/vehicle/notifications" element={<VehiclePage section="notifications" />} />
                  <Route path="/vehicle/reminders" element={<VehiclePage section="reminders" />} />
                  <Route path="/vehicle/tip-of-day" element={<VehiclePage section="tip-of-day" />} />
                  <Route path="/vehicle/trips" element={<VehiclePage section="trips" />} />
                  <Route path="/vehicle/user-settings" element={<VehiclePage section="user-settings" />} />
                  <Route path="/vehicle/user-fuel-prices" element={<VehiclePage section="user-fuel-prices" />} />
                  <Route path="/vehicle/user-vehicles" element={<VehiclePage section="user-vehicles" />} />
                  <Route path="/vehicle/makers" element={<VehiclePage section="makers" />} />
                  <Route path="/vehicle/models" element={<VehiclePage section="models" />} />
                  <Route path="/vehicle/types" element={<VehiclePage section="types" />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SearchProvider>
          <Router>
            <AppRoutes />
            <Toaster position="top-right" />
          </Router>
        </SearchProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}