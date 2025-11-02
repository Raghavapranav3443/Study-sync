import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { Plus, Send, Users } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const CollabSpace = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomTopic, setNewRoomTopic] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      const interval = setInterval(() => fetchMessages(selectedRoom.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/collab/rooms');
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await api.get(`/collab/rooms/${roomId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createRoom = async () => {
    if (!newRoomTopic) {
      toast.error('Please enter a topic');
      return;
    }

    try {
      const response = await api.post('/collab/rooms', { topic: newRoomTopic });
      setRooms([response.data, ...rooms]);
      setNewRoomTopic('');
      setShowCreateRoom(false);
      toast.success('Room created!');
    } catch (error) {
      toast.error('Failed to create room');
    }
  };

  const joinRoom = async (room) => {
    try {
      await api.post(`/collab/rooms/${room.id}/join`);
      setSelectedRoom(room);
    } catch (error) {
      toast.error('Failed to join room');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await api.post(`/collab/rooms/${selectedRoom.id}/messages`, {
        text: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-purple-900" data-testid="collab-page">
      <Sidebar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Rooms List */}
        <div className="w-80 border-r border-purple-500/20 glass-card p-6 overflow-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white" data-testid="collab-rooms-title">Study Rooms</h2>
            <button
              onClick={() => setShowCreateRoom(true)}
              data-testid="collab-create-room-btn"
              className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all"
            >
              <Plus size={20} className="text-white" />
            </button>
          </div>

          {/* Create Room Modal */}
          {showCreateRoom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
              data-testid="collab-create-modal"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="glass-card p-8 max-w-md w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Create Study Room</h2>
                <input
                  type="text"
                  value={newRoomTopic}
                  onChange={(e) => setNewRoomTopic(e.target.value)}
                  placeholder="Enter room topic"
                  data-testid="collab-room-topic-input"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={createRoom} data-testid="collab-room-submit-btn" className="flex-1 btn-primary">
                    Create
                  </button>
                  <button onClick={() => setShowCreateRoom(false)} data-testid="collab-room-cancel-btn" className="flex-1 btn-secondary">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          <div className="space-y-3">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => joinRoom(room)}
                data-testid={`collab-room-${index}`}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedRoom?.id === room.id
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{room.topic}</h3>
                    <p className="text-xs text-gray-400">by {room.createdByName}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{room.members.length} members</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col p-6">
          {selectedRoom ? (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white" data-testid="collab-room-name">{selectedRoom.topic}</h2>
                <p className="text-gray-400">Created by {selectedRoom.createdByName}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto custom-scrollbar mb-6 space-y-4" data-testid="collab-messages-area">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}
                    data-testid={`collab-message-${index}`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-2xl ${
                        msg.sender === user.id
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <p className="text-xs opacity-70 mb-1">{msg.senderName}</p>
                      <p>{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  data-testid="collab-message-input"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                />
                <button
                  type="submit"
                  data-testid="collab-send-btn"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" data-testid="collab-no-room-selected">
              <div className="text-center">
                <Users size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Select a room to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollabSpace;