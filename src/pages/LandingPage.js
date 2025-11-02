import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, BookOpen, Users, Brain, BarChart3, Clock } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: 'Focus Mode',
      description: 'Pomodoro timer with lofi music to maximize productivity',
    },
    {
      icon: BookOpen,
      title: 'Smart Planner',
      description: 'Kanban board with analytics for efficient task management',
    },
    {
      icon: Users,
      title: 'Collab Rooms',
      description: 'Study together with real-time chat and collaboration',
    },
    {
      icon: Brain,
      title: 'AI Mentor',
      description: 'Get personalized study advice and content summaries',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Track your progress with detailed insights',
    },
    {
      icon: Clock,
      title: 'Session Tracking',
      description: 'Monitor your study hours and productivity patterns',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full glass-card z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            data-testid="landing-logo"
          >
            <h1 className="text-2xl font-bold gradient-text">StudySync</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-x-4"
          >
            <button
              onClick={() => navigate('/auth')}
              data-testid="landing-get-started-btn"
              className="btn-primary"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
              data-testid="landing-hero-title"
            >
              <span className="gradient-text">Your All-in-One</span>
              <br />
              <span className="text-white">Studyverse</span>
            </h1>
            <p
              className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
              data-testid="landing-hero-subtitle"
            >
              Focus better, plan smarter, collaborate seamlessly, and learn faster
              with AI-powered tools designed for modern students.
            </p>
            <button
              onClick={() => navigate('/auth')}
              data-testid="landing-hero-cta-btn"
              className="btn-primary text-lg px-8 py-4 pulse-glow"
            >
              Start Your Journey
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6" data-testid="landing-features-section">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg">All your study tools in one place</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-8 hover-lift"
                  data-testid={`landing-feature-${index}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center mb-6">
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12"
            data-testid="landing-cta-section"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Level Up?</h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of students who are achieving their academic goals with StudySync.
            </p>
            <button
              onClick={() => navigate('/auth')}
              data-testid="landing-final-cta-btn"
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started for Free
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-purple-500/20">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>© 2025 StudySync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;