import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, MessageSquare, List } from 'lucide-react';
import OrdersView from './OrdersView';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('crm'); // 'crm' or 'orders'
  const [conversations, setConversations] = useState({});
  const [activePhone, setActivePhone] = useState(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // Poll every 5 seconds for new messages
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activePhone]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/conversations`);
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activePhone) return;

    try {
      await axios.post(`${API_URL}/api/admin/reply`, {
        phone: activePhone,
        message: replyText
      });
      setReplyText('');
      fetchConversations(); // Refresh immediately
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  };

  const activeMessages = conversations[activePhone] || [];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🌿 ReLeaf Admin</h2>
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'crm' ? 'active' : ''}`}
              onClick={() => setActiveTab('crm')}
            >
              <MessageSquare size={16} /> CRM
            </button>
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <List size={16} /> Orders
            </button>
          </div>
        </div>
        
        {activeTab === 'crm' && (
          <div className="contact-list">
          {Object.keys(conversations).length === 0 && (
            <p className="no-chats">No conversations yet.</p>
          )}
          {Object.entries(conversations).map(([phone, msgs]) => {
            const lastMsg = msgs[msgs.length - 1];
            return (
              <div 
                key={phone} 
                className={`contact-item ${activePhone === phone ? 'active' : ''}`}
                onClick={() => setActivePhone(phone)}
              >
                <div className="contact-avatar"><User size={20} /></div>
                <div className="contact-info">
                  <h4>{phone}</h4>
                  <p>{lastMsg?.message.substring(0, 30)}...</p>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'orders' ? (
        <OrdersView />
      ) : (
        <div className="chat-area">
        {activePhone ? (
          <>
            <div className="chat-header">
              <h3>{activePhone}</h3>
            </div>
            
            <div className="messages-container">
              {activeMessages.map((msg) => (
                <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                  <div className={`message-bubble ${msg.sender}`}>
                    <span className="sender-label">
                      {msg.sender === 'user' ? 'Customer' : msg.sender === 'ai' ? '🤖 AI' : '👨‍💻 You'}
                    </span>
                    <p>{msg.message}</p>
                    <span className="timestamp">{new Date(msg.createdat).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Type a manual reply..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button type="submit" disabled={!replyText.trim()}><Send size={18} /></button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <MessageSquare size={48} color="#ccc" />
            <h3>Select a conversation to start messaging</h3>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default App;
