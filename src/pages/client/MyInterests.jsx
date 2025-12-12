import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Heart,
  Calendar,
  MapPin,
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const MyInterests = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await api.get("/user/interests");
        setInterests(response.data);
      } catch (error) {
        console.error("Error fetching interests:", error);
        setInterests([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedProperties = async () => {
      try {
        const response = await api.get("/properties/saved");
        setSavedProperties(response.data);
      } catch (error) {
        console.error("Error fetching saved properties:", error);
        setSavedProperties([]);
      }
    };

    if (user) {
      fetchInterests();
      fetchSavedProperties();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="interest-status active">
          <CheckCircle size={14} /> Active
        </span>
      );
    }
    return (
      <span className="interest-status inactive">
        <AlertCircle size={14} /> Expired
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleRemoveInterest = async (interestId) => {
    if (window.confirm("Are you sure you want to remove this interest?")) {
      try {
        await api.delete(`/user/interests/${interestId}`);
        // Refresh the interests data
        const response = await api.get("/user/interests");
        setInterests(response.data);
      } catch (error) {
        console.error("Error removing interest:", error);
        alert("Failed to remove interest. Please try again.");
      }
    }
  };

  const handleRemoveSavedProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to remove this property from saved?")) {
      try {
        await api.delete(`/properties/${propertyId}/save`);
        // Refresh the data
        const response = await api.get("/properties/saved");
        setSavedProperties(response.data);
      } catch (error) {
        console.error("Error removing saved property:", error);
        alert("Failed to remove property from saved. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="my-interests-page">
        <div className="my-interests-container">
          <div className="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p>Loading your interests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-interests-page">
      <div className="my-interests-container">
        {/* Header */}
        <div className="my-interests-header">
          <div className="header-content">
            <div className="header-text">
              <Heart className="header-icon" size={32} />
              <h1 className="page-title">My Property Interests</h1>
              <p className="page-subtitle">
                Track properties you're interested in and have saved ({interests.length + savedProperties.length})
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {(interests.length === 0 && savedProperties.length === 0) ? (
          <div className="empty-state">
            <Heart className="empty-icon" size={64} />
            <h3 className="empty-title">No property interests yet</h3>
            <p className="empty-subtitle">
              When you express interest in properties or save them, they'll appear here for
              easy tracking
            </p>
          </div>
        ) : (
          <div className="interests-grid">
            {/* Express Interests */}
            {interests.map((interest) => (
              <div key={`interest-${interest.id}`} className="interest-card">
                {/* Property Info */}
                <div className="interest-header">
                  <div className="interest-property-info">
                    <h3 className="interest-property-name">
                      {interest.property_name}
                    </h3>
                    <p className="interest-unit-type">
                      {interest.unit_type_name}
                    </p>
                    <div className="interest-location">
                      <MapPin size={16} />
                      <span>{interest.contact_email}</span>
                    </div>
                  </div>
                  <div className="interest-status-section">
                    {getStatusBadge(interest.is_active)}
                    <span className="interest-type">Express Interest</span>
                  </div>
                </div>

                {/* Interest Details */}
                <div className="interest-details">
                  <div className="interest-meta">
                    <div className="interest-meta-item">
                      <Calendar size={16} />
                      <span>
                        Valid for: {interest.timeframe_months} month{interest.timeframe_months > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {interest.special_requests && (
                    <div className="interest-requests">
                      <p className="requests-label">Special Requests:</p>
                      <p className="requests-text">{interest.special_requests}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="interest-actions">
                  <button
                    className="interest-action-btn primary"
                    onClick={() => handleViewProperty(interest.property_id)}
                  >
                    <ExternalLink size={16} />
                    View Property
                  </button>
                  <button
                    className="interest-action-btn secondary"
                    onClick={() => handleRemoveInterest(interest.id)}
                  >
                    <Trash2 size={16} />
                    Remove Interest
                  </button>
                </div>
              </div>
            ))}

            {/* Saved Properties */}
            {savedProperties.map((property) => (
              <div key={`saved-${property.id}`} className="interest-card">
                {/* Property Info */}
                <div className="interest-header">
                  <div className="interest-property-info">
                    <h3 className="interest-property-name">
                      {property.name}
                    </h3>
                    <p className="interest-unit-type">
                      Property in {property.neighborhood || property.city}
                    </p>
                    <div className="interest-location">
                      <MapPin size={16} />
                      <span>{property.address}, {property.city}</span>
                    </div>
                  </div>
                  <div className="interest-status-section">
                    <span className="interest-status active">
                      <CheckCircle size={14} /> Saved
                    </span>
                    <span className="interest-type">Saved Property</span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="interest-details">
                  <div className="interest-meta">
                    <div className="interest-meta-item">
                      <Calendar size={16} />
                      <span>
                        Property saved to your favorites
                      </span>
                    </div>
                  </div>

                  <div className="interest-features">
                    <div className="feature-list">
                      {property.has_parking && <span className="feature-tag">Parking</span>}
                      {property.has_security && <span className="feature-tag">Security</span>}
                      {property.has_borehole && <span className="feature-tag">Borehole</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="interest-actions">
                  <button
                    className="interest-action-btn primary"
                    onClick={() => handleViewProperty(property.id)}
                  >
                    <ExternalLink size={16} />
                    View Property
                  </button>
                  <button
                    className="interest-action-btn secondary"
                    onClick={() => handleRemoveSavedProperty(property.id)}
                  >
                    <Trash2 size={16} />
                    Remove from Saved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {interests.length > 0 && (
          <div className="page-footer">
            <p>
              We'll notify you when units become available for your interested
              properties!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInterests;