import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  Users,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  Trash2,
  Filter,
  Bell,
  X,
  Send,
} from "lucide-react";
import "./PropertyInterests.css";

const PropertyInterests = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, signed_in, guests
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const response = await api.get("/admin/property-interests");
      setInterests(response.data);
    } catch (error) {
      console.error("Error fetching interests:", error);
      toast.error("Failed to load property interests");
    } finally {
      setLoading(false);
    }
  };

  const deleteInterest = async (interestId) => {
    if (!window.confirm("Are you sure you want to delete this interest?")) {
      return;
    }

    try {
      await api.delete(`/admin/property-interests/${interestId}`);
      setInterests(interests.filter((i) => i.id !== interestId));
      toast.success("Interest deleted successfully");
    } catch (error) {
      console.error("Error deleting interest:", error);
      toast.error("Failed to delete interest");
    }
  };

  const openNotificationModal = (interest) => {
    setSelectedInterest(interest);
    // Set default notification message
    const defaultMessage = `🏠 Great news! A unit in ${interest.property_name} (${interest.unit_type_name}) is now available!

Hi ${interest.contact_name},

We're excited to inform you that a unit matching your interest in ${interest.property_name} has become available. This is a limited-time opportunity!

📍 Property: ${interest.property_name}
🏢 Unit Type: ${interest.unit_type_name}
💰 Contact us for pricing details

Don't miss out on this opportunity! Contact us today to secure this unit.

Best regards,
Victor Springs Team
📞 +254 700 000 000`;

    setNotificationMessage(defaultMessage);
    setShowNotificationModal(true);
  };

  const sendNotification = async () => {
    if (!selectedInterest || !notificationMessage.trim()) {
      toast.error("Please enter a notification message");
      return;
    }

    setSendingNotification(true);
    try {
      // Use the custom notification endpoint
      await api.post("/notifications/send-custom", {
        phone: selectedInterest.contact_phone,
        message: notificationMessage,
      });

      // Update the interest to mark as notified (you might want to add a backend field for this)
      toast.success("Notification sent successfully!");
      setShowNotificationModal(false);
      setSelectedInterest(null);
      setNotificationMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  const isInterestActive = (interest) => {
    const validUntil = new Date(interest.valid_until);
    const now = new Date();
    return validUntil > now;
  };

  const filteredInterests = interests.filter((interest) => {
    if (filter === "all") return true;
    if (filter === "signed_in") return interest.user_id !== null;
    if (filter === "guests") return interest.guest_id !== null;
    return true;
  });

  const getTimeframeText = (months) => {
    if (months === 1) return "1 month";
    if (months === 3) return "3 months";
    if (months === 6) return "6 months";
    if (months === 12) return "12 months";
    return `${months} months`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="property-interests-page">
      <div className="property-interests-container">
        {/* Header */}
        <div className="property-interests-header">
          <div className="header-content">
            <h1 className="page-title">Property Interests</h1>
            <p className="page-subtitle">
              Manage property interest requests from both signed-in users and
              guests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{interests.length}</h3>
              <p className="stat-label">Total Interests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon signed-in">
              <UserCheck size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">
                {interests.filter((i) => i.user_id !== null).length}
              </h3>
              <p className="stat-label">Signed-in Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon guests">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-number">
                {interests.filter((i) => i.guest_id !== null).length}
              </h3>
              <p className="stat-label">Guest Users</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              <Filter size={16} />
              All Interests ({interests.length})
            </button>
            <button
              className={`filter-btn ${filter === "signed_in" ? "active" : ""}`}
              onClick={() => setFilter("signed_in")}
            >
              <UserCheck size={16} />
              Signed-in Users (
              {interests.filter((i) => i.user_id !== null).length})
            </button>
            <button
              className={`filter-btn ${filter === "guests" ? "active" : ""}`}
              onClick={() => setFilter("guests")}
            >
              <Users size={16} />
              Guests ({interests.filter((i) => i.guest_id !== null).length})
            </button>
          </div>
        </div>

        {/* Interests Table */}
        <div className="data-table">
          {filteredInterests.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No interests found</h3>
              <p>
                {filter === "all"
                  ? "No property interests have been recorded yet."
                  : `No ${filter.replace("_", " ")} interests found.`}
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Property</th>
                  <th>Unit Type</th>
                  <th>Timeframe</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterests.map((interest) => (
                  <tr key={interest.id}>
                    <td>
                      {interest.user_id ? (
                        <span className="type-badge type-signed-in">
                          <UserCheck size={14} />
                          User
                        </span>
                      ) : (
                        <span className="type-badge type-guest">
                          <Users size={14} />
                          Guest
                        </span>
                      )}
                    </td>
                    <td>
                      <div>
                        <div className="font-semibold">
                          {interest.contact_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {interest.contact_email}
                        </div>
                        <div className="text-sm text-gray-600">
                          {interest.contact_phone}
                        </div>
                      </div>
                    </td>
                    <td>{interest.property_name}</td>
                    <td>{interest.unit_type_name}</td>
                    <td>{getTimeframeText(interest.timeframe_months)}</td>
                    <td>
                      {isInterestActive(interest) ? (
                        <span className="status-badge active">Active</span>
                      ) : (
                        <span className="status-badge expired">Expired</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {isInterestActive(interest) && (
                          <button
                            className="notify-btn"
                            onClick={() => openNotificationModal(interest)}
                            title="Send availability notification"
                          >
                            <Bell size={14} />
                            Notify
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => deleteInterest(interest.id)}
                          title="Delete interest"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Notification Modal */}
        {showNotificationModal && selectedInterest && (
          <div
            className="notification-modal-overlay"
            onClick={() => setShowNotificationModal(false)}
          >
            <div
              className="notification-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="notification-modal-header">
                <h3>Send Availability Notification</h3>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="notification-modal-close"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="notification-modal-content">
                <div className="notification-form-group">
                  <label>Recipient: {selectedInterest.contact_name}</label>
                  <p className="text-sm text-gray-600">
                    Phone: {selectedInterest.contact_phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    Property: {selectedInterest.property_name} (
                    {selectedInterest.unit_type_name})
                  </p>
                </div>

                <div className="notification-form-group">
                  <label htmlFor="notification-message">
                    Notification Message
                  </label>
                  <textarea
                    id="notification-message"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter the notification message..."
                    rows="8"
                  />
                </div>

                <div className="notification-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowNotificationModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={sendNotification}
                    disabled={
                      sendingNotification || !notificationMessage.trim()
                    }
                  >
                    {sendingNotification ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send size={16} />
                        Send Notification
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyInterests;
