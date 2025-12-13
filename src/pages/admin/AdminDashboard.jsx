import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import NotificationManager from "./NotificationManager";
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
  Clock,
  AlertTriangle,
  Home,
  X,
} from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [siteVisits, setSiteVisits] = useState([]);
  const [guestSiteVisits, setGuestSiteVisits] = useState([]);
  const [userSiteVisits, setUserSiteVisits] = useState([]);
  const [siteVisitsTab, setSiteVisitsTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm, setPropertyForm] = useState({
    name: "",
    address: "",
    city: "",
    neighborhood: "",
    has_parking: false,
    has_security: false,
    has_borehole: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Property Interests state
  const [interests, setInterests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [interestsSearchTerm, setInterestsSearchTerm] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);
  const [editingMessage, setEditingMessage] = useState(false);

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

  // Activity state
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activityTab, setActivityTab] = useState("all");

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchReports();
    } else if (activeTab === "properties") {
      fetchProperties();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "site-visits") {
      fetchSiteVisits();
    } else if (activeTab === "property-interests") {
      fetchInterests();
    } else if (activeTab === "communications") {
      loadSettings();
      checkBridgeStatus();
    } else if (activeTab === "message-templates") {
      fetchTemplates();
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

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch (error) {
      toast.error("Failed to load properties");
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

  const fetchSiteVisits = async () => {
    try {
      const [allRes, guestRes, userRes] = await Promise.all([
        api.get("/admin/site-visits"),
        api.get("/admin/site-visits/guests"),
        api.get("/admin/site-visits/users"),
      ]);
      setSiteVisits(allRes.data);
      setGuestSiteVisits(guestRes.data);
      setUserSiteVisits(userRes.data);
    } catch (error) {
      console.error("Failed to load site visits:", error);
      toast.error("Failed to load site visits");
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

  const isInterestActive = (interest) => {
    if (!interest || !interest.valid_until) return false;
    const validUntil = new Date(interest.valid_until);
    const now = new Date();
    return validUntil > now;
  };

  const getTimeframeText = (months) => {
    if (months === 1) return "1 month";
    if (months === 3) return "3 months";
    if (months === 6) return "6 months";
    if (months === 12) return "12 months";
    return `${months} months`;
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

  const sendInterestNotification = async () => {
    if (!selectedInterest || !notificationMessage.trim()) {
      toast.error("Please enter a notification message");
      return;
    }

    setSendingNotification(true);
    try {
      // Use the custom notification endpoint with vacancy_alert_id for logging
      await api.post("/notifications/send-custom", {
        phone: selectedInterest.contact_phone,
        message: notificationMessage,
        vacancy_alert_id: selectedInterest.id,
      });

      // Refresh the interests to show updated notification history
      await fetchInterests();

      toast.success("Notification sent successfully!");
      setShowNotificationModal(false);
      setSelectedInterest(null);
      setNotificationMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
      setShowNotificationModal(false);
      setSelectedInterest(null);
      setNotificationMessage("");
    } finally {
      setSendingNotification(false);
    }
  };

  const filteredInterests = (interests || []).filter((interest) => {
    if (!interest) return false;

    // User type filter
    if (filter === "signed_in" && interest.user_id === null) return false;
    if (filter === "guests" && interest.guest_id === null) return false;

    // Property filter
    if (propertyFilter !== "all" && interest.property_name !== propertyFilter)
      return false;

    // Unit filter
    if (unitFilter !== "all" && interest.unit_type_name !== unitFilter)
      return false;

    // Search filter
    if (interestsSearchTerm.trim()) {
      const searchLower = interestsSearchTerm.toLowerCase();
      const matchesName = interest.contact_name
        ?.toLowerCase()
        .includes(searchLower);
      const matchesEmail = interest.contact_email
        ?.toLowerCase()
        .includes(searchLower);
      const matchesPhone = interest.contact_phone
        ?.toLowerCase()
        .includes(searchLower);
      const matchesProperty = interest.property_name
        ?.toLowerCase()
        .includes(searchLower);
      const matchesUnit = interest.unit_type_name
        ?.toLowerCase()
        .includes(searchLower);

      if (
        !matchesName &&
        !matchesEmail &&
        !matchesPhone &&
        !matchesProperty &&
        !matchesUnit
      ) {
        return false;
      }
    }

    return true;
  });

  // Get unique properties and units for filter options
  const uniqueProperties =
    interests && interests.length > 0
      ? [
          ...new Set(
            interests
              .map((i) => i?.property_name)
              .filter((name) => name != null && name !== "")
          ),
        ].sort()
      : [];
  const uniqueUnits =
    interests && interests.length > 0
      ? [
          ...new Set(
            interests
              .map((i) => i?.unit_type_name)
              .filter((name) => name != null && name !== "")
          ),
        ].sort()
      : [];
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

  // Activity functions
  const fetchActivities = async () => {
    try {
      // Fetch real data from multiple endpoints
      const [siteVisitsRes, interestsRes] = await Promise.all([
        api.get("/admin/site-visits"),
        api.get("/admin/property-interests"),
      ]);

      const siteVisits = siteVisitsRes.data || [];
      const interests = interestsRes.data || [];

      // Combine and transform into activity format
      const activitiesData = [
        // Site visits
        ...siteVisits.map((visit) => ({
          id: `visit-${visit.id}`,
          type: "site_visit",
          title: "Site Visit Request",
          description: `${visit.contact_name} requested a site visit for ${visit.property_name}`,
          user_name: visit.contact_name,
          user_email: visit.contact_email,
          user_phone: visit.contact_phone,
          property_name: visit.property_name,
          status: visit.status,
          created_at: new Date(visit.created_at || visit.appointment_date),
          priority: visit.status === "pending" ? "high" : "medium",
          details: {
            visit_date: visit.appointment_date
              ? new Date(visit.appointment_date).toLocaleDateString()
              : null,
            unit_type: visit.unit_type_name,
            special_requests: visit.admin_notes,
          },
        })),
        // Property interests
        ...interests.map((interest) => ({
          id: `interest-${interest.id}`,
          type: "property_interest",
          title: "Property Interest",
          description: `${interest.contact_name} expressed interest in ${interest.property_name}`,
          user_name: interest.contact_name,
          user_email: interest.contact_email,
          user_phone: interest.contact_phone,
          property_name: interest.property_name,
          status: "active",
          created_at: new Date(interest.created_at),
          priority: "medium",
          details: {
            timeframe_months: interest.timeframe_months,
            unit_type: interest.unit_type_name,
            special_requests: interest.special_requests,
          },
        })),
      ];

      // Sort by created date (most recent first)
      activitiesData.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setActivities(activitiesData);
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

  const deleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;
    try {
      await api.delete(`/properties/${propertyId}`);
      setProperties(properties.filter((p) => p.id !== propertyId));
      toast.success("Property deleted");
    } catch (error) {
      toast.error("Failed to delete property");
    }
  };

  const updateProperty = async (propertyId, updates) => {
    try {
      await api.put(`/properties/${propertyId}`, updates);
      setProperties(
        properties.map((p) => (p.id === propertyId ? { ...p, ...updates } : p))
      );
      toast.success("Property updated");
    } catch (error) {
      toast.error("Failed to update property");
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

  const approveSiteVisit = async (visitId) => {
    if (!window.confirm("Are you sure you want to approve this site visit?")) {
      return;
    }
    try {
      await api.put(`/admin/site-visits/${visitId}/approve`);
      setSiteVisits(
        siteVisits.map((v) =>
          v.id === visitId ? { ...v, status: "confirmed" } : v
        )
      );
      toast.success("Site visit approved successfully");
    } catch (error) {
      toast.error("Failed to approve site visit");
    }
  };

  const declineSiteVisit = async (visitId) => {
    const reason = prompt("Reason for declining (optional):");
    try {
      await api.put(`/admin/site-visits/${visitId}/decline`, { reason });
      setSiteVisits(
        siteVisits.map((v) =>
          v.id === visitId ? { ...v, status: "cancelled" } : v
        )
      );
      toast.success("Site visit declined");
    } catch (error) {
      toast.error("Failed to decline site visit");
    }
  };

  const deleteSiteVisit = async (visitId) => {
    if (!window.confirm("Are you sure you want to delete this site visit?")) {
      return;
    }
    try {
      await api.delete(`/admin/site-visits/${visitId}`);
      setSiteVisits(siteVisits.filter((v) => v.id !== visitId));
      toast.success("Site visit deleted");
    } catch (error) {
      toast.error("Failed to delete site visit");
    }
  };

  const openAddPropertyModal = () => {
    setEditingProperty(null);
    setPropertyForm({
      name: "",
      address: "",
      city: "",
      neighborhood: "",
      has_parking: false,
      has_security: false,
      has_borehole: false,
    });
    setShowPropertyModal(true);
  };

  const openEditPropertyModal = (property) => {
    setEditingProperty(property);
    setPropertyForm({
      name: property.name,
      address: property.address,
      city: property.city,
      neighborhood: property.neighborhood,
      has_parking: property.has_parking,
      has_security: property.has_security,
      has_borehole: property.has_borehole,
    });
    setShowPropertyModal(true);
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

  const saveProperty = async () => {
    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, propertyForm);
      } else {
        await api.post("/properties", propertyForm);
        fetchProperties(); // Refresh list
        toast.success("Property added");
      }
      setShowPropertyModal(false);
    } catch (error) {
      toast.error("Failed to save property");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "properties", label: "Properties", icon: Building },
    { id: "users", label: "Users", icon: Users },
    { id: "site-visits", label: "Site Visits", icon: Calendar },
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
                    <div className="stat-icon properties">
                      <Building size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {reports.stats.properties}
                      </div>
                      <div className="stat-label">Total Properties</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon bookings">
                      <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{reports.stats.bookings}</div>
                      <div className="stat-label">Total Site Visits</div>
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
                    <div className="stat-icon interests">
                      <Heart size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">
                        {reports.stats.interests_this_month || 0}
                      </div>
                      <div className="stat-label">
                        Property Interests (This Month)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="loading">Loading reports...</div>
              )}
            </div>
          )}

          {activeTab === "properties" && (
            <div className="properties-section">
              <div className="section-header">
                <h2>Manage Properties</h2>
                <button className="btn-add" onClick={openAddPropertyModal}>
                  <Plus size={16} />
                  Add Property
                </button>
              </div>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Units</th>
                      <th>Features</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr
                        key={property.id}
                        onClick={() =>
                          navigate(`/admin/properties/${property.id}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>{property.name}</td>
                        <td>
                          {property.city}, {property.neighborhood}
                        </td>
                        <td>{property.unit_types?.length || 0} units</td>
                        <td>
                          {property.has_parking && "Parking "}
                          {property.has_security && "Security "}
                          {property.has_borehole && "Borehole"}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditPropertyModal(property);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProperty(property.id);
                            }}
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

          {activeTab === "site-visits" && (
            <div className="site-visits-section">
              <div className="section-header">
                <h2>Manage Site Visits</h2>
              </div>

              {/* Sub-tabs for site visits */}
              <div className="site-visits-tabs">
                <button
                  className={`site-visits-tab ${
                    siteVisitsTab === "all" ? "active" : ""
                  }`}
                  onClick={() => setSiteVisitsTab("all")}
                >
                  All Visits ({siteVisits.length})
                </button>
                <button
                  className={`site-visits-tab ${
                    siteVisitsTab === "guests" ? "active" : ""
                  }`}
                  onClick={() => setSiteVisitsTab("guests")}
                >
                  Guest Visits ({guestSiteVisits.length})
                </button>
                <button
                  className={`site-visits-tab ${
                    siteVisitsTab === "users" ? "active" : ""
                  }`}
                  onClick={() => setSiteVisitsTab("users")}
                >
                  User Visits ({userSiteVisits.length})
                </button>
              </div>

              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Contact</th>
                      <th>Property</th>
                      <th>Unit Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(siteVisitsTab === "all"
                      ? siteVisits
                      : siteVisitsTab === "guests"
                      ? guestSiteVisits
                      : userSiteVisits
                    ).map((visit) => (
                      <tr key={visit.id}>
                        <td>{visit.id}</td>
                        <td>
                          <span
                            className={`user-type-badge ${
                              visit.is_guest ? "guest" : "user"
                            }`}
                          >
                            {visit.is_guest ? "Guest" : "User"}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div className="font-semibold">
                              {visit.contact_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {visit.contact_email}
                            </div>
                            <div className="text-sm text-gray-600">
                              {visit.contact_phone}
                            </div>
                          </div>
                        </td>
                        <td>{visit.property_name}</td>
                        <td>{visit.unit_type_name}</td>
                        <td>
                          {new Date(
                            visit.appointment_date
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={`status-badge ${visit.status}`}>
                            {visit.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {visit.status === "pending" && (
                              <>
                                <button
                                  className="btn-approve"
                                  onClick={() => approveSiteVisit(visit.id)}
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  className="btn-reject"
                                  onClick={() => declineSiteVisit(visit.id)}
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            <button
                              className="btn-delete"
                              onClick={() => deleteSiteVisit(visit.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "property-interests" && (
            <div className="property-interests-page">
              <div className="property-interests-container">
                {/* Header */}
                <div className="property-interests-header">
                  <div className="header-content">
                    <h1 className="page-title">
                      Property Interests Management
                    </h1>
                    <p className="page-subtitle">
                      Track and manage property interest requests with detailed
                      notification history
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

                  <div className="stat-card">
                    <div className="stat-icon expired">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-number">
                        {interests.filter((i) => !isInterestActive(i)).length}
                      </h3>
                      <p className="stat-label">Expired Interests</p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
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

                  {/* Search and Filters */}
                  <div className="search-and-filters">
                    <div className="search-group">
                      <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search by name, email, phone, property, or unit type..."
                          value={interestsSearchTerm}
                          onChange={(e) =>
                            setInterestsSearchTerm(e.target.value)
                          }
                          className="search-input"
                        />
                        {interestsSearchTerm && (
                          <button
                            onClick={() => setInterestsSearchTerm("")}
                            className="clear-search-btn"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="advanced-filters">
                      <div className="filter-group">
                        <label className="filter-label">
                          <Building size={14} />
                          Property
                        </label>
                        <select
                          value={propertyFilter}
                          onChange={(e) => setPropertyFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">All Properties</option>
                          {uniqueProperties.map((property) => (
                            <option key={property} value={property}>
                              {property}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="filter-group">
                        <label className="filter-label">
                          <Home size={14} />
                          Unit Type
                        </label>
                        <select
                          value={unitFilter}
                          onChange={(e) => setUnitFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">All Unit Types</option>
                          {uniqueUnits.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      {(propertyFilter !== "all" ||
                        unitFilter !== "all" ||
                        interestsSearchTerm) && (
                        <button
                          className="clear-filters-btn"
                          onClick={() => {
                            setPropertyFilter("all");
                            setUnitFilter("all");
                            setInterestsSearchTerm("");
                          }}
                        >
                          <X size={14} />
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interests Grid */}
                <div className="interests-grid-container">
                  {filteredInterests.length === 0 ? (
                    <div className="empty-state">
                      <Heart size={64} className="empty-icon" />
                      <h3>No interests found</h3>
                      <p>
                        {filter === "all"
                          ? "No property interests have been recorded yet."
                          : `No ${filter.replace(
                              "_",
                              " "
                            )} interests found matching your criteria.`}
                      </p>
                      {(propertyFilter !== "all" ||
                        unitFilter !== "all" ||
                        interestsSearchTerm) && (
                        <button
                          className="clear-all-filters-btn"
                          onClick={() => {
                            setFilter("all");
                            setPropertyFilter("all");
                            setUnitFilter("all");
                            setInterestsSearchTerm("");
                          }}
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="results-summary">
                        <span className="results-count">
                          Showing {filteredInterests.length} of{" "}
                          {interests.length} interests
                        </span>
                      </div>

                      <div className="interests-grid">
                        {filteredInterests.map((interest) => (
                          <div
                            key={interest.id}
                            className={`interest-card ${
                              !isInterestActive(interest) ? "expired" : "active"
                            }`}
                          >
                            {/* Card Header */}
                            <div className="card-header">
                              <div className="user-type-indicator">
                                {interest.user_id ? (
                                  <div className="user-badge signed-in">
                                    <UserCheck size={16} />
                                    <span>Registered User</span>
                                  </div>
                                ) : (
                                  <div className="user-badge guest">
                                    <Users size={16} />
                                    <span>Guest User</span>
                                  </div>
                                )}
                              </div>
                              <div className="card-actions">
                                {isInterestActive(interest) && (
                                  <button
                                    className="action-btn primary"
                                    onClick={() =>
                                      openNotificationModal(interest)
                                    }
                                    title="Send availability notification"
                                  >
                                    <Bell size={16} />
                                  </button>
                                )}
                                <button
                                  className="action-btn danger"
                                  onClick={() => deleteInterest(interest.id)}
                                  title="Delete interest"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="card-content">
                              <div className="contact-section">
                                <h3 className="contact-name">
                                  {interest.contact_name}
                                </h3>
                                <div className="contact-details">
                                  <div className="contact-item">
                                    <Mail size={14} />
                                    <span>{interest.contact_email}</span>
                                  </div>
                                  <div className="contact-item">
                                    <Phone size={14} />
                                    <span>{interest.contact_phone}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="property-section">
                                <div className="property-header">
                                  <Building size={18} />
                                  <h4>{interest.property_name}</h4>
                                </div>
                                <div className="unit-info">
                                  <Home size={14} />
                                  <span>{interest.unit_type_name}</span>
                                </div>
                              </div>

                              <div className="interest-details">
                                <div className="detail-row">
                                  <Calendar size={14} />
                                  <span>
                                    Expires:{" "}
                                    {interest.valid_until
                                      ? new Date(
                                          interest.valid_until
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="detail-row">
                                  <Clock size={14} />
                                  <span>
                                    Timeframe:{" "}
                                    {getTimeframeText(
                                      interest.timeframe_months
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Notification History */}
                            <div className="notification-section">
                              <div className="notification-header">
                                <MessageSquare size={14} />
                                <span className="notification-count">
                                  {interest.notifications?.length || 0}{" "}
                                  notifications sent
                                </span>
                              </div>
                              {interest.notifications &&
                                interest.notifications.length > 0 && (
                                  <div className="recent-notifications">
                                    {interest.notifications
                                      .slice(0, 2)
                                      .map((notification) => (
                                        <div
                                          key={notification.id}
                                          className="notification-preview"
                                        >
                                          <span
                                            className={`notification-status ${
                                              notification.success
                                                ? "success"
                                                : "failed"
                                            }`}
                                          >
                                            {notification.success ? (
                                              <CheckCircle size={12} />
                                            ) : (
                                              <AlertTriangle size={12} />
                                            )}
                                          </span>
                                          <span className="notification-date">
                                            {new Date(
                                              notification.sent_at
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      ))}
                                    {interest.notifications.length > 2 && (
                                      <span className="more-notifications">
                                        +{interest.notifications.length - 2}{" "}
                                        more
                                      </span>
                                    )}
                                  </div>
                                )}
                            </div>

                            {/* Special Requests */}
                            {interest.special_requests && (
                              <div className="special-requests">
                                <div className="special-header">
                                  <AlertTriangle size={14} />
                                  <span>Special Requests</span>
                                </div>
                                <p>{interest.special_requests}</p>
                              </div>
                            )}

                            {/* Card Footer */}
                            <div className="card-footer">
                              <div className="created-date">
                                <span>
                                  Created{" "}
                                  {new Date(
                                    interest.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div
                                className={`status-badge ${
                                  isInterestActive(interest)
                                    ? "active"
                                    : "expired"
                                }`}
                              >
                                {isInterestActive(interest)
                                  ? "Active"
                                  : "Expired"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
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
                          <label>
                            Recipient: {selectedInterest.contact_name}
                          </label>
                          <p className="text-sm text-gray-600">
                            Phone: {selectedInterest.contact_phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            Property: {selectedInterest.property_name} (
                            {selectedInterest.unit_type_name})
                          </p>
                        </div>

                        <div className="notification-form-group">
                          <div className="message-header">
                            <label htmlFor="notification-message">
                              Notification Message
                            </label>
                            <button
                              type="button"
                              onClick={() => setEditingMessage(!editingMessage)}
                              className="edit-message-btn"
                            >
                              <Edit3 size={14} />
                              {editingMessage ? "Use Template" : "Edit Message"}
                            </button>
                          </div>
                          <textarea
                            id="notification-message"
                            value={notificationMessage}
                            onChange={(e) =>
                              setNotificationMessage(e.target.value)
                            }
                            placeholder="Enter the notification message..."
                            rows="8"
                            readOnly={!editingMessage}
                            className={editingMessage ? "editable" : "readonly"}
                          />
                          {!editingMessage && (
                            <p className="template-note">
                              This is a pre-filled template. Click "Edit
                              Message" to customize.
                            </p>
                          )}
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
                            onClick={sendInterestNotification}
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
          )}

          {activeTab === "message-templates" && (
            <div className="templates-section">
              <div className="admin-container">
                <div className="admin-header">
                  <h1>Message Templates</h1>
                  <p>
                    Customize automated notification messages sent to clients
                  </p>
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
                        value={globalSettings.support_phone || ""}
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
                        value={globalSettings.website_url || ""}
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
                        value={globalSettings.company_name || ""}
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
                        value={globalSettings.support_email || ""}
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
                      onClick={() => handleUpdateGlobalSettings(globalSettings)}
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
                    {Object.entries(templates).map(([key, template]) => (
                      <div key={key} className="template-card">
                        <div className="template-header">
                          <div className="template-icon">
                            {key === "site_visit_request"
                              ? "🏛️"
                              : key === "site_visit_confirmation"
                              ? "✅"
                              : key === "express_interest"
                              ? "💝"
                              : key === "unit_available"
                              ? "🎉"
                              : key === "site_visit_reminder"
                              ? "⏰"
                              : key === "welcome"
                              ? "🎉"
                              : key === "account_verification"
                              ? "🔐"
                              : key === "password_reset"
                              ? "🔑"
                              : "📱"}
                          </div>
                          <div className="template-info">
                            <h3>{key.replace(/_/g, " ").toUpperCase()}</h3>
                            <p>{template.subject}</p>
                          </div>
                          <button
                            onClick={() => handleEditTemplate(key, template)}
                            className="edit-template-btn"
                            disabled={editingTemplate === key}
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
                                  setEditedSubject(e.target.value)
                                }
                                placeholder="Enter subject line"
                              />
                            </div>

                            <div className="editor-field">
                              <label>Message Content</label>
                              <textarea
                                value={editedMessage}
                                onChange={(e) =>
                                  setEditedMessage(e.target.value)
                                }
                                placeholder="Enter message content"
                                rows="12"
                              />
                            </div>

                            <div className="variables-info">
                              <h4>Available Variables:</h4>
                              <div className="variables-list">
                                {template.variables.map((variable) => (
                                  <span key={variable} className="variable-tag">
                                    {`{${variable}}`}
                                  </span>
                                ))}
                              </div>
                              <p className="variables-note">
                                Use curly braces {"{variable}"} to insert
                                dynamic content
                              </p>
                            </div>

                            <div className="editor-actions">
                              <button
                                onClick={() => {
                                  setEditingTemplate(null);
                                  setEditedSubject("");
                                  setEditedMessage("");
                                }}
                                className="cancel-btn"
                                disabled={saving}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveTemplate}
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && <NotificationManager />}

          {activeTab === "activity" && (
            <div className="activity-section">
              <div className="admin-container">
                <div className="admin-header">
                  <h1>Activity Management</h1>
                  <p>
                    Track and manage user activities, approvals, and requests
                  </p>
                </div>

                <div className="activity-filters">
                  <div className="search-bar">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="active">Active</option>
                  </select>
                </div>

                <div className="activity-tabs">
                  <button
                    className={`tab-button ${
                      activityTab === "all" ? "active" : ""
                    }`}
                    onClick={() => setActivityTab("all")}
                  >
                    All Activities ({activities.length})
                  </button>
                  <button
                    className={`tab-button ${
                      activityTab === "site_visit" ? "active" : ""
                    }`}
                    onClick={() => setActivityTab("site_visit")}
                  >
                    Site Visits (
                    {activities.filter((a) => a.type === "site_visit").length})
                  </button>
                  <button
                    className={`tab-button ${
                      activityTab === "property_interest" ? "active" : ""
                    }`}
                    onClick={() => setActivityTab("property_interest")}
                  >
                    Interests (
                    {
                      activities.filter((a) => a.type === "property_interest")
                        .length
                    }
                    )
                  </button>
                  <button
                    className={`tab-button ${
                      activityTab === "booking_approval" ? "active" : ""
                    }`}
                    onClick={() => setActivityTab("booking_approval")}
                  >
                    Approvals (
                    {
                      activities.filter((a) => a.type === "booking_approval")
                        .length
                    }
                    )
                  </button>
                </div>

                <div className="activities-content">
                  {activities.length === 0 ? (
                    <div className="empty-state">
                      <ActivityIcon className="empty-icon" size={64} />
                      <h3 className="empty-title">No activities found</h3>
                      <p className="empty-subtitle">
                        Activities will appear here as users interact with the
                        system
                      </p>
                    </div>
                  ) : (
                    <div className="activities-list">
                      {activities.map((activity) => (
                        <div key={activity.id} className="activity-card">
                          <div className="activity-header">
                            <div className="activity-main">
                              {activity.type === "site_visit" ? (
                                <Calendar
                                  className="activity-icon site-visit"
                                  size={20}
                                />
                              ) : activity.type === "property_interest" ? (
                                <Heart
                                  className="activity-icon interest"
                                  size={20}
                                />
                              ) : activity.type === "booking_approval" ? (
                                <CheckCircle
                                  className="activity-icon approval"
                                  size={20}
                                />
                              ) : activity.type === "booking_rejection" ? (
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
                                    {activity.property_name}
                                  </span>
                                  <span className="timestamp">
                                    {activity.created_at.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="activity-badges">
                              {activity.priority === "high" && (
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
                                <span>{activity.user_email}</span>
                              </div>
                              <div className="detail-item">
                                <Phone size={14} />
                                <span>{activity.user_phone}</span>
                              </div>
                              {activity.details &&
                                Object.entries(activity.details).map(
                                  ([key, value]) => (
                                    <div key={key} className="detail-item">
                                      <span className="detail-label">
                                        {key.replace(/_/g, " ")}:
                                      </span>
                                      <span>{value}</span>
                                    </div>
                                  )
                                )}
                            </div>
                          </div>

                          {activity.status === "pending" && (
                            <div className="activity-actions">
                              <button
                                className="action-button approve"
                                onClick={() =>
                                  handleAction(activity.id, "approve")
                                }
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                              <button
                                className="action-button reject"
                                onClick={() =>
                                  handleAction(activity.id, "reject")
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
                            activities.filter((a) => a.status === "pending")
                              .length
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
                            activities.filter((a) => a.status === "approved")
                              .length
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
                            activities.filter((a) => a.status === "active")
                              .length
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
          )}

          {activeTab === "communications" && (
            <div className="communications-section">
              <div className="admin-container">
                <div className="admin-header">
                  <h1>Communication Settings</h1>
                  <p>
                    Configure WhatsApp and SMS settings for automated
                    notifications and live chat
                  </p>
                </div>

                <div className="communications-grid">
                  <div className="communication-card">
                    <div className="communication-card-header">
                      <div className="communication-card-title">
                        <div
                          className={`status-indicator ${
                            bridgeStatus === "connected"
                              ? "connected"
                              : bridgeStatus === "connecting"
                              ? "connecting"
                              : "disconnected"
                          }`}
                        ></div>
                        <span>WhatsApp Bridge</span>
                      </div>
                      <Phone size={20} />
                    </div>
                    <div className="communication-card-content">
                      <p className="capitalize">{bridgeStatus}</p>
                      <a
                        href="#"
                        onClick={checkBridgeStatus}
                        className="refresh-btn"
                      >
                        <RefreshCw size={14} />
                        Refresh Status
                      </a>
                    </div>
                  </div>

                  <div className="communication-card">
                    <div className="communication-card-header">
                      <div className="communication-card-title">
                        <div className="status-indicator connected"></div>
                        <span>SMS Gateway</span>
                      </div>
                      <MessageSquare size={20} />
                    </div>
                    <div className="communication-card-content">
                      <p>
                        {settings.sms_api_key ? "Configured" : "Not configured"}
                      </p>
                    </div>
                  </div>

                  <div className="communication-card">
                    <div className="communication-card-header">
                      <div className="communication-card-title">
                        <div className="status-indicator connected"></div>
                        <span>Live Chat</span>
                      </div>
                      <Settings size={20} />
                    </div>
                    <div className="communication-card-content">
                      <p>Widget active</p>
                    </div>
                  </div>
                </div>

                <div className="settings-form">
                  <h2>
                    <Phone size={24} />
                    WhatsApp Settings
                  </h2>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Admin WhatsApp Number</label>
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
                      />
                      <p>Number that receives website chat messages</p>
                    </div>

                    <div className="form-field">
                      <label>Bridge URL</label>
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
                      />
                    </div>
                  </div>

                  <div className="connection-setup">
                    <h3>WhatsApp Connection</h3>
                    <p>Click to generate QR code for WhatsApp Web connection</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={connectWhatsApp}
                        disabled={testingConnection}
                        className="connect-btn"
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
                    </div>
                  </div>
                </div>

                <div className="settings-form">
                  <h2>
                    <MessageSquare size={24} />
                    SMS Settings (httpSMS)
                  </h2>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>httpSMS API Key</label>
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
                      />
                      <p>From httpSMS Android app</p>
                    </div>

                    <div className="form-field">
                      <label>Sender Phone Number</label>
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
                      />
                      <p>Your phone number for sending SMS</p>
                    </div>
                  </div>
                </div>

                <div className="settings-form">
                  <h2>Testing</h2>

                  <div className="form-grid">
                    <div className="form-field">
                      <label>Test Phone Number</label>
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
                      />
                    </div>

                    <div className="form-field">
                      <button
                        onClick={testConnection}
                        disabled={testingConnection || !settings.test_phone}
                        className="test-btn btn-full"
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
                  <button onClick={saveSettings} className="save-btn">
                    <Save size={16} />
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Modal */}
      {showPropertyModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPropertyModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProperty ? "Edit Property" : "Add New Property"}</h3>
              <button
                className="modal-close"
                onClick={() => setShowPropertyModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProperty();
                }}
              >
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={propertyForm.name}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={propertyForm.address}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        address: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={propertyForm.city}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Neighborhood</label>
                  <input
                    type="text"
                    value={propertyForm.neighborhood}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        neighborhood: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Features</label>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={propertyForm.has_parking}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            has_parking: e.target.checked,
                          })
                        }
                      />
                      Parking
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={propertyForm.has_security}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            has_security: e.target.checked,
                          })
                        }
                      />
                      Security
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={propertyForm.has_borehole}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            has_borehole: e.target.checked,
                          })
                        }
                      />
                      Borehole
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowPropertyModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit">
                    {editingProperty ? "Update" : "Add"} Property
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
