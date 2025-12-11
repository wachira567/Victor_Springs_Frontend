import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppChatWidget from "./components/WhatsAppChatWidget";
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
const MyInterests = lazy(() => import("./pages/client/MyInterests"));
const Messages = lazy(() => import("./pages/client/Messages"));
const AccountSettings = lazy(() => import("./pages/client/AccountSettings"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CommunicationSettings = lazy(() =>
  import("./pages/admin/CommunicationSettings")
);
const NotificationManager = lazy(() =>
  import("./pages/admin/NotificationManager")
);
const MessageTemplates = lazy(() => import("./pages/admin/MessageTemplates"));
const PropertyInterests = lazy(() => import("./pages/admin/PropertyInterests"));
const Activity = lazy(() => import("./pages/admin/Activity"));

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
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/dashboard/messages" element={<Messages />} />
                <Route path="/dashboard/interests" element={<MyInterests />} />
                <Route
                  path="/dashboard/settings"
                  element={<AccountSettings />}
                />
              </Route>

              {/* GOD MODE (Admin Only) */}
              <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="/admin/communication"
                  element={<CommunicationSettings />}
                />
                <Route
                  path="/admin/notifications"
                  element={<NotificationManager />}
                />
                <Route
                  path="/admin/message-templates"
                  element={<MessageTemplates />}
                />
                <Route
                  path="/admin/property-interests"
                  element={<PropertyInterests />}
                />
                <Route path="/admin/activity" element={<Activity />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </Suspense>
        </PageWrapper>

        {/* Footer */}
        <Footer />

        {/* WhatsApp Chat Widget (with Tawk.to fallback) */}
        <WhatsAppChatWidget />

        {/* Tawk.to Chat Widget (fallback) */}
        <TawkToChat />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
