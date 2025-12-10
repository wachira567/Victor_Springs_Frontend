import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  FileText,
  Download,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import "./Invoices.css";

const Invoices = () => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // Fetch user's bookings
        const bookingsResponse = await api.get("/bookings/my-bookings");
        const bookings = bookingsResponse.data;

        // Create invoice data from approved bookings
        const invoiceData = bookings.map((booking, index) => {
          // For demo purposes, we'll assume some bookings are paid and some are pending
          // In a real app, you'd have a separate payments/invoices table
          const isPaid = index % 2 === 0; // Alternate between paid and pending for demo
          const dueDate = new Date(booking.event_date);
          dueDate.setDate(dueDate.getDate() - 7); // Due 7 days before event

          return {
            id: `INV-${new Date().getFullYear()}-${String(booking.id).padStart(3, '0')}`,
            bookingId: booking.id,
            venueName: "Venue", // We don't have venue name in booking response, would need to fetch venue details
            amount: booking.total_cost,
            status: isPaid ? "paid" : "pending",
            paymentMethod: isPaid ? "M-Pesa" : null,
            transactionId: isPaid ? `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
            date: new Date(booking.event_date),
            dueDate: dueDate,
            items: [
              { description: `Venue Booking - Event on ${new Date(booking.event_date).toLocaleDateString()}`, amount: booking.total_cost },
            ],
          };
        });

        setInvoices(invoiceData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
        // Fallback to empty array
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInvoices();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusBadge = (status) => {
    if (status === "paid")
      return (
        <span className="invoices-status-paid">
          <CheckCircle size={14} /> Paid
        </span>
      );
    if (status === "pending")
      return (
        <span className="invoices-status-pending">
          <Clock size={14} /> Pending
        </span>
      );
    return (
      <span className="invoices-status-overdue">
        <AlertCircle size={14} /> Overdue
      </span>
    );
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      // Extract booking ID from invoice ID (assuming format INV-XXXXXX)
      const bookingId = parseInt(invoiceId.split('-').pop());

      const response = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: 'blob' // Important for handling binary data
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
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

  const payWithTinyPesa = (invoice) => {
    // Mock TinyPesa payment flow
    toast.info(
      `Redirecting to TinyPesa payment for ${invoice.amount.toLocaleString()} KES...`
    );

    // Simulate payment success after 3 seconds
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoice.id
            ? {
                ...inv,
                status: "paid",
                transactionId:
                  "TP" + Math.random().toString(36).substr(2, 9).toUpperCase(),
              }
            : inv
        )
      );
      toast.success("Payment successful! Invoice has been paid.");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <div className="invoices-container">
        <div className="invoices-header">
          <h1 className="invoices-title">
            <FileText className="text-indigo-600" size={32} />
            My Invoices
          </h1>
          <p className="invoices-subtitle">
            View and manage your booking invoices and payments
          </p>
        </div>

        {/* Invoice Stats */}
        <div className="invoices-stats">
          <div className="invoices-stat-card">
            <div className="invoices-stat-number">{invoices.length}</div>
            <div className="invoices-stat-label">Total Invoices</div>
          </div>
          <div className="invoices-stat-card">
            <div className="invoices-stat-number">
              {invoices.filter((inv) => inv.status === "paid").length}
            </div>
            <div className="invoices-stat-label">Paid</div>
          </div>
          <div className="invoices-stat-card">
            <div className="invoices-stat-number">
              {invoices.filter((inv) => inv.status === "pending").length}
            </div>
            <div className="invoices-stat-label">Pending</div>
          </div>
          <div className="invoices-stat-card">
            <div className="invoices-stat-number">
              KES{" "}
              {invoices
                .reduce((sum, inv) => sum + inv.amount, 0)
                .toLocaleString()}
            </div>
            <div className="invoices-stat-label">Total Amount</div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="invoices-list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoices-invoice-card">
              <div className="invoices-invoice-header">
                <div className="invoices-invoice-info">
                  <h3>Invoice {invoice.id}</h3>
                  <p>{invoice.venueName}</p>
                  <div className="invoices-invoice-dates">
                    <span>Issued: {invoice.date.toLocaleDateString()}</span>
                    <span>Due: {invoice.dueDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="invoices-invoice-status">
                  {getStatusBadge(invoice.status)}
                  <p className="invoices-invoice-amount">
                    KES {invoice.amount.toLocaleString()}
                  </p>
                  {invoice.transactionId && (
                    <p className="invoices-invoice-txn">
                      TXN: {invoice.transactionId}
                    </p>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              <div className="invoices-invoice-details">
                <h4>Invoice Details</h4>
                {invoice.items.map((item, index) => (
                  <div key={index} className="invoices-invoice-item">
                    <span>{item.description}</span>
                    <span>KES {item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="invoices-invoice-actions">
                <button
                  onClick={() => downloadInvoice(invoice.id)}
                  className="invoices-download-btn"
                >
                  <Download size={16} />
                  Download PDF
                </button>

                {invoice.status === "pending" && (
                  <button
                    onClick={() => payWithTinyPesa(invoice)}
                    className="invoices-pay-btn"
                  >
                    <CreditCard size={16} />
                    Pay with TinyPesa
                  </button>
                )}

                {invoice.status === "overdue" && (
                  <button
                    onClick={() => payWithTinyPesa(invoice)}
                    className="invoices-pay-overdue invoices-pay-btn"
                  >
                    <AlertCircle size={16} />
                    Pay Now (Overdue)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* TinyPesa Info */}
        <div className="invoices-tinypesa-info">
          <div className="invoices-tinypesa-header">
            <CreditCard className="text-green-600" size={24} />
            <h3 className="invoices-tinypesa-title">About TinyPesa Payments</h3>
          </div>
          <p className="invoices-tinypesa-description">
            TinyPesa is our secure payment partner that allows you to pay for
            property rentals using M-Pesa, card, or bank transfer. All payments
            are processed securely and you receive instant confirmation.
          </p>
          <div className="invoices-tinypesa-features">
            <div className="invoices-tinypesa-feature">
              <CheckCircle
                className="invoices-tinypesa-feature-icon"
                size={16}
              />
              <span>Secure SSL encryption</span>
            </div>
            <div className="invoices-tinypesa-feature">
              <CheckCircle
                className="invoices-tinypesa-feature-icon"
                size={16}
              />
              <span>Instant payment confirmation</span>
            </div>
            <div className="invoices-tinypesa-feature">
              <CheckCircle
                className="invoices-tinypesa-feature-icon"
                size={16}
              />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
