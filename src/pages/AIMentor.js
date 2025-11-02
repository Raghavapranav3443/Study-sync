import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Send, Brain, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const AIMentor = () => {
  const { user } = useAuth();
  const [sessionId] = useState(`session-${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const response = await api.get(`/ai/mentor/history/${sessionId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message to UI immediately
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      message: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await api.post('/ai/mentor', {
        sessionId,
        message: userMessage
      });

      // Add AI response
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        message: response.data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      toast.error('Failed to get response');
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How can I improve my study habits?',
    'What\'s the Pomodoro technique?',
    'Tips for effective note-taking',
    'How to stay motivated while studying?'
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-purple-900" data-testid="mentor-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
              <Brain size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white" data-testid="mentor-title">AI Study Mentor</h1>
              <p className="text-gray-400">Your personal study assistant</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 glass-card p-6 overflow-auto custom-scrollbar mb-6" data-testid="mentor-messages-area">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" data-testid="mentor-empty-state">
              <Sparkles size={64} className="text-purple-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Start a conversation</h2>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                Ask me anything about study techniques, time management, motivation, or any academic topic!
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-2xl">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    data-testid={`mentor-quick-prompt-${index}`}
                    className="p-4 glass rounded-xl text-left text-white hover-lift text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`mentor-message-${index}`}
                >
                  <div
                    className={`max-w-2xl p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {msg.role === 'assistant' && (
                        <Brain size={16} className="text-purple-400" />
                      )}
                      <span className="text-xs opacity-70">
                        {msg.role === 'user' ? 'You' : 'AI Mentor'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                  data-testid="mentor-loading"
                >
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your study mentor anything..."
            disabled={loading}
            data-testid="mentor-input"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            data-testid="mentor-send-btn"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIMentor;