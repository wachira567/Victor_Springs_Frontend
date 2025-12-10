import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";
import { X, User, Mail, Phone, MapPin, Save, Loader } from "lucide-react";

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
  });
  const [confirmData, setConfirmData] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
  });

  // Fetch current user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      const fetchUserData = async () => {
        try {
          const response = await api.get("/users/me");
          const userData = response.data;
          setFormData({
            username: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            location: userData.location || "",
          });
          setConfirmData({
            username: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            location: userData.location || "",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          // No toast notification for loading errors
        }
      };
      fetchUserData();
    }
  }, [isOpen, user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmChange = (field, value) => {
    setConfirmData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    // Check if all fields match their confirmations
    if (formData.username !== confirmData.username) {
      // No toast notification for validation errors
      return false;
    }
    if (formData.email !== confirmData.email) {
      // No toast notification for validation errors
      return false;
    }
    if (formData.phone !== confirmData.phone) {
      // No toast notification for validation errors
      return false;
    }
    if (formData.location !== confirmData.location) {
      // No toast notification for validation errors
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      // No toast notification for validation errors
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      // No toast notification for validation errors
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location || null,
      };

      await api.put("/users/profile", updateData);

      // Update local storage and context
      const updatedUser = {
        ...user,
        username: formData.username,
        email: formData.email,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      login(localStorage.getItem("token"), user.role, user.id);

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      // No toast notification for update errors
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-indigo-600" size={24} />
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Username */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Confirm username"
              value={confirmData.username}
              onChange={(e) => handleConfirmChange("username", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail size={16} />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="email"
              placeholder="Confirm email address"
              value={confirmData.email}
              onChange={(e) => handleConfirmChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+254 700 000 000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="tel"
              placeholder="Confirm phone number"
              value={confirmData.phone}
              onChange={(e) => handleConfirmChange("phone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin size={16} />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Nairobi, Kenya"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Confirm location"
              value={confirmData.location}
              onChange={(e) => handleConfirmChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
