import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  BarChart3,
  Building,
  Users,
  Calendar,
  Heart,
  FileText,
  MessageSquare,
  Bell,
  Activity as ActivityIcon,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  CreditCard,
  Eye,
  Download,
  Plus,
  RefreshCw,
  QrCode,
  Save,
  Settings,
  Filter,
  UserCheck,
  Mail,
  Phone,
  Globe,
  Edit3,
  Send,
  Search,
  User,
} from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState(null);
  const [venues, setVenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({
    name: "",
    location: "",
    capacity: "",
    price_per_day: "",
    category: "",
    description: "",
    image_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Property Interests state
  const [interests, setInterests] = useState([]);
  const [filter, setFilter] = useState("all");

  // Communications state
  const [settings, setSettings] = useState({
    whatsapp_number: "",
    sms_api_key: "",
    sms_sender_phone: "",
    whatsapp_bridge_url: "http://localhost:3001",
    test_phone: "",
  });
  const [bridgeStatus, setBridgeStatus] = useState("disconnected");
  const [testingConnection, setTestingConnection] = useState(false);

  // Message Templates state
  const [templates, setTemplates] = useState({});
  const [globalSettings, setGlobalSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [editedSubject, setEditedSubject] = useState("");

  // Notifications state
  const [notificationBookings, setNotificationBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notificationType, setNotificationType] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  // Activity state
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchReports();
    } else if (activeTab === "venues") {
      fetchVenues();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "bookings") {
      fetchBookings();
    } else if (activeTab === "property-interests") {
      fetchInterests();
    } else if (activeTab === "communications") {
      loadSettings();
      checkBridgeStatus();
    } else if (activeTab === "message-templates") {
      fetchTemplates();
    } else if (activeTab === "notifications") {
      loadNotificationBookings();
    } else if (activeTab === "activity") {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      const res = await api.get("/admin/reports");
      setReports(res.data);
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await api.get("/admin/venues");
      setVenues(res.data);
    } catch (error) {
      toast.error("Failed to load venues");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data);
    } catch (error) {
      toast.error("Failed to load bookings");
    }
  };

  // Property Interests functions
  const fetchInterests = async () => {
    try {
      const response = await api.get("/admin/property-interests");
      setInterests(response.data);
    } catch (error) {
      console.error("Error fetching interests:", error);
      toast.error("Failed to load property interests");
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

  // Communications functions
  const loadSettings = async () => {
    try {
      const response = await api.get("/admin/communication-settings");
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load communication settings");
    }
  };

  const saveSettings = async () => {
    try {
      await api.post("/admin/communication-settings", settings);
      toast.success("Communication settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save communication settings");
    }
  };

  const checkBridgeStatus = async () => {
    try {
      const response = await api.get("/admin/whatsapp-bridge-status");
      setBridgeStatus(response.data.status);
    } catch (error) {
      setBridgeStatus("error");
    }
  };

  const connectWhatsApp = async () => {
    try {
      setTestingConnection(true);
      const response = await api.post("/admin/connect-whatsapp");
      if (response.data.qr_code) {
        toast.info("Scan the QR code with WhatsApp to connect");
      }
    } catch (error) {
      console.error("Failed to get QR code:", error);
      toast.error("Failed to generate WhatsApp QR code");
    } finally {
      setTestingConnection(false);
    }
  };

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      await api.post("/admin/test-connection", {
        phone: settings.test_phone || "+254700000000",
      });
      toast.success("Test message sent! Check your phone.");
    } catch (error) {
      console.error("Test failed:", error);
      toast.error("Test message failed to send");
    } finally {
      setTestingConnection(false);
    }
  };

  // Message Templates functions
  const fetchTemplates = async () => {
    try {
      const [templatesRes, settingsRes] = await Promise.all([
        api.get("/admin/message-templates"),
        api.get("/admin/global-settings"),
      ]);
      setTemplates(templatesRes.data);
      setGlobalSettings(settingsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load message templates");
    }
  };

  const handleEditTemplate = (templateKey, template) => {
    setEditingTemplate(templateKey);
    setEditedSubject(template.subject);
    setEditedMessage(template.message);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setSaving(true);
    try {
      await api.post(`/admin/message-templates/${editingTemplate}`, {
        subject: editedSubject,
        message: editedMessage,
      });
      setTemplates((prev) => ({
        ...prev,
        [editingTemplate]: {
          ...prev[editingTemplate],
          subject: editedSubject,
          message: editedMessage,
        },
      }));
      setEditingTemplate(null);
      toast.success("Message template updated successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGlobalSettings = async (newSettings) => {
    try {
      await api.post("/admin/global-settings", newSettings);
      setGlobalSettings(newSettings);
      toast.success("Global settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update global settings");
    }
  };

  // Notifications functions
  const loadNotificationBookings = async () => {
    try {
      const response = await api.get("/admin/bookings-with-phones");
      setNotificationBookings(response.data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Failed to load bookings");
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
      loadNotificationBookings(); // Refresh to show updated status
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast.error("Failed to send notification");
    }
  };

  // Activity functions
  const fetchActivities = async () => {
    try {
      const mockActivities = [
        {
          id: 1,
          type: "site_visit",
          title: "Site Visit Request",
          description: "John Doe requested a site visit for Nairobi Arboretum",
          user_name: "John Doe",
          user_email: "john@example.com",
          user_phone: "+254700000000",
          property_name: "Nairobi Arboretum",
          status: "pending",
          created_at: new Date(Date.now() - 1000 * 60 * 30),
          priority: "high",
          details: {
            visit_date: "2024-12-15",
            visit_time: "14:00",
            special_requests: "Bring property documents",
          },
        },
        {
          id: 2,
          type: "property_interest",
          title: "Property Interest",
          description:
            "Sarah Johnson expressed interest in 2-bedroom apartments",
          user_name: "Sarah Johnson",
          user_email: "sarah@example.com",
          user_phone: "+254711111111",
          property_name: "Westlands Heights",
          status: "active",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
          priority: "medium",
          details: {
            timeframe_months: 3,
            special_requests: "Prefer ground floor units",
          },
        },
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to load activities");
    }
  };

  const handleAction = async (activityId, action) => {
    try {
      console.log(`Performing ${action} on activity ${activityId}`);
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                status: action === "approve" ? "approved" : "rejected",
              }
            : activity
        )
      );
      toast.success(`Activity ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing activity:`, error);
      toast.error(`Failed to ${action} activity`);
    }
  };

  const deleteVenue = async (venueId) => {
    if (!window.confirm("Are you sure you want to delete this venue?")) return;
    try {
      await api.delete(`/venues/${venueId}`);
      setVenues(venues.filter((v) => v.id !== venueId));
      toast.success("Venue deleted");
    } catch (error) {
      toast.error("Failed to delete venue");
    }
  };

  const updateVenue = async (venueId, updates) => {
    try {
      await api.put(`/venues/${venueId}`, updates);
      setVenues(
        venues.map((v) => (v.id === venueId ? { ...v, ...updates } : v))
      );
      toast.success("Venue updated");
    } catch (error) {
      toast.error("Failed to update venue");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const updateBookingStatus = async (bookingId, status, paymentStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, {
        status,
        payment_status: paymentStatus,
      });
      setBookings(
        bookings.map((b) =>
          b.id === bookingId
            ? { ...b, status, payment_status: paymentStatus }
            : b
        )
      );
      toast.success("Booking updated");
    } catch (error) {
      toast.error("Failed to update booking");
    }
  };

  const openAddVenueModal = () => {
    setEditingVenue(null);
    setVenueForm({
      name: "",
      location: "",
      capacity: "",
      price_per_day: "",
      category: "",
      description: "",
      image_url: "",
    });
    setShowVenueModal(true);
  };

  const openEditVenueModal = (venue) => {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name,
      location: venue.location,
      capacity: venue.capacity,
      price_per_day: venue.price_per_day,
      category: venue.category,
      description: venue.description,
      image_url: venue.image_url,
    });
    setShowVenueModal(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return "";
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded");
      return res.data.url;
    } catch (error) {
      toast.error("Failed to upload image");
      return "";
    } finally {
      setUploadingImage(false);
    }
  };

  const saveVenue = async () => {
    try {
      if (editingVenue) {
        await updateVenue(editingVenue.id, venueForm);
      } else {
        await api.post("/venues", venueForm);
        fetchVenues(); // Refresh list
        toast.success("Venue added");
      }
      setShowVenueModal(false);
    } catch (error) {
      toast.error("Failed to save venue");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "venues", label: "Venues", icon: Building },
    { id: "users", label: "Users", icon: Users },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "property-interests", label: "Property Interests", icon: Heart },
    { id: "communications", label: "Communications", icon: MessageSquare },
    { id: "message-templates", label: "Message Templates", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "activity", label: "Activity", icon: ActivityIcon },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage your venue booking platform</p>
        </div>

        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="admin-content">
          {activeTab === "dashboard" && (
            <div className="dashboard-section">
              <h2>Reports & Analytics</h2>
              {reports ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon revenue">
                      <CreditCard size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">
                        KES {reports.stats.revenue.toLocaleString()}
                      </div>
                      <div className="stat-label">Total Revenue</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon bookings">
                      <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{reports.stats.bookings}</div>
                      <div className="stat-label">Total Bookings</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon users">
                      <Users size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{reports.stats.users}</div>
                      <div className="stat-label">Total Users</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon venues">
                      <Building size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{reports.stats.venues}</div>
                      <div className="stat-label">Total Venues</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="loading">Loading reports...</div>
              )}
            </div>
          )}

          {activeTab === "venues" && (
            <div className="venues-section">
              <div className="section-header">
                <h2>Manage Venues</h2>
                <button className="btn-add" onClick={openAddVenueModal}>
                  <Plus size={16} />
                  Add Venue
                </button>
              </div>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Capacity</th>
                      <th>Price/Day</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map((venue) => (
                      <tr key={venue.id}>
                        <td>{venue.name}</td>
                        <td>{venue.location}</td>
                        <td>{venue.capacity}</td>
                        <td>KES {venue.price_per_day.toLocaleString()}</td>
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() => openEditVenueModal(venue)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => deleteVenue(venue.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="users-section">
              <h2>Manage Users</h2>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bookings-section">
              <h2>Manage Bookings</h2>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Venue</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{booking.user}</td>
                        <td>{booking.venue}</td>
                        <td>
                          {new Date(booking.event_date).toLocaleDateString()}
                        </td>
                        <td>
                          <select
                            value={booking.status}
                            onChange={(e) =>
                              updateBookingStatus(
                                booking.id,
                                e.target.value,
                                booking.payment_status
                              )
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={booking.payment_status}
                            onChange={(e) =>
                              updateBookingStatus(
                                booking.id,
                                booking.status,
                                e.target.value
                              )
                            }
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn-view">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "property-interests" && (
            <div className="property-interests-section">
              <div className="property-interests-container">
                <div className="property-interests-header">
                  <div className="header-content">
                    <h1 className="page-title">Property Interests</h1>
                    <p className="page-subtitle">
                      Manage property interest requests from both signed-in
                      users and guests
                    </p>
                  </div>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <Users size={24} />
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-number">{interests.length}</h3>
                      <p className="stat-label">Total Interests</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
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
                    <div className="stat-icon">
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

                <div className="filters-section">
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${
                        filter === "all" ? "active" : ""
                      }`}
                      onClick={() => setFilter("all")}
                    >
                      <Filter size={16} />
                      All Interests ({interests.length})
                    </button>
                    <button
                      className={`filter-btn ${
                        filter === "signed_in" ? "active" : ""
                      }`}
                      onClick={() => setFilter("signed_in")}
                    >
                      <UserCheck size={16} />
                      Signed-in Users (
                      {interests.filter((i) => i.user_id !== null).length})
                    </button>
                    <button
                      className={`filter-btn ${
                        filter === "guests" ? "active" : ""
                      }`}
                      onClick={() => setFilter("guests")}
                    >
                      <Users size={16} />
                      Guests (
                      {interests.filter((i) => i.guest_id !== null).length})
                    </button>
                  </div>
                </div>

                <div className="interests-list">
                  {interests.length === 0 ? (
                    <div className="empty-state">
                      <Users size={48} />
                      <h3>No interests found</h3>
                      <p>No property interests have been recorded yet.</p>
                    </div>
                  ) : (
                    <div className="interests-grid">
                      {interests.map((interest) => (
                        <div key={interest.id} className="interest-card">
                          <div className="interest-header">
                            <div className="interest-type">
                              {interest.user_id ? (
                                <span className="type-badge type-signed-in">
                                  <UserCheck size={14} />
                                  Signed-in User
                                </span>
                              ) : (
                                <span className="type-badge type-guest">
                                  <Users size={14} />
                                  Guest
                                </span>
                              )}
                            </div>
                            <div className="interest-actions">
                              <button
                                className="action-btn action-delete"
                                onClick={() => deleteInterest(interest.id)}
                                title="Delete interest"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="interest-content">
                            <div className="interest-main">
                              <h3 className="property-name">
                                {interest.property_name}
                              </h3>
                              <p className="unit-type">
                                {interest.unit_type_name}
                              </p>

                              <div className="contact-info">
                                <div className="contact-item">
                                  <UserCheck size={16} />
                                  <span>{interest.contact_name}</span>
                                </div>
                                <div className="contact-item">
                                  <Mail size={16} />
                                  <span>{interest.contact_email}</span>
                                </div>
                                <div className="contact-item">
                                  <Phone size={16} />
                                  <span>{interest.contact_phone}</span>
                                </div>
                              </div>

                              <div className="interest-details">
                                <div className="detail-item">
                                  <Calendar size={16} />
                                  <span>
                                    Notify within: {interest.timeframe_months}{" "}
                                    months
                                  </span>
                                </div>
                              </div>

                              {interest.special_requests && (
                                <div className="special-requests">
                                  <MessageSquare size={16} />
                                  <p>{interest.special_requests}</p>
                                </div>
                              )}

                              {activeTab === "message-templates" && (
                                <div className="message-templates-section">
                                  <div className="message-templates-page">
                                    <div className="page-header">
                                      <div className="header-content">
                                        <MessageSquare
                                          size={32}
                                          className="header-icon"
                                        />
                                        <div>
                                          <h1 className="page-title">
                                            Message Templates
                                          </h1>
                                          <p className="page-subtitle">
                                            Customize notification messages sent
                                            to users
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="global-settings-section">
                                      <div className="section-header">
                                        <Settings size={20} />
                                        <h2>Global Settings</h2>
                                      </div>

                                      <div className="global-settings-grid">
                                        <div className="setting-item">
                                          <label>
                                            <Phone size={16} />
                                            Support Phone
                                          </label>
                                          <input
                                            type="text"
                                            value={
                                              globalSettings.support_phone || ""
                                            }
                                            onChange={(e) =>
                                              setGlobalSettings((prev) => ({
                                                ...prev,
                                                support_phone: e.target.value,
                                              }))
                                            }
                                            placeholder="+254 700 000 000"
                                          />
                                        </div>

                                        <div className="setting-item">
                                          <label>
                                            <Globe size={16} />
                                            Website URL
                                          </label>
                                          <input
                                            type="url"
                                            value={
                                              globalSettings.website_url || ""
                                            }
                                            onChange={(e) =>
                                              setGlobalSettings((prev) => ({
                                                ...prev,
                                                website_url: e.target.value,
                                              }))
                                            }
                                            placeholder="https://victor-springs.com"
                                          />
                                        </div>

                                        <div className="setting-item">
                                          <label>
                                            <Building size={16} />
                                            Company Name
                                          </label>
                                          <input
                                            type="text"
                                            value={
                                              globalSettings.company_name || ""
                                            }
                                            onChange={(e) =>
                                              setGlobalSettings((prev) => ({
                                                ...prev,
                                                company_name: e.target.value,
                                              }))
                                            }
                                            placeholder="Victor Springs"
                                          />
                                        </div>

                                        <div className="setting-item">
                                          <label>
                                            <Mail size={16} />
                                            Support Email
                                          </label>
                                          <input
                                            type="email"
                                            value={
                                              globalSettings.support_email || ""
                                            }
                                            onChange={(e) =>
                                              setGlobalSettings((prev) => ({
                                                ...prev,
                                                support_email: e.target.value,
                                              }))
                                            }
                                            placeholder="support@victor-springs.com"
                                          />
                                        </div>
                                      </div>

                                      <div className="settings-actions">
                                        <button
                                          onClick={() =>
                                            handleUpdateGlobalSettings(
                                              globalSettings
                                            )
                                          }
                                          className="save-settings-btn"
                                        >
                                          <Save size={16} />
                                          Save Global Settings
                                        </button>
                                      </div>
                                    </div>

                                    <div className="templates-section">
                                      <div className="section-header">
                                        <MessageSquare size={20} />
                                        <h2>Message Templates</h2>
                                      </div>

                                      <div className="templates-grid">
                                        {Object.entries(templates).map(
                                          ([key, template]) => (
                                            <div
                                              key={key}
                                              className="template-card"
                                            >
                                              <div className="template-header">
                                                <div className="template-icon">
                                                  {key === "site_visit_request"
                                                    ? "🏛️"
                                                    : key ===
                                                      "site_visit_confirmation"
                                                    ? "✅"
                                                    : key === "express_interest"
                                                    ? "💝"
                                                    : key === "unit_available"
                                                    ? "🎉"
                                                    : key ===
                                                      "site_visit_reminder"
                                                    ? "⏰"
                                                    : key === "welcome"
                                                    ? "🎉"
                                                    : key ===
                                                      "account_verification"
                                                    ? "🔐"
                                                    : key === "password_reset"
                                                    ? "🔑"
                                                    : "📱"}
                                                </div>
                                                <div className="template-info">
                                                  <h3>
                                                    {key
                                                      .replace(/_/g, " ")
                                                      .toUpperCase()}
                                                  </h3>
                                                  <p>{template.subject}</p>
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    handleEditTemplate(
                                                      key,
                                                      template
                                                    )
                                                  }
                                                  className="edit-template-btn"
                                                  disabled={
                                                    editingTemplate === key
                                                  }
                                                >
                                                  <Edit3 size={16} />
                                                  Edit
                                                </button>
                                              </div>

                                              {editingTemplate === key ? (
                                                <div className="template-editor">
                                                  <div className="editor-field">
                                                    <label>Subject Line</label>
                                                    <input
                                                      type="text"
                                                      value={editedSubject}
                                                      onChange={(e) =>
                                                        setEditedSubject(
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="Enter subject line"
                                                    />
                                                  </div>

                                                  <div className="editor-field">
                                                    <label>
                                                      Message Content
                                                    </label>
                                                    <textarea
                                                      value={editedMessage}
                                                      onChange={(e) =>
                                                        setEditedMessage(
                                                          e.target.value
                                                        )
                                                      }
                                                      placeholder="Enter message content"
                                                      rows="12"
                                                    />
                                                  </div>

                                                  <div className="variables-info">
                                                    <h4>
                                                      Available Variables:
                                                    </h4>
                                                    <div className="variables-list">
                                                      {template.variables.map(
                                                        (variable) => (
                                                          <span
                                                            key={variable}
                                                            className="variable-tag"
                                                          >
                                                            {`{${variable}}`}
                                                          </span>
                                                        )
                                                      )}
                                                    </div>
                                                    <p className="variables-note">
                                                      Use curly braces{" "}
                                                      {"{variable}"} to insert
                                                      dynamic content
                                                    </p>
                                                  </div>

                                                  <div className="editor-actions">
                                                    <button
                                                      onClick={() => {
                                                        setEditingTemplate(
                                                          null
                                                        );
                                                        setEditedSubject("");
                                                        setEditedMessage("");
                                                      }}
                                                      className="cancel-btn"
                                                      disabled={saving}
                                                    >
                                                      Cancel
                                                    </button>
                                                    <button
                                                      onClick={
                                                        handleSaveTemplate
                                                      }
                                                      className="save-btn"
                                                      disabled={saving}
                                                    >
                                                      {saving ? (
                                                        <>
                                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                          Saving...
                                                        </>
                                                      ) : (
                                                        <>
                                                          <Save size={16} />
                                                          Save Template
                                                        </>
                                                      )}
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="template-preview">
                                                  <pre className="message-preview">
                                                    {template.message}
                                                  </pre>
                                                </div>
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activeTab === "notifications" && (
                                <div className="notifications-section">
                                  <div className="max-w-7xl mx-auto px-4 py-8">
                                    <div className="mb-8">
                                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Notification Manager
                                      </h1>
                                      <p className="text-gray-600">
                                        Manage automated notifications,
                                        reminders, and confirmations for
                                        bookings
                                      </p>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-md p-6">
                                      <div className="flex items-center gap-3 mb-6">
                                        <Bell
                                          className="text-indigo-600"
                                          size={24}
                                        />
                                        <div>
                                          <h2 className="text-xl font-semibold">
                                            Booking Notifications
                                          </h2>
                                          <p className="text-sm text-gray-600">
                                            Send automated notifications to
                                            booking customers
                                          </p>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        {notificationBookings.length === 0 ? (
                                          <div className="text-center py-8 text-gray-500">
                                            <Calendar
                                              size={48}
                                              className="mx-auto mb-4 opacity-50"
                                            />
                                            <p>No bookings found</p>
                                          </div>
                                        ) : (
                                          notificationBookings.map(
                                            (booking) => (
                                              <div
                                                key={booking.id}
                                                className="border border-gray-200 rounded-lg p-4"
                                              >
                                                <div className="flex items-center justify-between mb-3">
                                                  <div className="flex items-center gap-3">
                                                    <User
                                                      size={20}
                                                      className="text-gray-400"
                                                    />
                                                    <div>
                                                      <h3 className="font-semibold">
                                                        {booking.user_name}
                                                      </h3>
                                                      <p className="text-sm text-gray-600">
                                                        {booking.user_email}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                                      Confirmed
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                      {new Date(
                                                        booking.appointment_date
                                                      ).toLocaleDateString()}
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
                                                    {
                                                      booking.property_name
                                                    } - {booking.unit_type}
                                                  </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                  <button
                                                    onClick={() =>
                                                      sendNotification(
                                                        booking.id,
                                                        "confirmation"
                                                      )
                                                    }
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                                                  >
                                                    <CheckCircle size={14} />
                                                    Send Confirmation
                                                  </button>
                                                  <button
                                                    onClick={() =>
                                                      sendNotification(
                                                        booking.id,
                                                        "reminder"
                                                      )
                                                    }
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                                                  >
                                                    <Clock size={14} />
                                                    Send Reminder
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setSelectedBooking(
                                                        booking
                                                      );
                                                      setNotificationType(
                                                        "custom"
                                                      );
                                                    }}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                                                  >
                                                    <MessageSquare size={14} />
                                                    Custom Message
                                                  </button>
                                                </div>
                                              </div>
                                            )
                                          )
                                        )}
                                      </div>
                                    </div>

                                    {selectedBooking &&
                                      notificationType === "custom" && (
                                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                                            <h3 className="text-lg font-semibold mb-4">
                                              Send Custom Message
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                              To: {selectedBooking.user_name} (
                                              {selectedBooking.user_phone})
                                            </p>
                                            <textarea
                                              value={customMessage}
                                              onChange={(e) =>
                                                setCustomMessage(e.target.value)
                                              }
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
                                                  sendNotification(
                                                    selectedBooking.id,
                                                    "custom",
                                                    customMessage
                                                  );
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
                                  </div>
                                </div>
                              )}

                              {activeTab === "activity" && (
                                <div className="activity-section">
                                  <div className="activity-page">
                                    <div className="activity-container">
                                      <div className="activity-header">
                                        <div className="header-content">
                                          <ActivityIcon
                                            className="header-icon"
                                            size={32}
                                          />
                                          <div>
                                            <h1 className="page-title">
                                              Activity Management
                                            </h1>
                                            <p className="page-subtitle">
                                              Track and manage user activities,
                                              approvals, and requests
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="activity-filters">
                                        <div className="search-bar">
                                          <Search size={18} />
                                          <input
                                            type="text"
                                            placeholder="Search activities..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                              setSearchTerm(e.target.value)
                                            }
                                            className="search-input"
                                          />
                                        </div>

                                        <select
                                          value={statusFilter}
                                          onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                          }
                                          className="filter-select"
                                        >
                                          <option value="all">
                                            All Status
                                          </option>
                                          <option value="pending">
                                            Pending
                                          </option>
                                          <option value="approved">
                                            Approved
                                          </option>
                                          <option value="rejected">
                                            Rejected
                                          </option>
                                          <option value="active">Active</option>
                                        </select>
                                      </div>

                                      <div className="activity-tabs">
                                        <button
                                          className={`tab-button ${
                                            activeTab === "all" ? "active" : ""
                                          }`}
                                          onClick={() => setActiveTab("all")}
                                        >
                                          All Activities ({activities.length})
                                        </button>
                                        <button
                                          className={`tab-button ${
                                            activeTab === "site_visit"
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            setActiveTab("site_visit")
                                          }
                                        >
                                          Site Visits (
                                          {
                                            activities.filter(
                                              (a) => a.type === "site_visit"
                                            ).length
                                          }
                                          )
                                        </button>
                                        <button
                                          className={`tab-button ${
                                            activeTab === "property_interest"
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            setActiveTab("property_interest")
                                          }
                                        >
                                          Interests (
                                          {
                                            activities.filter(
                                              (a) =>
                                                a.type === "property_interest"
                                            ).length
                                          }
                                          )
                                        </button>
                                        <button
                                          className={`tab-button ${
                                            activeTab === "booking_approval"
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            setActiveTab("booking_approval")
                                          }
                                        >
                                          Approvals (
                                          {
                                            activities.filter(
                                              (a) =>
                                                a.type === "booking_approval"
                                            ).length
                                          }
                                          )
                                        </button>
                                      </div>

                                      <div className="activities-content">
                                        {activities.length === 0 ? (
                                          <div className="empty-state">
                                            <ActivityIcon
                                              className="empty-icon"
                                              size={64}
                                            />
                                            <h3 className="empty-title">
                                              No activities found
                                            </h3>
                                            <p className="empty-subtitle">
                                              Activities will appear here as
                                              users interact with the system
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="activities-list">
                                            {activities.map((activity) => (
                                              <div
                                                key={activity.id}
                                                className="activity-card"
                                              >
                                                <div className="activity-header">
                                                  <div className="activity-main">
                                                    {activity.type ===
                                                    "site_visit" ? (
                                                      <Calendar
                                                        className="activity-icon site-visit"
                                                        size={20}
                                                      />
                                                    ) : activity.type ===
                                                      "property_interest" ? (
                                                      <Heart
                                                        className="activity-icon interest"
                                                        size={20}
                                                      />
                                                    ) : activity.type ===
                                                      "booking_approval" ? (
                                                      <CheckCircle
                                                        className="activity-icon approval"
                                                        size={20}
                                                      />
                                                    ) : activity.type ===
                                                      "booking_rejection" ? (
                                                      <XCircle
                                                        className="activity-icon rejection"
                                                        size={20}
                                                      />
                                                    ) : (
                                                      <ActivityIcon
                                                        className="activity-icon"
                                                        size={20}
                                                      />
                                                    )}
                                                    <div className="activity-info">
                                                      <h4 className="activity-title">
                                                        {activity.title}
                                                      </h4>
                                                      <p className="activity-description">
                                                        {activity.description}
                                                      </p>
                                                      <div className="activity-meta">
                                                        <span className="user-info">
                                                          <User size={14} />
                                                          {activity.user_name}
                                                        </span>
                                                        <span className="property-info">
                                                          <Building size={14} />
                                                          {
                                                            activity.property_name
                                                          }
                                                        </span>
                                                        <span className="timestamp">
                                                          {activity.created_at.toLocaleString()}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="activity-badges">
                                                    {activity.priority ===
                                                      "high" && (
                                                      <span className="priority-badge high">
                                                        High
                                                      </span>
                                                    )}
                                                    <span
                                                      className={`status-badge ${activity.status}`}
                                                    >
                                                      {activity.status}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="activity-details">
                                                  <div className="detail-grid">
                                                    <div className="detail-item">
                                                      <Mail size={14} />
                                                      <span>
                                                        {activity.user_email}
                                                      </span>
                                                    </div>
                                                    <div className="detail-item">
                                                      <Phone size={14} />
                                                      <span>
                                                        {activity.user_phone}
                                                      </span>
                                                    </div>
                                                    {activity.details &&
                                                      Object.entries(
                                                        activity.details
                                                      ).map(([key, value]) => (
                                                        <div
                                                          key={key}
                                                          className="detail-item"
                                                        >
                                                          <span className="detail-label">
                                                            {key.replace(
                                                              /_/g,
                                                              " "
                                                            )}
                                                            :
                                                          </span>
                                                          <span>{value}</span>
                                                        </div>
                                                      ))}
                                                  </div>
                                                </div>

                                                {activity.status ===
                                                  "pending" && (
                                                  <div className="activity-actions">
                                                    <button
                                                      className="action-button approve"
                                                      onClick={() =>
                                                        handleAction(
                                                          activity.id,
                                                          "approve"
                                                        )
                                                      }
                                                    >
                                                      <CheckCircle size={16} />
                                                      Approve
                                                    </button>
                                                    <button
                                                      className="action-button reject"
                                                      onClick={() =>
                                                        handleAction(
                                                          activity.id,
                                                          "reject"
                                                        )
                                                      }
                                                    >
                                                      <XCircle size={16} />
                                                      Reject
                                                    </button>
                                                    <button className="action-button view">
                                                      <Eye size={16} />
                                                      View Details
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <div className="activity-summary">
                                        <div className="summary-grid">
                                          <div className="summary-card">
                                            <div className="summary-icon pending">
                                              <Clock size={24} />
                                            </div>
                                            <div className="summary-info">
                                              <h4>
                                                {
                                                  activities.filter(
                                                    (a) =>
                                                      a.status === "pending"
                                                  ).length
                                                }
                                              </h4>
                                              <p>Pending Actions</p>
                                            </div>
                                          </div>
                                          <div className="summary-card">
                                            <div className="summary-icon approved">
                                              <CheckCircle size={24} />
                                            </div>
                                            <div className="summary-info">
                                              <h4>
                                                {
                                                  activities.filter(
                                                    (a) =>
                                                      a.status === "approved"
                                                  ).length
                                                }
                                              </h4>
                                              <p>Approved</p>
                                            </div>
                                          </div>
                                          <div className="summary-card">
                                            <div className="summary-icon active">
                                              <Heart size={24} />
                                            </div>
                                            <div className="summary-info">
                                              <h4>
                                                {
                                                  activities.filter(
                                                    (a) => a.status === "active"
                                                  ).length
                                                }
                                              </h4>
                                              <p>Active Interests</p>
                                            </div>
                                          </div>
                                          <div className="summary-card">
                                            <div className="summary-icon total">
                                              <ActivityIcon size={24} />
                                            </div>
                                            <div className="summary-info">
                                              <h4>{activities.length}</h4>
                                              <p>Total Activities</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="interest-footer">
                              <span className="created-date">
                                Created:{" "}
                                {new Date(
                                  interest.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "communications" && (
            <div className="communications-section">
              <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Communication Settings
                  </h1>
                  <p className="text-gray-600">
                    Configure WhatsApp and SMS settings for automated
                    notifications and live chat
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            bridgeStatus === "connected"
                              ? "bg-green-500"
                              : bridgeStatus === "connecting"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <h3 className="font-semibold">WhatsApp Bridge</h3>
                      </div>
                      <Phone className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {bridgeStatus}
                    </p>
                    <button
                      onClick={checkBridgeStatus}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <RefreshCw size={14} />
                      Refresh Status
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h3 className="font-semibold">SMS Gateway</h3>
                      </div>
                      <MessageSquare className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {settings.sms_api_key ? "Configured" : "Not configured"}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <h3 className="font-semibold">Live Chat</h3>
                      </div>
                      <Settings className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm text-gray-600">Widget active</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Phone className="text-green-600" size={24} />
                    WhatsApp Settings
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={settings.whatsapp_number}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            whatsapp_number: e.target.value,
                          }))
                        }
                        placeholder="+254700000000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Number that receives website chat messages
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bridge URL
                      </label>
                      <input
                        type="url"
                        value={settings.whatsapp_bridge_url}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            whatsapp_bridge_url: e.target.value,
                          }))
                        }
                        placeholder="http://localhost:3001"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">WhatsApp Connection</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={connectWhatsApp}
                        disabled={testingConnection}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        {testingConnection ? (
                          <RefreshCw className="animate-spin" size={16} />
                        ) : (
                          <QrCode size={16} />
                        )}
                        {testingConnection
                          ? "Generating..."
                          : "Connect WhatsApp"}
                      </button>
                      <p className="text-sm text-gray-600">
                        Click to generate QR code for WhatsApp Web connection
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="text-blue-600" size={24} />
                    SMS Settings (httpSMS)
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        httpSMS API Key
                      </label>
                      <input
                        type="password"
                        value={settings.sms_api_key}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            sms_api_key: e.target.value,
                          }))
                        }
                        placeholder="uk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        From httpSMS Android app
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sender Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.sms_sender_phone}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            sms_sender_phone: e.target.value,
                          }))
                        }
                        placeholder="+254700000000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your phone number for sending SMS
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Testing</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.test_phone}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            test_phone: e.target.value,
                          }))
                        }
                        placeholder="+254700000000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={testConnection}
                        disabled={testingConnection || !settings.test_phone}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
                      >
                        {testingConnection ? (
                          <RefreshCw className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Send Test Message
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={saveSettings}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold"
                  >
                    <Save size={16} />
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Venue Modal */}
      {showVenueModal && (
        <div className="modal-overlay" onClick={() => setShowVenueModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVenue ? "Edit Venue" : "Add New Venue"}</h3>
              <button
                className="modal-close"
                onClick={() => setShowVenueModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveVenue();
                }}
              >
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={venueForm.name}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={venueForm.location}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={venueForm.capacity}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, capacity: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price per Day (KES)</label>
                  <input
                    type="number"
                    value={venueForm.price_per_day}
                    onChange={(e) =>
                      setVenueForm({
                        ...venueForm,
                        price_per_day: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={venueForm.category}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Wedding Venues">Wedding Venues</option>
                    <option value="Conference Halls">Conference Halls</option>
                    <option value="Garden Parties">Garden Parties</option>
                    <option value="Beach Resorts">Beach Resorts</option>
                    <option value="Corporate Events">Corporate Events</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={venueForm.description}
                    onChange={(e) =>
                      setVenueForm({
                        ...venueForm,
                        description: e.target.value,
                      })
                    }
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = await handleImageUpload(file);
                        setVenueForm({ ...venueForm, image_url: url });
                      }
                    }}
                  />
                  {uploadingImage && <p>Uploading...</p>}
                  {venueForm.image_url && (
                    <img
                      src={venueForm.image_url}
                      alt="Preview"
                      style={{ width: "100px" }}
                    />
                  )}
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowVenueModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit">
                    {editingVenue ? "Update" : "Add"} Venue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
