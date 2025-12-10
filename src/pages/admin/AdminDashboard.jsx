import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  BarChart3,
  Users,
  Building,
  Calendar,
  MessageSquare,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  CreditCard,
  Eye,
  Download,
  Plus,
} from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState(null);
  const [venues, setVenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
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

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchReports();
    } else if (activeTab === "venues") {
      fetchVenues();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "bookings") {
      fetchBookings();
    } else if (activeTab === "reviews") {
      fetchReviews();
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

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews");
      setReviews(res.data);
    } catch (error) {
      toast.error("Failed to load reviews");
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

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast.success("Review deleted");
    } catch (error) {
      toast.error("Failed to delete review");
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
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "communications", label: "Communications", icon: FileText },
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

          {activeTab === "reviews" && (
            <div className="reviews-section">
              <h2>Review Moderation</h2>
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div>
                        <strong>{review.user}</strong> on{" "}
                        <em>{review.venue}</em>
                        <div className="review-rating">
                          {"★".repeat(review.rating)}
                        </div>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => deleteReview(review.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <small>
                      {new Date(review.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "communications" && (
            <div className="communications-section">
              <h2>Communications</h2>
              <p>Manage communications sent by users on Tawk.to</p>
              <p>
                Note: Communications are handled through the Tawk.to chat
                widget.
              </p>
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
              <button className="modal-close" onClick={() => setShowVenueModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); saveVenue(); }}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={venueForm.name}
                    onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={venueForm.location}
                    onChange={(e) => setVenueForm({ ...venueForm, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={venueForm.capacity}
                    onChange={(e) => setVenueForm({ ...venueForm, capacity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price per Day (KES)</label>
                  <input
                    type="number"
                    value={venueForm.price_per_day}
                    onChange={(e) => setVenueForm({ ...venueForm, price_per_day: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={venueForm.category}
                    onChange={(e) => setVenueForm({ ...venueForm, category: e.target.value })}
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
                    onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
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
                  {venueForm.image_url && <img src={venueForm.image_url} alt="Preview" style={{ width: '100px' }} />}
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowVenueModal(false)}>Cancel</button>
                  <button type="submit">{editingVenue ? "Update" : "Add"} Venue</button>
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
