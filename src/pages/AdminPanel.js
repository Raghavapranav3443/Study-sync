import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Users, FileText, Target, TrendingUp, Shield, Ban } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const banUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`);
      toast.success('User banned');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const unbanUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/unban`);
      toast.success('User unbanned');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: analytics?.totalUsers || 0, color: 'from-purple-500 to-purple-700' },
    { icon: FileText, label: 'Total Notes', value: analytics?.totalNotes || 0, color: 'from-blue-500 to-blue-700' },
    { icon: Target, label: 'Total Tasks', value: analytics?.totalTasks || 0, color: 'from-teal-500 to-teal-700' },
    { icon: TrendingUp, label: 'Focus Sessions', value: analytics?.totalSessions || 0, color: 'from-pink-500 to-pink-700' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-purple-900" data-testid="admin-page">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Shield size={32} className="text-purple-500" />
              <h1 className="text-4xl font-bold text-white" data-testid="admin-title">Admin Panel</h1>
            </div>
            <p className="text-gray-400">Platform management and analytics</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              data-testid="admin-tab-overview"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              data-testid="admin-tab-users"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Users
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-6"
                      data-testid={`admin-stat-${index}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts */}
              {analytics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-8"
                  data-testid="admin-analytics-chart"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Platform Activity</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-white mb-4">Task Completion</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { name: 'Completed', value: analytics.completedTasks },
                          { name: 'Pending', value: analytics.totalTasks - analytics.completedTasks }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #7c3aed40', borderRadius: '12px' }} />
                          <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h3 className="text-white mb-4">User Growth</h3>
                      <div className="flex items-center justify-center h-[200px]">
                        <div className="text-center">
                          <p className="text-5xl font-bold text-white mb-2">{analytics.newUsers}</p>
                          <p className="text-gray-400">New users this week</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
              data-testid="admin-users-list"
            >
              <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 py-3 px-4">Name</th>
                      <th className="text-left text-gray-400 py-3 px-4">Email</th>
                      <th className="text-left text-gray-400 py-3 px-4">Role</th>
                      <th className="text-left text-gray-400 py-3 px-4">Status</th>
                      <th className="text-left text-gray-400 py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id} className="border-b border-white/5" data-testid={`admin-user-row-${index}`}>
                        <td className="py-4 px-4 text-white">{user.name}</td>
                        <td className="py-4 px-4 text-gray-400">{user.email}</td>
                        <td className="py-4 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            data-testid={`admin-user-role-select-${user.id}`}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm"
                          >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.banned ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {user.banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            {user.banned ? (
                              <button
                                onClick={() => unbanUser(user.id)}
                                data-testid={`admin-user-unban-${user.id}`}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all"
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => banUser(user.id)}
                                data-testid={`admin-user-ban-${user.id}`}
                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                              >
                                Ban
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(user.id)}
                              data-testid={`admin-user-delete-${user.id}`}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;