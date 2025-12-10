import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { ArrowLeft, User, Mail, Phone, MapPin, Save, X } from "lucide-react";
import "./ProfileEdit.css";

const ProfileEdit = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        // Add cache control headers for better performance
        const response = await api.get("/users/me", {
          headers: {
            "Cache-Control": "max-age=300", // Cache for 5 minutes
          },
        });
        setProfileData({
          username: response.data.username || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          location: response.data.location || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // No toast notification for loading errors
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!profileData.username.trim() || !profileData.email.trim()) {
      // No toast notification for validation errors
      return;
    }

    setSaving(true);
    try {
      await api.put("/users/profile", profileData);
      // Profile updated successfully - no notification needed
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      // No toast notification for update errors
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="profile-edit-page">
      <div className="profile-edit-container">
        {/* Header */}
        <div className="profile-edit-header">
          <button
            onClick={() => navigate(-1)}
            className="profile-edit-back-btn"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="profile-edit-title">Edit Profile</h1>
          <div></div> {/* Spacer */}
        </div>

        {/* Profile Form */}
        <div className="profile-edit-content">
          <div className="profile-edit-card">
            <div className="profile-edit-avatar-section">
              <div className="profile-edit-avatar">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="profile-edit-avatar-info">
                <h2 className="profile-edit-name">{user?.username}</h2>
                <p className="profile-edit-role">{user?.role || "Client"}</p>
              </div>
            </div>

            <div className="profile-edit-form">
              <div className="profile-edit-field">
                <label className="profile-edit-label">
                  <User size={18} />
                  Username *
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="profile-edit-input"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="profile-edit-field">
                <label className="profile-edit-label">
                  <Mail size={18} />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="profile-edit-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="profile-edit-field">
                <label className="profile-edit-label">
                  <Phone size={18} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="profile-edit-input"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="profile-edit-field">
                <label className="profile-edit-label">
                  <MapPin size={18} />
                  Location
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="profile-edit-input"
                  placeholder="Enter your location"
                />
              </div>
            </div>

            <div className="profile-edit-actions">
              <button
                onClick={handleCancel}
                className="profile-edit-cancel-btn"
                disabled={saving}
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="profile-edit-save-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
