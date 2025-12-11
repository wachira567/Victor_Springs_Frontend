import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  Activity as ActivityIcon,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  Filter,
  Search,
  Eye,
  User,
  MapPin,
  Building,
} from "lucide-react";
import "./Activity.css";

const Activity = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/login");
      return;
    }

    const fetchActivities = async () => {
      try {
        // This would be real API endpoints in production
        // For now, we'll show mock data
        const mockActivities = [
          {
            id: 1,
            type: "site_visit",
            title: "Site Visit Request",
            description:
              "John Doe requested a site visit for Nairobi Arboretum",
            user_name: "John Doe",
            user_email: "john@example.com",
            user_phone: "+254700000000",
            property_name: "Nairobi Arboretum",
            status: "pending",
            created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
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
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            priority: "medium",
            details: {
              timeframe_months: 3,
              special_requests: "Prefer ground floor units",
            },
          },
          {
            id: 3,
            type: "booking_approval",
            title: "Booking Approved",
            description: "Michael Brown's rental application was approved",
            user_name: "Michael Brown",
            user_email: "michael@example.com",
            user_phone: "+254722222222",
            property_name: "Karen Villas",
            status: "approved",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            priority: "high",
            details: {
              unit_type: "3 Bedroom Apartment",
              monthly_rent: 45000,
              lease_term: "12 months",
            },
          },
          {
            id: 4,
            type: "booking_rejection",
            title: "Booking Rejected",
            description:
              "Emma Wilson's application was rejected due to incomplete documents",
            user_name: "Emma Wilson",
            user_email: "emma@example.com",
            user_phone: "+254733333333",
            property_name: "Kilimani Gardens",
            status: "rejected",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            priority: "low",
            details: {
              reason: "Missing ID document",
              unit_type: "1 Bedroom Apartment",
            },
          },
        ];
        setActivities(mockActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("Failed to load activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, navigate]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "site_visit":
        return <Calendar className="activity-icon site-visit" size={20} />;
      case "property_interest":
        return <Heart className="activity-icon interest" size={20} />;
      case "booking_approval":
        return <CheckCircle className="activity-icon approval" size={20} />;
      case "booking_rejection":
        return <XCircle className="activity-icon rejection" size={20} />;
      default:
        return <ActivityIcon className="activity-icon" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="status-badge approved">Approved</span>;
      case "rejected":
        return <span className="status-badge rejected">Rejected</span>;
      case "pending":
        return <span className="status-badge pending">Pending</span>;
      case "active":
        return <span className="status-badge active">Active</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <span className="priority-badge high">High</span>;
      case "medium":
        return <span className="priority-badge medium">Medium</span>;
      case "low":
        return <span className="priority-badge low">Low</span>;
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

  const filteredActivities = activities.filter((activity) => {
    const matchesTab = activeTab === "all" || activity.type === activeTab;
    const matchesSearch =
      activity.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;

    return matchesTab && matchesSearch && matchesStatus;
  });

  const handleAction = async (activityId, action) => {
    try {
      // This would call real API endpoints in production
      console.log(`Performing ${action} on activity ${activityId}`);

      // Update local state for demo
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

  if (loading) {
    return (
      <div className="activity-page">
        <div className="activity-container">
          <div className="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p>Loading activities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-page">
      <div className="activity-container">
        {/* Header */}
        <div className="activity-header">
          <div className="header-content">
            <ActivityIcon className="header-icon" size={32} />
            <div>
              <h1 className="page-title">Activity Management</h1>
              <p className="page-subtitle">
                Track and manage user activities, approvals, and requests
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
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

        {/* Tabs */}
        <div className="activity-tabs">
          <button
            className={`tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Activities ({activities.length})
          </button>
          <button
            className={`tab-button ${
              activeTab === "site_visit" ? "active" : ""
            }`}
            onClick={() => setActiveTab("site_visit")}
          >
            Site Visits (
            {activities.filter((a) => a.type === "site_visit").length})
          </button>
          <button
            className={`tab-button ${
              activeTab === "property_interest" ? "active" : ""
            }`}
            onClick={() => setActiveTab("property_interest")}
          >
            Interests (
            {activities.filter((a) => a.type === "property_interest").length})
          </button>
          <button
            className={`tab-button ${
              activeTab === "booking_approval" ? "active" : ""
            }`}
            onClick={() => setActiveTab("booking_approval")}
          >
            Approvals (
            {activities.filter((a) => a.type === "booking_approval").length})
          </button>
        </div>

        {/* Activities List */}
        <div className="activities-content">
          {filteredActivities.length === 0 ? (
            <div className="empty-state">
              <ActivityIcon className="empty-icon" size={64} />
              <h3 className="empty-title">No activities found</h3>
              <p className="empty-subtitle">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Activities will appear here as users interact with the system"}
              </p>
            </div>
          ) : (
            <div className="activities-list">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="activity-card">
                  <div className="activity-header">
                    <div className="activity-main">
                      {getActivityIcon(activity.type)}
                      <div className="activity-info">
                        <h4 className="activity-title">{activity.title}</h4>
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
                            {formatTimestamp(activity.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="activity-badges">
                      {getPriorityBadge(activity.priority)}
                      {getStatusBadge(activity.status)}
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
                        Object.entries(activity.details).map(([key, value]) => (
                          <div key={key} className="detail-item">
                            <span className="detail-label">
                              {key.replace(/_/g, " ")}:
                            </span>
                            <span>{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {activity.status === "pending" && (
                    <div className="activity-actions">
                      <button
                        className="action-button approve"
                        onClick={() => handleAction(activity.id, "approve")}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        className="action-button reject"
                        onClick={() => handleAction(activity.id, "reject")}
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

        {/* Summary Stats */}
        <div className="activity-summary">
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon pending">
                <Clock size={24} />
              </div>
              <div className="summary-info">
                <h4>
                  {activities.filter((a) => a.status === "pending").length}
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
                  {activities.filter((a) => a.status === "approved").length}
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
                  {activities.filter((a) => a.status === "active").length}
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
  );
};

export default Activity;
