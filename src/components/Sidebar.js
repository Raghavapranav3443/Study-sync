import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Target, BookOpen, Users, Brain, Settings, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', testId: 'sidebar-dashboard' },
    { icon: Target, label: 'Focus', path: '/focus', testId: 'sidebar-focus' },
    { icon: BookOpen, label: 'Planner', path: '/planner', testId: 'sidebar-planner' },
    { icon: BookOpen, label: 'Notes', path: '/notes', testId: 'sidebar-notes' },
    { icon: Users, label: 'Collab', path: '/collab', testId: 'sidebar-collab' },
    { icon: Brain, label: 'AI Mentor', path: '/mentor', testId: 'sidebar-mentor' },
    { icon: Settings, label: 'Settings', path: '/settings', testId: 'sidebar-settings' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      icon: Shield,
      label: 'Admin Panel',
      path: '/admin',
      testId: 'sidebar-admin'
    });
  }

  return (
    <div className="w-64 h-screen glass-card border-r border-purple-500/20 flex flex-col" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/20">
        <Link to="/dashboard" data-testid="sidebar-logo">
          <h1 className="text-2xl font-bold gradient-text">StudySync</h1>
          <p className="text-sm text-gray-400 mt-1">Your Studyverse</p>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-purple-500/20" data-testid="sidebar-user-info">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
            <span className="text-white font-semibold">{user?.name?.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  data-testid={item.testId}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-purple-500/20">
        <button
          onClick={handleLogout}
          data-testid="sidebar-logout-btn"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;