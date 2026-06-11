import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Chat() {
  const { rideId, userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      socketRef.current.emit('register', user?.id);
      socketRef.current.emit('join-ride-chat', rideId);
    });
    
    socketRef.current.on('new-message', (data) => {
      if (data.senderId === userId || data.senderId === user?.id) {
        setMessages(prev => [...prev, {
          text: data.message,
          senderId: data.senderId,
          timestamp: new Date(data.timestamp)
        }]);
      }
    });
    
    socketRef.current.on('user-typing', (data) => {
      if (data.userId === userId) {
        setTyping(data.isTyping);
      }
    });
    
    fetchChatData();
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [rideId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    try {
      setLoading(true);
      const [chatRes, rideRes, userRes] = await Promise.all([
        axios.get(`/chat/${rideId}/${userId}`),
        axios.get(`/rides/${rideId}`),
        axios.get(`/auth/user/${userId}`)
      ]);
      
      setMessages(chatRes.data.messages || []);
      setRide(rideRes.data.ride);
      setOtherUser(userRes.data.user);
    } catch (error) {
      toast.error('Failed to load chat');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    const messageData = {
      rideId,
      senderId: user?.id,
      receiverId: userId,
      message: newMessage
    };
    
    socketRef.current.emit('send-message', messageData);
    setMessages(prev => [...prev, {
      text: newMessage,
      senderId: user?.id,
      timestamp: new Date()
    }]);
    setNewMessage('');
    setSending(false);
  };

  const handleTyping = () => {
    socketRef.current.emit('typing', {
      rideId,
      userId: user?.id,
      isTyping: true
    });
    setTimeout(() => {
      socketRef.current.emit('typing', {
        rideId,
        userId: user?.id,
        isTyping: false
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-600">
              ← Back
            </button>
            <img
              src={otherUser?.profilePhoto || '/default-avatar.png'}
              alt={otherUser?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">{otherUser?.name}</div>
              <div className="text-xs text-gray-500">
                {ride?.from.city} → {ride?.to.city} • {format(new Date(ride?.date), 'dd MMM')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.senderId === user?.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-900 border'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`text-xs mt-1 ${
                      msg.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(msg.timestamp), 'hh:mm a')}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-4 py-2 border">
                  <div className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyUp={handleTyping}
              placeholder="Type a message..."
              className="input-field flex-1"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary px-4 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Be respectful. This chat is for ride coordination only.
          </p>
        </div>
      </div>
    </div>
  );
}