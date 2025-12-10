import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  MessageSquare,
  Send,
  User,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "react-toastify";
import "./Messages.css";

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [isTawkLoaded, setIsTawkLoaded] = useState(false);

  useEffect(() => {
    // Check if Tawk.to is loaded
    const checkTawkLoaded = () => {
      if (window.Tawk_API && window.Tawk_API.getStatus() !== undefined) {
        setIsTawkLoaded(true);
      }
    };

    // Check immediately
    checkTawkLoaded();

    // Also check after a delay in case it loads later
    const timeout = setTimeout(checkTawkLoaded, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const openTawkChat = () => {
    if (window.Tawk_API && isTawkLoaded) {
      // Set user attributes for better support
      window.Tawk_API.setAttributes({
        name: user?.username || "VenueVibe User",
        email: user?.email || "",
        userType: "client",
        source: "messages_page",
      });

      // Open the chat widget
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();

      toast.success("Chat opened! Our support team will assist you.");
    } else {
      toast.error("Chat is not available right now. Please try again later.");
    }
  };

  const sendQuickMessage = (message) => {
    if (window.Tawk_API && isTawkLoaded) {
      // Set user attributes
      window.Tawk_API.setAttributes({
        name: user?.username || "VenueVibe User",
        email: user?.email || "",
        userType: "client",
        source: "messages_page",
        quickMessage: message,
      });

      // Add an event and open chat
      window.Tawk_API.addEvent("Quick Inquiry", {
        message: message,
        user: user?.username,
        timestamp: new Date().toISOString(),
      });

      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();

      toast.success(
        "Quick message sent! Chat opened for detailed conversation."
      );
    } else {
      toast.error("Chat is not available right now. Please try again later.");
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-header">
          <h1 className="messages-title">
            <MessageSquare className="text-indigo-600" size={32} />
            Support & Messages
          </h1>
          <p className="messages-subtitle">
            Get help with viewings, property inquiries, and support
          </p>
        </div>

        <div className="messages-content">
          {/* Chat Status */}
          <div className="messages-status">
            <div
              className={`messages-status-indicator ${
                isTawkLoaded ? "online" : "offline"
              }`}
            >
              <div className="messages-status-dot"></div>
              <span>
                {isTawkLoaded ? "Live Chat Available" : "Chat Loading..."}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="messages-quick-actions">
            <h3 className="messages-section-title">Quick Help</h3>
            <div className="messages-action-grid">
              <button
                onClick={() => sendQuickMessage("I need help with a booking")}
                className="messages-action-button"
              >
                <MessageSquare size={20} />
                <span>Booking Help</span>
              </button>

              <button
                onClick={() =>
                  sendQuickMessage("I have questions about a property")
                }
                className="messages-action-button"
              >
                <ExternalLink size={20} />
                <span>Venue Questions</span>
              </button>

              <button
                onClick={() => sendQuickMessage("I need to modify my booking")}
                className="messages-action-button"
              >
                <User size={20} />
                <span>Modify Booking</span>
              </button>

              <button
                onClick={() => sendQuickMessage("I have a general inquiry")}
                className="messages-action-button"
              >
                <Send size={20} />
                <span>General Inquiry</span>
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="messages-contact">
            <h3 className="messages-section-title">Alternative Contact</h3>
            <div className="messages-contact-grid">
              <div className="messages-contact-item">
                <Phone className="messages-contact-icon" size={20} />
                <div>
                  <p className="messages-contact-label">Phone Support</p>
                  <p className="messages-contact-value">+254 700 000 000</p>
                </div>
              </div>

              <div className="messages-contact-item">
                <Mail className="messages-contact-icon" size={20} />
                <div>
                  <p className="messages-contact-label">Email Support</p>
                  <p className="messages-contact-value">
                    support@victorsprings.co.ke
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Open Full Chat */}
          <div className="messages-full-chat">
            <button
              onClick={openTawkChat}
              className="messages-full-chat-button"
              disabled={!isTawkLoaded}
            >
              <MessageSquare size={20} />
              <span>Open Live Chat</span>
              <ExternalLink size={16} />
            </button>
            <p className="messages-full-chat-note">
              Start a conversation with our support team for personalized
              assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
