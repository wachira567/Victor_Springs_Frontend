import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Clock,
  Send,
  Phone,
  MessageSquare,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import "./NotificationManager.css";

const NotificationManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notificationType, setNotificationType] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/bookings-with-phones");
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (bookingId, type, customMsg = "") => {
    try {
      const payload = {
        booking_id: bookingId,
        type: type,
        custom_message: customMsg,
      };

      await api.post("/admin/send-notification", payload);
      toast.success(`${type} notification sent successfully!`);
      loadBookings(); // Refresh to show updated status
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast.error("Failed to send notification");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            Pending
          </span>
        );
      case "reminded":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            Reminded
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  const getNotificationOptions = (booking) => {
    const options = [];

    if (booking.status === "pending") {
      options.push({
        type: "confirmation",
        label: "Send Confirmation",
        icon: CheckCircle,
        color: "green",
      });
    }

    // Check if booking is within 24 hours
    const bookingDate = new Date(booking.appointment_date);
    const now = new Date();
    const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);

    if (hoursDiff > 0 && hoursDiff <= 24) {
      options.push({
        type: "reminder",
        label: "Send Reminder",
        icon: Clock,
        color: "blue",
      });
    }

    options.push({
      type: "custom",
      label: "Custom Message",
      icon: MessageSquare,
      color: "purple",
    });

    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="notification-manager-page">
      <div className="notification-manager-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <Bell size={32} />
            </div>
            <div className="header-text">
              <h1 className="page-title">Notification Manager</h1>
              <p className="page-subtitle">
                Send automated notifications, reminders, and confirmations to
                customers
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {
                  bookings.filter((b) => b.notification_status === "pending")
                    .length
                }
              </div>
              <div className="stat-label">Pending Notifications</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon confirmed">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {bookings.filter((b) => b.status === "confirmed").length}
              </div>
              <div className="stat-label">Confirmed Bookings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{bookings.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>
        </div>

        {/* Bookings Management */}
        <div className="bookings-section">
          <div className="section-header">
            <div className="section-icon">
              <MessageSquare size={24} />
            </div>
            <div className="section-content">
              <h2 className="section-title">Booking Notifications</h2>
              <p className="section-subtitle">
                Send automated notifications to booking customers
              </p>
            </div>
            <button
              onClick={loadBookings}
              className="refresh-btn"
              disabled={loading}
            >
              <Bell size={16} />
              Refresh
            </button>
          </div>

          <div className="bookings-list">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <Calendar size={64} className="empty-icon" />
                <h3 className="empty-title">No bookings found</h3>
                <p className="empty-subtitle">
                  There are currently no bookings that need notifications
                </p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="customer-info">
                      <div className="customer-avatar">
                        <User size={20} />
                      </div>
                      <div className="customer-details">
                        <h3 className="customer-name">{booking.user_name}</h3>
                        <p className="customer-email">{booking.user_email}</p>
                      </div>
                    </div>
                    <div className="booking-meta">
                      {getStatusBadge(booking.notification_status)}
                      <span className="booking-date">
                        {new Date(
                          booking.appointment_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-item">
                      <Phone size={16} />
                      <span>{booking.user_phone}</span>
                    </div>
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>
                        {booking.property_name} - {booking.unit_type}
                      </span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {getNotificationOptions(booking).map((option) => (
                      <button
                        key={option.type}
                        onClick={() => {
                          if (option.type === "custom") {
                            setSelectedBooking(booking);
                            setNotificationType("custom");
                          } else {
                            sendNotification(booking.id, option.type);
                          }
                        }}
                        className={`action-btn ${option.color}`}
                      >
                        <option.icon size={16} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Custom Message Modal */}
        {selectedBooking && notificationType === "custom" && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Send Custom Message</h3>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setCustomMessage("");
                  }}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="recipient-info">
                  <User size={20} />
                  <span>To: {selectedBooking.user_name}</span>
                  <Phone size={16} />
                  <span>{selectedBooking.user_phone}</span>
                </div>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter your custom message..."
                  className="message-input"
                  rows={4}
                />
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setCustomMessage("");
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    sendNotification(
                      selectedBooking.id,
                      "custom",
                      customMessage
                    );
                    setSelectedBooking(null);
                    setCustomMessage("");
                  }}
                  className="btn-primary"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="info-section">
          <div className="info-header">
            <Bell size={20} />
            <h3 className="info-title">Notification Types</h3>
          </div>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon confirmation">
                <CheckCircle size={24} />
              </div>
              <div className="info-content">
                <h4 className="info-card-title">Confirmations</h4>
                <p className="info-card-text">Sent when booking is approved</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon reminder">
                <Clock size={24} />
              </div>
              <div className="info-content">
                <h4 className="info-card-title">Reminders</h4>
                <p className="info-card-text">
                  Sent 24 hours before appointment
                </p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon custom">
                <MessageSquare size={24} />
              </div>
              <div className="info-content">
                <h4 className="info-card-title">Custom Messages</h4>
                <p className="info-card-text">
                  Manual messages for any purpose
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;