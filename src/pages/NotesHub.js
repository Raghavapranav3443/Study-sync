import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Plus, Download, Trash2, FileText, Sparkles } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const NotesHub = () => {
  const [notes, setNotes] = useState([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    subject: '',
    content: ''
  });
  const [summarizing, setSummarizing] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (error) {
      toast.error('Failed to load notes');
    }
  };

  const addNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await api.post('/notes', newNote);
      setNotes([response.data, ...notes]);
      setNewNote({ title: '', subject: '', content: '' });
      setShowAddNote(false);
      toast.success('Note added!');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const downloadNote = async (noteId) => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      // Just increment download count
      toast.success('Download recorded');
    } catch (error) {
      toast.error('Failed to download note');
    }
  };

  const getSummary = async (noteId, content) => {
    setSummarizing(noteId);
    try {
      const response = await api.post('/ai/summarize', { text: content });
      toast.success(response.data.summary);
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setSummarizing(null);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-purple-900" data-testid="notes-page">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2" data-testid="notes-title">Notes Hub</h1>
              <p className="text-gray-400">Share and discover study notes</p>
            </div>
            <button
              onClick={() => setShowAddNote(true)}
              data-testid="notes-add-btn"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Note</span>
            </button>
          </div>

          {/* Add Note Modal */}
          {showAddNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
              data-testid="notes-add-modal"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-auto"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Add New Note</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="Note title"
                    data-testid="notes-title-input"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                  <input
                    type="text"
                    value={newNote.subject}
                    onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                    placeholder="Subject"
                    data-testid="notes-subject-input"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    placeholder="Note content"
                    rows="10"
                    data-testid="notes-content-input"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={addNote}
                      data-testid="notes-submit-btn"
                      className="flex-1 btn-primary"
                    >
                      Add Note
                    </button>
                    <button
                      onClick={() => setShowAddNote(false)}
                      data-testid="notes-cancel-btn"
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Notes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 hover-lift"
                data-testid={`notes-card-${index}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => getSummary(note.id, note.content)}
                      disabled={summarizing === note.id}
                      data-testid={`notes-summarize-${note.id}`}
                      className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-all"
                    >
                      <Sparkles size={16} className="text-purple-400" />
                    </button>
                    <button
                      onClick={() => downloadNote(note.id)}
                      data-testid={`notes-download-${note.id}`}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-all"
                    >
                      <Download size={16} className="text-blue-400" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      data-testid={`notes-delete-${note.id}`}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">{note.title}</h3>
                {note.subject && (
                  <p className="text-sm text-purple-400 mb-2">{note.subject}</p>
                )}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{note.uploaderName}</span>
                  <span>{note.downloads} downloads</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesHub;