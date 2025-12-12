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
} from "lucide-react";
import "./PropertyInterests.css";

const PropertyInterests = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, signed_in, guests

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

        {/* Interests List */}
        <div className="interests-list">
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
            <div className="interests-grid">
              {filteredInterests.map((interest) => (
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
                      <p className="unit-type">{interest.unit_type_name}</p>

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
                            Notify within:{" "}
                            {getTimeframeText(interest.timeframe_months)}
                          </span>
                        </div>
                        {interest.guest_id && (
                          <div className="detail-item">
                            <Eye size={16} />
                            <span>Guest ID: {interest.guest_id}</span>
                          </div>
                        )}
                      </div>

                      {interest.special_requests && (
                        <div className="special-requests">
                          <MessageSquare size={16} />
                          <p>{interest.special_requests}</p>
                        </div>
                      )}
                    </div>

                    <div className="interest-footer">
                      <span className="created-date">
                        Created:{" "}
                        {new Date(interest.created_at).toLocaleDateString()}
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
  );
};

export default PropertyInterests;
