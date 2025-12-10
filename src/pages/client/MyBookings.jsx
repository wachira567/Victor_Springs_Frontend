import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  MessageSquare,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import "./MyBookings.css";

const MyBookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/my-bookings");
        setBookings(res.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    if (status === "Approved")
      return (
        <span className="booking-status status-approved">
          <CheckCircle size={14} /> Approved
        </span>
      );
    if (status === "Rejected")
      return (
        <span className="booking-status status-rejected">
          <XCircle size={14} /> Rejected
        </span>
      );
    return (
      <span className="booking-status status-pending">
        <Clock size={14} /> Pending
      </span>
    );
  };

  const viewBookingDetails = (bookingId) => {
    // Find the booking and navigate to the venue details page
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      navigate(`/properties/${booking.property_id}`);
    } else {
      toast.error("Booking not found");
    }
  };

  const contactVenue = (bookingId) => {
    // Find the booking and open chat with venue information
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }

    // Check if Tawk.to is loaded
    if (!window.Tawk_API) {
      toast.error("Chat service is loading. Please try again in a moment.");
      return;
    }

    try {
      // Set booking-specific attributes
      window.Tawk_API.setAttributes({
        pageType: "booking_details",
        bookingId: bookingId,
        venueId: booking.venue_id,
        venueName: booking.venue_name || "Unknown Venue",
        venueLocation: booking.venue_location || "Unknown Location",
        bookingStatus: booking.status,
        eventDate: booking.event_date,
        inquiryType: "booking_support",
        inquirySource: "my_bookings_page",
        timestamp: new Date().toISOString(),
      });

      // Add event for booking inquiry
      window.Tawk_API.addEvent("Booking Support Requested", {
        bookingId: bookingId,
        venueId: booking.venue_id,
        venueName: booking.venue_name || "Unknown Venue",
        bookingStatus: booking.status,
        eventDate: booking.event_date,
        timestamp: new Date().toISOString(),
      });

      // Show the chat widget
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();

      toast.success(
        `💬 Chat opened for ${booking.venue_name || "venue"} support!`
      );
    } catch (error) {
      console.error("Error opening chat:", error);
      toast.error("Failed to open chat. Please try again.");
    }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: "blob", // Important for handling binary data
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `venuevibe-invoice-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <h1 className="my-bookings-title">My Property Viewings</h1>
          <p className="my-bookings-subtitle">
            Track and manage all your property viewing requests
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="my-bookings-empty">
            <Calendar className="empty-icon" />
            <h3 className="empty-title">No bookings yet</h3>
            <p className="empty-text">
              Start your search for the perfect rental property!
            </p>
            <button
              onClick={() => navigate("/properties")}
              className="empty-action"
            >
              <Search size={20} />
              Browse Amazing Properties
            </button>
          </div>
        ) : (
          <>
            {/* Booking Stats */}
            <div className="my-bookings-stats">
              <div className="stat-card">
                <div className="stat-number">{bookings.length}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {bookings.filter((b) => b.status === "Approved").length}
                </div>
                <div className="stat-label">Approved</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {bookings.filter((b) => b.status === "Pending").length}
                </div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  KES{" "}
                  {bookings
                    .reduce((sum, b) => sum + b.total_cost, 0)
                    .toLocaleString()}
                </div>
                <div className="stat-label">Total Spent</div>
              </div>
            </div>

            {/* Bookings List */}
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3 className="booking-title">Booking #{booking.id}</h3>
                    <div className="booking-meta">
                      <span className="booking-meta-item">
                        <Calendar className="booking-meta-icon" size={16} />
                        {new Date(booking.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span>•</span>
                      <span>{booking.guest_count} Guests</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(booking.status)}
                    <p className="booking-price">
                      KES {booking.total_cost.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="booking-actions">
                  <button
                    onClick={() => viewBookingDetails(booking.id)}
                    className="action-btn action-btn-primary"
                  >
                    <Eye className="action-icon" size={16} />
                    View Details
                  </button>
                  <button
                    onClick={() => contactVenue(booking.id)}
                    className="action-btn action-btn-secondary"
                  >
                    <MessageSquare className="action-icon" size={16} />
                    Contact Venue
                  </button>
                  {booking.status === "Approved" && (
                    <button
                      onClick={() => downloadInvoice(booking.id)}
                      className="action-btn action-btn-success"
                    >
                      <Download className="action-icon" size={16} />
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
