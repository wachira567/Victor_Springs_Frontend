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
      // This would need a new endpoint to get bookings with user phone numbers
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Notification Manager
        </h1>
        <p className="text-gray-600">
          Manage automated notifications, reminders, and confirmations for
          bookings
        </p>
      </div>

      {/* Bookings Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-indigo-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold">Booking Notifications</h2>
            <p className="text-sm text-gray-600">
              Send automated notifications to booking customers
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No bookings found</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-gray-400" />
                    <div>
                      <h3 className="font-semibold">{booking.user_name}</h3>
                      <p className="text-sm text-gray-600">
                        {booking.user_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.notification_status)}
                    <span className="text-sm text-gray-500">
                      {new Date(booking.appointment_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone size={14} />
                    {booking.user_phone}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Mail size={14} />
                    {booking.property_name} - {booking.unit_type}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
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
                      className={`bg-${option.color}-600 hover:bg-${option.color}-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm`}
                    >
                      <option.icon size={14} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Custom Message</h3>
            <p className="text-sm text-gray-600 mb-4">
              To: {selectedBooking.user_name} ({selectedBooking.user_phone})
            </p>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your custom message..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setCustomMessage("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sendNotification(selectedBooking.id, "custom", customMessage);
                  setSelectedBooking(null);
                  setCustomMessage("");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Send size={16} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-900 mb-2">
          Notification Types
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-indigo-800">📋 Confirmations</h4>
            <p className="text-indigo-700">Sent when booking is approved</p>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-800">⏰ Reminders</h4>
            <p className="text-indigo-700">Sent 24 hours before appointment</p>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-800">
              💬 Custom Messages
            </h4>
            <p className="text-indigo-700">Manual messages for any purpose</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;
