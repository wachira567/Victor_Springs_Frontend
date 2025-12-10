import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, MapPin, Users, ExternalLink, Trash2 } from "lucide-react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./SavedVenues.css";

const SavedVenues = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const fetchSavedVenues = async () => {
    try {
      const response = await api.get("/properties/saved");
      setSavedProperties(response.data || []);
    } catch (error) {
      console.error("Error fetching saved properties:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        navigate("/login");
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to load saved properties");
      }
      setSavedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedVenues();
    }
  }, [user]);

  const handleUnsave = async (propertyId) => {
    try {
      await api.delete(`/properties/${propertyId}/save`);
      setSavedProperties((prev) =>
        prev.filter((property) => property.id !== propertyId)
      );
      toast.success("Property removed from saved list");
    } catch (error) {
      console.error("Error unsaving property:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        navigate("/login");
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to remove property from saved list");
      }
    }
  };

  if (loading) {
    return (
      <div className="saved-venues-page">
        <div className="saved-venues-container">
          <div className="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p>Loading your saved properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-venues-page">
      <div className="saved-venues-container">
        {/* Header */}
        <div className="saved-venues-header">
          <div className="header-content">
            <div className="header-text">
              <Heart className="header-icon" size={32} />
              <h1 className="page-title">Saved Properties</h1>
              <p className="page-subtitle">
                Your favorite properties for future rentals (
                {savedProperties.length})
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {savedVenues.length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-icon" size={64} />
            <h3 className="empty-title">No saved properties yet</h3>
            <p className="empty-subtitle">
              Start exploring and save properties you love for your future
              rentals
            </p>
            <Link to="/properties" className="browse-button">
              <ExternalLink size={18} />
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="venues-grid">
            {savedProperties.map((property) => (
              <div key={property.id} className="venue-card">
                {/* Property Image */}
                <div className="venue-image-container">
                  <img
                    src={
                      property.image_url ||
                      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2098&auto=format&fit=crop"
                    }
                    alt={property.name}
                    className="venue-image"
                  />
                  <div className="venue-overlay">
                    <button
                      onClick={() => handleUnsave(property.id)}
                      className="unsave-button"
                      title="Remove from saved"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="venue-category">{property.category}</div>
                </div>

                {/* Property Details */}
                <div className="venue-content">
                  <div className="venue-header">
                    <h3 className="venue-name">{property.name}</h3>
                    <span className="venue-price">
                      KES {property.price_per_month.toLocaleString()}
                    </span>
                  </div>

                  <div className="venue-info">
                    <div className="venue-location">
                      <MapPin size={16} />
                      <span>{property.location}</span>
                    </div>
                    <div className="venue-capacity">
                      <Users size={16} />
                      <span>{property.capacity} tenants</span>
                    </div>
                  </div>

                  <Link
                    to={`/properties/${property.id}`}
                    className="view-details-button"
                  >
                    <ExternalLink size={16} />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {savedProperties.length > 0 && (
          <div className="page-footer">
            <p>
              Keep exploring to find more amazing properties for your rentals!
            </p>
            <Link to="/properties" className="explore-more-button">
              Explore More Properties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedVenues;
