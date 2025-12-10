import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Calendar,
  Heart,
  MessageSquare,
  FileText,
  Edit,
} from "lucide-react";
import ProfileEditModal from "./ProfileEditModal";
import "./Navbar.css";

// Pre-load components for better performance
const preloadProfileEdit = () => import("../pages/client/ProfileEdit");
const preloadAccountSettings = () => import("../pages/client/AccountSettings");

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // Pre-load components on hover for better performance
  const handleProfileEditHover = () => {
    preloadProfileEdit();
  };

  const handleAccountSettingsHover = () => {
    preloadAccountSettings();
  };

  const navItems = user
    ? [
        { path: "/", label: "Home" },
        { path: "/properties", label: "Properties" },
        { path: "/about", label: "About" },
        { path: "/contact", label: "Contact" },
        // Only show dashboard links for admins
        ...(user.role === "Admin"
          ? [{ path: "/dashboard", label: "Dashboard", icon: Settings }]
          : [
              {
                path: "/dashboard/bookings",
                label: "My Bookings",
                icon: Calendar,
              },
              {
                path: "/dashboard/saved",
                label: "Saved Properties",
                icon: Heart,
              },
              {
                path: "/dashboard/messages",
                label: "Messages",
                icon: MessageSquare,
              },
              {
                path: "/dashboard/invoices",
                label: "Invoices",
                icon: FileText,
              },
            ]),
      ]
    : [
        { path: "/", label: "Home" },
        { path: "/properties", label: "Properties" },
        { path: "/about", label: "About" },
        { path: "/contact", label: "Contact" },
      ];

  return (
    <>
      <nav
        className={`navbar ${
          scrollDirection === "down" && isScrolled ? "hidden" : ""
        }`}
      >
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span>🏛️</span>
            Victor Springs
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-link ${isActive(item.path) ? "active" : ""}`}
              >
                {item.icon && <item.icon size={16} className="mr-1" />}
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Profile Links - Far Right */}
                <Link
                  to="/profile/edit"
                  className={`navbar-link ${
                    isActive("/profile/edit") ? "active" : ""
                  }`}
                  onMouseEnter={handleProfileEditHover}
                >
                  <Edit size={16} className="mr-1" />
                  Edit Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className={`navbar-link ${
                    isActive("/dashboard/settings") ? "active" : ""
                  }`}
                  onMouseEnter={handleAccountSettingsHover}
                >
                  <Settings size={16} className="mr-1" />
                  Account Settings
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="navbar-link text-red-600 hover:text-red-700"
                >
                  <LogOut size={16} className="mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="navbar-link">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="navbar-mobile-toggle md:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar-mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="navbar-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon && <item.icon size={16} className="mr-2" />}
              {item.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to="/profile/edit"
                className="navbar-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Link>
              <Link
                to="/dashboard/settings"
                className="navbar-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings size={16} className="mr-2" />
                Account Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="navbar-link text-red-600"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <Link to="/login" className="navbar-link">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-center hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
