import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  User,
  Settings,
  Bell,
  Shield,
  Trash2,
  Camera,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import "./AccountSettings.css";

const AccountSettings = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Add cache control headers for better performance
        const res = await api.get("/users/me", {
          headers: {
            "Cache-Control": "max-age=300", // Cache for 5 minutes
          },
        });
        setProfileData({
          username: res.data.username,
          email: res.data.email,
          phone: res.data.phone || "",
          location: res.data.location || "",
          bio: profileData.bio,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        // No toast notification for loading errors
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await api.put("/users/profile", profileData);
      // Profile updated successfully - no notification needed
      setIsEditing(false);
    } catch (error) {
      // No toast notification for update errors
    }
  };

  if (loading) {
    return (
      <div className="account-loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="account-settings-page">
      <div className="account-settings-container">
        <div className="account-settings-header">
          <h1 className="account-settings-title">
            <Settings className="text-indigo-600" size={32} />
            Account Settings
          </h1>
          <p className="account-settings-subtitle">
            Manage your account preferences and profile
          </p>
        </div>

        {/* Profile Section */}
        <div className="account-profile-section">
          <div className="account-profile-avatar-section">
            <div className="account-profile-avatar">
              <User className="text-indigo-600" size={32} />
            </div>
            <div className="account-profile-info">
              <h2>{profileData.username}</h2>
              <p>{profileData.email}</p>
              <p className="account-profile-role">Joined December 2024</p>
            </div>
            <button className="account-profile-change-photo">
              <Camera size={16} />
              Change Photo
            </button>
          </div>

          <div className="account-personal-info">
            <div className="account-personal-header">
              <h3 className="account-personal-title">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="account-edit-profile-btn"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="account-save-actions">
                  <button
                    onClick={handleSaveProfile}
                    className="account-save-btn"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="account-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="account-form-grid">
              <div className="account-form-field">
                <label className="account-form-label">Username *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    className="account-form-input"
                  />
                ) : (
                  <div className="account-form-display">
                    {profileData.username}
                  </div>
                )}
              </div>

              <div className="account-form-field">
                <label className="account-form-label">
                  <Mail size={18} />
                  Email Address *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="account-form-input"
                  />
                ) : (
                  <div className="account-form-display">
                    <Mail size={16} className="text-gray-400" />
                    {profileData.email}
                  </div>
                )}
              </div>

              <div className="account-form-field">
                <label className="account-form-label">
                  <Phone size={18} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="account-form-input"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div
                    className={`account-form-display ${
                      !profileData.phone ? "empty" : ""
                    }`}
                  >
                    <Phone size={16} className="text-gray-400" />
                    {profileData.phone || "Not set"}
                  </div>
                )}
              </div>

              <div className="account-form-field">
                <label className="account-form-label">
                  <MapPin size={18} />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: e.target.value,
                      })
                    }
                    className="account-form-input"
                    placeholder="Enter location"
                  />
                ) : (
                  <div
                    className={`account-form-display ${
                      !profileData.location ? "empty" : ""
                    }`}
                  >
                    <MapPin size={16} className="text-gray-400" />
                    {profileData.location || "Not set"}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="account-bio-section">
                <label className="account-form-label">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  className="account-bio-textarea"
                  placeholder="Tell us about yourself..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="account-preferences-section">
          <div className="account-preferences-header">
            <Bell className="text-indigo-600" size={24} />
            <h3 className="account-preferences-title">
              Notification Preferences
            </h3>
          </div>

          <div className="account-preferences-list">
            <div className="account-preference-item">
              <div className="account-preference-info">
                <h4>Email Notifications</h4>
                <p>Receive booking updates and reminders via email</p>
              </div>
              <label className="account-toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="account-toggle-slider"></span>
              </label>
            </div>

            <div className="account-preference-item">
              <div className="account-preference-info">
                <h4>SMS Notifications</h4>
                <p>Receive booking confirmations via SMS</p>
              </div>
              <label className="account-toggle-switch">
                <input type="checkbox" />
                <span className="account-toggle-slider"></span>
              </label>
            </div>

            <div className="account-preference-item">
              <div className="account-preference-info">
                <h4>Marketing Emails</h4>
                <p>Receive updates about new properties and special offers</p>
              </div>
              <label className="account-toggle-switch">
                <input type="checkbox" />
                <span className="account-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="account-security-section">
          <div className="account-security-header">
            <Shield className="text-indigo-600" size={24} />
            <h3 className="account-security-title">Security & Privacy</h3>
          </div>

          <div className="account-security-list">
            <button className="account-security-item">
              <div className="account-security-item-content">
                <div className="account-security-item-info">
                  <h4>Change Password</h4>
                  <p>Update your account password</p>
                </div>
                <span className="account-security-arrow">→</span>
              </div>
            </button>

            <button className="account-security-item">
              <div className="account-security-item-content">
                <div className="account-security-item-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security</p>
                </div>
                <span className="account-security-arrow">→</span>
              </div>
            </button>

            <button className="account-security-item">
              <div className="account-security-item-content">
                <div className="account-security-item-info">
                  <h4>Login History</h4>
                  <p>View recent account activity</p>
                </div>
                <span className="account-security-arrow">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="account-danger-section">
          <div className="account-danger-header">
            <Trash2 className="text-red-600" size={24} />
            <h3 className="account-danger-title">Danger Zone</h3>
          </div>

          <div className="account-danger-zone">
            <h4 className="account-danger-title-small">Delete Account</h4>
            <p className="account-danger-text">
              Once you delete your account, there is no going back. This will
              permanently delete your account and remove your data from our
              servers.
            </p>
            <button className="account-delete-btn">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
