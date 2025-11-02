import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Plus, Trash2, Check } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const Planner = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    dueDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const addTask = async () => {
    if (!newTask.title) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const response = await api.post('/tasks', newTask);
      setTasks([...tasks, response.data]);
      setNewTask({ title: '', subject: '', dueDate: '', priority: 'medium' });
      setShowAddTask(false);
      toast.success('Task added!');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const toggleComplete = async (taskId, completed) => {
    try {
      await api.patch(`/tasks/${taskId}`, { completed: !completed });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const todoTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-purple-900" data-testid="planner-page">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2" data-testid="planner-title">Study Planner</h1>
              <p className="text-gray-400">Organize your tasks</p>
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              data-testid="planner-add-task-btn"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Task</span>
            </button>
          </div>

          {/* Add Task Modal */}
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
              data-testid="planner-add-modal"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-8 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Add New Task</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Task title"
                    data-testid="planner-task-title-input"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                  <input
                    type="text"
                    value={newTask.subject}
                    onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                    placeholder="Subject (optional)"
                    data-testid="planner-task-subject-input"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    data-testid="planner-task-date-input"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    data-testid="planner-task-priority-select"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={addTask}
                      data-testid="planner-task-submit-btn"
                      className="flex-1 btn-primary"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => setShowAddTask(false)}
                      data-testid="planner-task-cancel-btn"
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Tasks Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* To Do Column */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4" data-testid="planner-todo-title">To Do ({todoTasks.length})</h2>
              <div className="space-y-4">
                {todoTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-4"
                    data-testid={`planner-task-todo-${index}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{task.title}</h3>
                        {task.subject && <p className="text-sm text-gray-400 mb-2">{task.subject}</p>}
                        {task.dueDate && (
                          <p className="text-xs text-purple-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        )}
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleComplete(task.id, task.completed)}
                          data-testid={`planner-task-complete-${task.id}`}
                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all"
                        >
                          <Check size={16} className="text-green-400" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          data-testid={`planner-task-delete-${task.id}`}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4" data-testid="planner-completed-title">Completed ({completedTasks.length})</h2>
              <div className="space-y-4">
                {completedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-4 opacity-70"
                    data-testid={`planner-task-completed-${index}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium line-through mb-1">{task.title}</h3>
                        {task.subject && <p className="text-sm text-gray-400 mb-2">{task.subject}</p>}
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        data-testid={`planner-task-delete-completed-${task.id}`}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;