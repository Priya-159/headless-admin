import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearch } from '../../contexts/SearchContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Search, User, LogOut, Settings as SettingsIcon, Menu } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface NavbarProps {
  onMenuClick: () => void;
}

import api from '../../services/api';

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout, isMockMode, refreshUser } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const { isDarkMode } = useTheme();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveUsername = async () => {
    try {
      await api.auth.updateProfile({ username: newUsername });
      toast.success('Username updated successfully!');

      // Refresh user data to show new name immediately
      await refreshUser();

      setIsProfileDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update username');
      console.error(error);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match!');
      return;
    }
    if (!oldPassword || !newPassword) {
      toast.error('Please fill all password fields!');
      return;
    }

    try {
      await api.auth.changePassword({
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
      console.error(error);
    }
  };

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    logout();
  };

  return (
    <>
      <motion.div
        className="border-b shadow-sm sticky top-0 z-40"
        style={{ backgroundColor: isDarkMode ? '#16213e' : '#FFF0F5', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 gap-4">
          {/* Hamburger Menu Icon for Mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className={`w-6 h-6 ${isDarkMode ? 'text-gray-200' : 'text-zinc-700'}`} />
          </Button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 w-full transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:bg-gray-600' : 'bg-zinc-50 border-zinc-300 focus:bg-white'}`}
              style={{ boxShadow: isDarkMode ? '0 8px 32px rgb(91 192 222 / 0.2)' : '0 8px 32px rgb(0 127 255 / 0.1)' }}
            />
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`ml-6 flex items-center gap-3 px-4 ${isDarkMode ? 'hover:bg-transparent' : 'hover:bg-zinc-100'}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>{user?.username}</p>
                  <p className="text-xs" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>admin@example.com</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 p-4"
              style={{
                backgroundColor: isDarkMode ? '#16213e' : '#fff',
                borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                boxShadow: isDarkMode ? '0 8px 32px rgb(91 192 222 / 0.15)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              {/* Icon in the middle */}
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-3">
                  <User className="w-8 h-8 text-white" />
                </div>
                {/* Admin name */}
                <p className="font-semibold text-lg" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>{user?.username}</p>
                {/* Gmail */}
                <p className="text-sm mt-1" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>admin@example.com</p>
              </div>

              <DropdownMenuSeparator className="my-3" style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }} />

              {/* View Profile Button */}
              <div className="flex justify-center my-3">
                <Button
                  onClick={() => setIsProfileDialogOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>

              <DropdownMenuSeparator className="my-3" style={{ backgroundColor: isDarkMode ? '#374151' : '#e5e7eb' }} />

              {/* Sign Out Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className={`w-full text-red-600 transition-colors ${isDarkMode ? 'border-red-900 bg-red-900/10 hover:bg-red-900/30' : 'border-red-300 hover:bg-red-50 hover:text-red-700'}`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] flex flex-col"
          style={{
            backgroundColor: isDarkMode ? '#16213e' : '#fff',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            color: isDarkMode ? '#e8e8e8' : '#111827'
          }}
        >
          <DialogHeader className="flex-shrink-0">
            {/* Icon in the middle */}
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              {/* Admin name on top */}
              <DialogTitle className="text-2xl" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>{user?.username}</DialogTitle>
              <DialogDescription className="text-center mt-2" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                Manage your profile settings and security
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4 overflow-y-auto flex-1 px-1 scrollbar-hide">
            {/* Section 1: Change Username */}
            <div className="border rounded-lg p-4" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fafafa', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="font-semibold mb-4 text-lg">Update Username</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="current-username" className="text-sm" style={{ color: isDarkMode ? '#bdbdbd' : '#52525b' }}>Current Username</Label>
                  <Input
                    id="current-username"
                    value={user?.username}
                    disabled
                    className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <Label htmlFor="new-username" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>New Username</Label>
                  <Input
                    id="new-username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter new username"
                    className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : ''}`}
                  />
                </div>
                <Button
                  onClick={handleSaveUsername}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Save Username
                </Button>
              </div>
            </div>

            {/* Section 2: Change Password */}
            <div className="border rounded-lg p-4" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fafafa', borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
              <h3 className="font-semibold mb-4 text-lg">Update Password</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="old-password" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>Old Password</Label>
                  <Input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter old password"
                    className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : ''}`}
                  />
                </div>
                <div>
                  <Label htmlFor="new-password" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : ''}`}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : ''}`}
                  />
                </div>
                <Button
                  onClick={handleUpdatePassword}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex-shrink-0" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
            <Button
              variant="outline"
              onClick={() => setIsProfileDialogOpen(false)}
              className={`w-full ${isDarkMode ? 'bg-transparent text-gray-200 border-gray-600 hover:bg-gray-800' : ''}`}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}