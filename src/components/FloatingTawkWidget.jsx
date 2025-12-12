import { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { MessageCircle, X } from "lucide-react";
import api from "../api/axios";
import "./FloatingTawkWidget.css";

const FloatingTawkWidget = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: ''
  });
  const [isVisible, setIsVisible] = useState(true);

  // Load user profile data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const response = await api.get('/users/me');
          setProfileData({
            username: response.data.username || response.data.first_name || '',
            email: response.data.email || '',
            phone: response.data.phone_number || ''
          });
        } catch (error) {
          console.error("Error fetching profile for Tawk widget:", error);
        }
      };
      fetchProfile();
    }
  }, [user]);

  // Don't show widget if:
  // 1. User is not logged in
  // 2. On Messages page (to avoid duplication)
  // 3. Widget is hidden
  if (!user || location.pathname === '/dashboard/messages' || !isVisible) {
    return null;
  }

  const toggleWidget = () => {
    if (window.Tawk_API) {
      // Set user attributes for Tawk with personalization
      const userName = profileData.username || user?.first_name || user?.username || 'Guest User';
      const userEmail = profileData.email || user?.email || '';

      window.Tawk_API.setAttributes({
        name: userName,
        email: userEmail,
        userId: user?.id || '',
        role: user?.role || 'Client',
        page: location.pathname,
        inquiryType: 'floating_widget'
      });

      // Toggle the widget
      if (window.Tawk_API.isChatHidden && window.Tawk_API.isChatHidden()) {
        window.Tawk_API.showWidget();
        window.Tawk_API.maximize();
      } else {
        window.Tawk_API.hideWidget();
      }
    } else {
      console.warn('Tawk.to widget not loaded');
    }
  };

  const hideWidget = () => {
    setIsVisible(false);
  };

  return (
    <div className="floating-tawk-widget">
      <button
        className="floating-tawk-button"
        onClick={toggleWidget}
        aria-label="Open Live Chat"
        title="Chat with our support team"
      >
        <MessageCircle size={24} />
      </button>

      {/* Optional: Close button for the floating widget itself */}
      <button
        className="floating-tawk-close"
        onClick={hideWidget}
        aria-label="Hide chat widget"
        title="Don't show again"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default FloatingTawkWidget;