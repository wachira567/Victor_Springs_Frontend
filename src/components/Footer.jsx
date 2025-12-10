import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-decoration-1"></div>
      <div className="footer-decoration-2"></div>

      <div className="footer-content">
        {/* Brand */}
        <div className="footer-section">
          <div className="footer-brand">
            <h3 className="footer-logo">
              Victor<span className="footer-logo-accent">Springs</span>
            </h3>
            <p className="footer-description">
              Premium rental properties in Nairobi and Kiambu environs. From
              cozy bedsitters to spacious family homes - verified and secure.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Explore</h4>
          <ul className="footer-links">
            <li>
              <Link to="/properties" className="footer-link">
                Browse Properties
              </Link>
            </li>
            <li>
              <Link to="/about" className="footer-link">
                How it Works
              </Link>
            </li>
            <li>
              <Link to="/contact" className="footer-link">
                List Your Property
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul className="footer-links">
            <li className="footer-contact-item">
              <Phone size={18} className="footer-contact-icon" />
              +254 717 849 484
            </li>
            <li className="footer-contact-item">
              <Mail size={18} className="footer-contact-icon" />
              victorspringsltd@gmail.com
            </li>
            <li className="footer-contact-item">
              <MapPin size={18} className="footer-contact-icon" />
              Nairobi & Kiambu County
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-section">
          <h4>Legal</h4>
          <ul className="footer-links">
            <li>
              <Link to="/terms" className="footer-link">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="footer-link">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Victor Springs Ltd. All rights
        reserved.
      </div>
    </footer>
  );
};

export default Footer;
