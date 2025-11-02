import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-purple-900" data-testid="settings-page">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="settings-title">Settings</h1>
            <p className="text-gray-400">Manage your account preferences</p>
          </motion.div>

          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <User size={24} />
              <span>Profile Information</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  data-testid="settings-name-input"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    data-testid="settings-email-input"
                    className="w-full pl-11 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    data-testid="settings-role-input"
                    className="w-full pl-11 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white capitalize disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Appearance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
            <div>
              <label className="block text-gray-300 mb-3">Theme</label>
              <div className="flex gap-4">
                <button
                  onClick={() => { setTheme('dark'); toast.success('Dark theme selected'); }}
                  data-testid="settings-theme-dark"
                  className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => { setTheme('glass'); toast.success('Glass theme selected'); }}
                  data-testid="settings-theme-glass"
                  className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
                    theme === 'glass'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Glass
                </button>
              </div>
            </div>
          </motion.div>

          {/* Study Goals Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Study Goals</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Daily Focus Goal (minutes)</label>
                <input
                  type="number"
                  placeholder="120"
                  data-testid="settings-focus-goal-input"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Weekly Tasks Goal</label>
                <input
                  type="number"
                  placeholder="20"
                  data-testid="settings-tasks-goal-input"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <button
                onClick={() => toast.success('Goals saved!')}
                data-testid="settings-save-goals-btn"
                className="btn-primary"
              >
                Save Goals
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;