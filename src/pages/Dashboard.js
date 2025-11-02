import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, BookOpen, Target, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFocusTime: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [sessionsRes, tasksRes, notesRes] = await Promise.all([
        api.get('/focus/sessions'),
        api.get('/tasks'),
        api.get('/notes'),
      ]);

      const sessions = sessionsRes.data;
      const tasks = tasksRes.data;
      const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
      const completed = tasks.filter(t => t.completed).length;

      setStats({
        totalFocusTime: Math.round(totalTime / 60), // Convert to hours
        totalTasks: tasks.length,
        completedTasks: completed,
        totalNotes: notesRes.data.length,
      });

      // Prepare weekly data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const weekData = last7Days.map(day => {
        const daySessions = sessions.filter(s => s.date.startsWith(day));
        const minutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
        return {
          day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
          hours: Math.round(minutes / 60 * 10) / 10,
        };
      });

      setWeeklyData(weekData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const statCards = [
    {
      icon: Clock,
      label: 'Focus Hours',
      value: stats.totalFocusTime,
      color: 'from-purple-500 to-purple-700',
      testId: 'dashboard-stat-focus-hours'
    },
    {
      icon: Target,
      label: 'Completed Tasks',
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      color: 'from-teal-500 to-teal-700',
      testId: 'dashboard-stat-tasks'
    },
    {
      icon: BookOpen,
      label: 'Notes Shared',
      value: stats.totalNotes,
      color: 'from-blue-500 to-blue-700',
      testId: 'dashboard-stat-notes'
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-purple-900" data-testid="dashboard-page">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2" data-testid="dashboard-greeting">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400">Here's your study overview</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover-lift"
                data-testid={stat.testId}
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

        {/* Weekly Focus Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
          data-testid="dashboard-weekly-chart"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Weekly Focus Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #7c3aed40',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="hours" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
