import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Music } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const FocusMode = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [taskTag, setTaskTag] = useState('');

  useEffect(() => {
    let interval = null;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            saveSession();
            toast.success('Session completed!');
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const saveSession = async () => {
    try {
      await api.post('/focus/sessions', {
        duration: initialMinutes,
        taskTag: taskTag || null
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMinutes(initialMinutes);
    setSeconds(0);
  };

  const percentage = ((initialMinutes * 60 - (minutes * 60 + seconds)) / (initialMinutes * 60)) * 100;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-purple-900" data-testid="focus-page">
      <Sidebar />
      
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-8" data-testid="focus-title">Focus Mode</h1>

          {/* Circular Timer */}
          <div className="relative w-80 h-80 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 140}`}
                strokeDashoffset={`${2 * Math.PI * 140 * (1 - percentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-white" data-testid="focus-timer">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-gray-400 mt-2">Stay focused</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={toggle}
              data-testid="focus-toggle-btn"
              className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              {isActive ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
            </button>
            <button
              onClick={reset}
              data-testid="focus-reset-btn"
              className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <RotateCcw size={24} className="text-white" />
            </button>
          </div>

          {/* Duration Selector */}
          <div className="glass-card p-6 max-w-md mx-auto mb-6">
            <label className="block text-gray-300 mb-3">Session Duration</label>
            <div className="flex gap-3">
              {[15, 25, 45, 60].map(min => (
                <button
                  key={min}
                  onClick={() => { setInitialMinutes(min); setMinutes(min); setSeconds(0); }}
                  data-testid={`focus-duration-${min}`}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    initialMinutes === min
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          {/* Task Tag Input */}
          <div className="glass-card p-6 max-w-md mx-auto mb-6">
            <input
              type="text"
              value={taskTag}
              onChange={(e) => setTaskTag(e.target.value)}
              placeholder="What are you working on?"
              data-testid="focus-task-input"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Mock Music Player */}
          <div className="glass-card p-6 max-w-md mx-auto">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
                <Music size={24} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Lofi Study Beats</p>
                <p className="text-gray-400 text-sm">Focus Music (Mocked)</p>
              </div>
              <div className="music-visualizer">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bar" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FocusMode;