import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ProtectedRoute from "./components/ProtectedRoute";
import TawkToChat from "./components/TawkToChat";

// Pages - Lazy load for better performance
const Home = lazy(() => import("./pages/public/Home"));
const About = lazy(() => import("./pages/public/About"));
const Contact = lazy(() => import("./pages/public/Contact"));
const PropertyList = lazy(() => import("./pages/public/PropertyList"));
const PropertyDetails = lazy(() => import("./pages/public/PropertyDetails"));
const Login = lazy(() => import("./pages/public/Login"));
const Register = lazy(() => import("./pages/public/Register"));
const GoogleCallback = lazy(() => import("./pages/public/GoogleCallback"));

const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const MyBookings = lazy(() => import("./pages/client/MyBookings"));
const SavedVenues = lazy(() => import("./pages/client/SavedVenues"));
const AccountSettings = lazy(() => import("./pages/client/AccountSettings"));
const ProfileEdit = lazy(() => import("./pages/client/ProfileEdit"));
const Messages = lazy(() => import("./pages/client/Messages"));
const Invoices = lazy(() => import("./pages/client/Invoices"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Component to handle page padding
function PageWrapper({ children }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return <div className={isHomePage ? "" : "pt-20"}>{children}</div>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="bottom-right" />

        {/* The Navbar lives outside Routes so it's always visible (except admin maybe) */}
        <Navbar />

        <PageWrapper>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            }
          >
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/google-callback" element={<GoogleCallback />} />

              {/* CLIENT ROUTES (User Only) */}
              <Route
                element={<ProtectedRoute allowedRoles={["Client", "Admin"]} />}
              >
                <Route path="/dashboard/bookings" element={<MyBookings />} />
                <Route path="/dashboard/saved" element={<SavedVenues />} />
                <Route
                  path="/dashboard/settings"
                  element={<AccountSettings />}
                />
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/dashboard/messages" element={<Messages />} />
                <Route path="/dashboard/invoices" element={<Invoices />} />
              </Route>

              {/* GOD MODE (Admin Only) */}
              <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </Suspense>
        </PageWrapper>

        {/* Footer */}
        <Footer />
        {/* Global Floating WhatsApp Button */}
        <WhatsAppFloat />

        {/* Tawk.to Chat Widget */}
        <TawkToChat />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
