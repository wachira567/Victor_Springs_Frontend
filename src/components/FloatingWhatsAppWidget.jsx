import { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { MessageCircle, X, Send, Phone } from "lucide-react";
import { io } from "socket.io-client";
import api from "../api/axios";
import "./FloatingWhatsAppWidget.css";

const FloatingWhatsAppWidget = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [whatsappFailed, setWhatsappFailed] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: ''
  });
  const [communicationSettings, setCommunicationSettings] = useState({
    whatsapp_number: '',
    support_phone: '',
    support_email: '',
    company_name: '',
    floating_widget_enabled: true
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const socketRef = useRef(null);

  // Load user profile and communication settings
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [profileRes, commRes] = await Promise.all([
            api.get('/users/me'),
            api.get('/communication-settings')
          ]);

          setProfileData({
            username: profileRes.data.username || profileRes.data.first_name || '',
            email: profileRes.data.email || '',
            phone: profileRes.data.phone_number || ''
          });

          setCommunicationSettings(commRes.data);
        } catch (error) {
          console.error("Error fetching widget data:", error);
        }
      };
      fetchData();
    }
  }, [user]);

  // Connect to WhatsApp bridge when widget opens
  const connectToWhatsAppBridge = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setConnectionAttempts(prev => prev + 1);

    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: false
    });

    socketRef.current.on('connect', () => {
      console.log('Floating widget connected to WhatsApp bridge');
      setSocketConnected(true);
      setWhatsappFailed(false);
      setConnectionAttempts(0);

      // Automatically expand to chat when connected
      setIsExpanded(true);
      setChatMessages([{
        id: Date.now(),
        type: 'system',
        content: `👋 Welcome ${profileData.username || 'there'}!\n\nOur support team is ready to assist you. Send us a message and we'll respond via WhatsApp.\n\nHow can we help you with your Victor Springs experience today?`,
        timestamp: new Date(),
        sender: 'Victor Springs'
      }]);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Floating widget disconnected from WhatsApp bridge');
      setSocketConnected(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Floating widget WhatsApp bridge connection failed:', error);
      setSocketConnected(false);

      if (connectionAttempts >= 2) {
        setWhatsappFailed(true);
        console.log('Floating widget: WhatsApp marked as failed, opening Tawk fallback');

        // Automatically open Tawk when WhatsApp fails
        setTimeout(() => {
          if (window.Tawk_API) {
            const userName = profileData.username || user?.first_name || user?.username || 'Guest User';
            const userEmail = profileData.email || user?.email || '';
            const userPhone = profileData.phone || '';

            window.Tawk_API.setAttributes({
              name: userName,
              email: userEmail,
              phone: userPhone,
              userId: user?.id || '',
              role: user?.role || 'Client',
              page: 'floating_widget_fallback',
              inquiryType: 'whatsapp_fallback',
              company: communicationSettings.company_name || 'Victor Springs',
              userType: 'client'
            });

            window.Tawk_API.showWidget();
            window.Tawk_API.maximize();

            // Close our widget since Tawk is now open
            setIsOpen(false);
            disconnectFromWhatsAppBridge();
          }
        }, 1000);
      }
    });

    socketRef.current.on('receive_message', (data) => {
      const adminMessage = {
        id: Date.now(),
        type: 'admin',
        content: data.text,
        timestamp: new Date(),
        sender: 'Support Team'
      };
      setChatMessages(prev => [...prev, adminMessage]);
    });
  };

  const disconnectFromWhatsAppBridge = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    }
  };

  const toggleWidget = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Try to connect to WhatsApp bridge first
      connectToWhatsAppBridge();
    } else {
      setIsOpen(false);
      // Disconnect when closing
      disconnectFromWhatsAppBridge();
    }
  };

  const hideWidget = () => {
    setIsHidden(true);
    setIsOpen(false);
    disconnectFromWhatsAppBridge();
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date(),
      sender: profileData.username || 'You'
    };

    setChatMessages(prev => [...prev, message]);

    if (socketRef.current && socketConnected) {
      socketRef.current.emit('send_message', {
        text: newMessage,
        user: profileData.username,
        email: profileData.email
      });
    }

    setNewMessage('');
  };

  // Define allowed pages for widget visibility
  const allowedPages = [
    '/dashboard',
    '/properties',
    '/contact',
    '/dashboard/messages'
  ];

  // Check if current page is allowed (or if it's a property detail page)
  const isAllowedPage = allowedPages.includes(location.pathname) ||
                       location.pathname.startsWith('/properties/');

  // Don't show widget if:
  // 1. User is not logged in
  // 2. Page is not in allowed list
  // 3. Widget is disabled by admin
  // 4. Widget is hidden by user
  if (!user || !isAllowedPage || !communicationSettings.floating_widget_enabled || isHidden) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="floating-whatsapp-widget">
        <button
          className={`floating-whatsapp-button ${isOpen ? 'active' : ''}`}
          onClick={toggleWidget}
          aria-label="Open WhatsApp Chat"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>

        {/* Expanded Widget */}
        {isOpen && (
          <div className="floating-whatsapp-popup">
            <div className="widget-header">
              <div className="widget-header-content">
                <MessageCircle size={20} />
                <span>Victor Springs Support</span>
              </div>
              <div className="header-actions">
                <button
                  onClick={hideWidget}
                  className="hide-widget-btn"
                  title="Don't show again"
                >
                  ✕
                </button>
                <div className={`connection-status ${socketConnected ? 'connected' : whatsappFailed ? 'failed' : 'connecting'}`}>
                  {socketConnected ? '🟢 Connected' : whatsappFailed ? '🔴 Unavailable' : '🟡 Connecting...'}
                </div>
              </div>
            </div>

            {/* Chat Interface - Always show when widget is open */}
            <div className="widget-chat">
              <div className="chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.type}`}>
                    <div className="message-content">
                      <div className="message-text">{msg.content}</div>
                      <div className="message-time">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {whatsappFailed && (
                  <div className="chat-message system">
                    <div className="message-content">
                      <div className="message-text">
                        🔄 Connecting you to our live chat support...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={
                    socketConnected ? "Type your message..." :
                    whatsappFailed ? "Opening live chat..." : "Connecting..."
                  }
                  className="message-input"
                  disabled={!socketConnected || whatsappFailed}
                />
                <button
                  onClick={sendMessage}
                  className="send-button"
                  disabled={!socketConnected || !newMessage.trim() || whatsappFailed}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingWhatsAppWidget;