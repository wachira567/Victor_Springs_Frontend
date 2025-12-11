import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "./Messages.css";

const Messages = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchMessages = async () => {
      try {
        // This would be a real API endpoint in production
        // For now, we'll show mock data
        const mockMessages = [
          {
            id: 1,
            type: "whatsapp",
            subject: "Site Visit Confirmation",
            message:
              "Your site visit for Nairobi Arboretum has been confirmed for tomorrow at 2:00 PM.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            status: "delivered",
            sender: "Victor Springs Support",
          },
          {
            id: 2,
            type: "email",
            subject: "Property Interest Update",
            message:
              "We've received your interest in 3-bedroom apartments. We'll notify you when units become available.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            status: "read",
            sender: "Victor Springs Team",
          },
          {
            id: 3,
            type: "system",
            subject: "Booking Reminder",
            message:
              "Reminder: Your viewing appointment is scheduled for tomorrow at 10:00 AM.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            status: "unread",
            sender: "System Notification",
          },
        ];
        setMessages(mockMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, navigate]);

  const getMessageIcon = (type) => {
    switch (type) {
      case "whatsapp":
        return <Phone className="message-icon whatsapp" size={20} />;
      case "email":
        return <Mail className="message-icon email" size={20} />;
      case "system":
        return <MessageSquare className="message-icon system" size={20} />;
      default:
        return <MessageSquare className="message-icon" size={20} />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="status-icon delivered" size={16} />;
      case "read":
        return <CheckCircle className="status-icon read" size={16} />;
      case "unread":
        return <div className="status-icon unread"></div>;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredMessages = messages.filter((message) => {
    if (activeTab === "all") return true;
    return message.type === activeTab;
  });

  if (loading) {
    return (
      <div className="messages-page">
        <div className="messages-container">
          <div className="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p>Loading your messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Header */}
        <div className="messages-header">
          <div className="header-content">
            <MessageSquare className="header-icon" size={32} />
            <div>
              <h1 className="page-title">Messages & Conversations</h1>
              <p className="page-subtitle">
                Track all your communications with Victor Springs
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="messages-tabs">
          <button
            className={`tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Messages ({messages.length})
          </button>
          <button
            className={`tab-button ${activeTab === "whatsapp" ? "active" : ""}`}
            onClick={() => setActiveTab("whatsapp")}
          >
            WhatsApp ({messages.filter((m) => m.type === "whatsapp").length})
          </button>
          <button
            className={`tab-button ${activeTab === "email" ? "active" : ""}`}
            onClick={() => setActiveTab("email")}
          >
            Email ({messages.filter((m) => m.type === "email").length})
          </button>
          <button
            className={`tab-button ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            System ({messages.filter((m) => m.type === "system").length})
          </button>
        </div>

        {/* Messages List */}
        <div className="messages-content">
          {filteredMessages.length === 0 ? (
            <div className="empty-state">
              <MessageSquare className="empty-icon" size={64} />
              <h3 className="empty-title">No messages yet</h3>
              <p className="empty-subtitle">
                Your messages and conversation history will appear here
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {filteredMessages.map((message) => (
                <div key={message.id} className="message-card">
                  <div className="message-header">
                    <div className="message-sender">
                      {getMessageIcon(message.type)}
                      <div>
                        <h4 className="sender-name">{message.sender}</h4>
                        <p className="message-subject">{message.subject}</p>
                      </div>
                    </div>
                    <div className="message-meta">
                      {getStatusIcon(message.status)}
                      <span className="timestamp">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="message-content">
                    <p>{message.message}</p>
                  </div>
                  <div className="message-actions">
                    <button className="action-button reply">
                      <MessageSquare size={16} />
                      Reply
                    </button>
                    <button className="action-button mark-read">
                      {message.status === "unread"
                        ? "Mark as Read"
                        : "Mark as Unread"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="page-footer">
          <p>
            Need help? Contact us through WhatsApp or email for immediate
            assistance.
          </p>
          <div className="footer-actions">
            <button className="footer-button whatsapp">
              <Phone size={18} />
              Start WhatsApp Chat
            </button>
            <button className="footer-button email">
              <Mail size={18} />
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
