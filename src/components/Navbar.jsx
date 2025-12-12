import { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Heart,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: ''
  });
  const dropdownRef = useRef(null);

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

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const res = await api.get('/users/me');
          const userData = {
            username: res.data.username || '',
            email: res.data.email || '',
            phone: res.data.phone_number || ''
          };
          setProfileData(userData);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Map "tenant" role to "Client" for UI consistency
  const userRole = user?.role === "tenant" ? "Client" : user?.role;

  // Public navigation items (always visible)
  const publicNavItems = [
    { path: "/", label: "Home" },
    { path: "/properties", label: "Properties" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  // User dropdown menu items
  const userDropdownItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: User,
    },
    {
      path: "/dashboard/interests",
      label: "My Interests",
      icon: Heart,
    },
    {
      path: "/dashboard/settings",
      label: "Account Settings",
      icon: Settings,
    },
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
            <span className="navbar-logo-icon">🏛️</span>
            <span className="navbar-logo-text">Victor Springs</span>
          </Link>

          {/* Desktop Navigation - Always show public nav items */}
          <div className="navbar-nav">
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-link ${isActive(item.path) ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="navbar-user-section">
            {user ? (
              /* Authenticated User - Show Avatar Dropdown */
              <div className="navbar-user-dropdown" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="navbar-user-button"
                >
                  <div className="navbar-user-avatar">
                    {user.first_name?.[0]?.toUpperCase() ||
                     user.email?.[0]?.toUpperCase() ||
                     "U"}
                  </div>
                  <ChevronDown size={16} className="navbar-dropdown-icon" />
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="navbar-dropdown-menu">
                    {/* User Info Header */}
                    <div className="navbar-dropdown-header">
                      <div className="navbar-dropdown-avatar">
                        {user.first_name?.[0]?.toUpperCase() ||
                         user.email?.[0]?.toUpperCase() ||
                         "U"}
                      </div>
                      <div className="navbar-dropdown-info">
                        <div className="navbar-dropdown-name">
                          {profileData.username || user?.username || 'user'}
                        </div>
                        <div className="navbar-dropdown-role">
                          {userRole}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="navbar-dropdown-items">
                      {userDropdownItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="navbar-dropdown-item"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <item.icon size={16} />
                          {item.label}
                        </Link>
                      ))}

                      {/* Divider */}
                      <div className="navbar-dropdown-divider"></div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="navbar-dropdown-item logout"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest User - Show Login/Signup buttons */
              <div className="navbar-auth-buttons">
                <Link to="/login" className="navbar-link">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="navbar-link navbar-cta-link"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="navbar-mobile-toggle"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar-mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
          {/* User greeting in mobile menu */}
          {user && (
            <div className="navbar-mobile-user">
              <div className="navbar-user-avatar mobile">
                {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="navbar-mobile-user-info">
                <div className="navbar-user-greeting mobile">
                  Hi, {profileData.username || user?.username || 'user'}
                </div>
                <div className="navbar-user-role">
                  {userRole}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links - Always show public nav */}
          <div className="navbar-mobile-nav">
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="navbar-link mobile"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          {user ? (
            <div className="navbar-mobile-actions">
              {userDropdownItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="navbar-link mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={16} className="mr-2" />
                  {item.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="navbar-mobile-divider"></div>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="navbar-link mobile logout"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-mobile-auth">
              <Link
                to="/login"
                className="navbar-link mobile"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="navbar-cta-button mobile"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;
