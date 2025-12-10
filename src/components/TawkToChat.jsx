import { useEffect, useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import "./TawkToChat.css";

const TawkToChat = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [currentVenue, setCurrentVenue] = useState(null);

  useEffect(() => {
    // Only initialize Tawk.to for logged-in users
    if (!user) {
      // If user logs out, hide and remove the widget
      if (window.Tawk_API && isWidgetLoaded) {
        window.Tawk_API.hideWidget();
      }
      return;
    }

    // Initialize Tawk.to for logged-in users
    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://embed.tawk.to/" +
      import.meta.env.VITE_TAWK_PROPERTY_ID +
      "/" +
      import.meta.env.VITE_TAWK_WIDGET_ID;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    // Set up Tawk.to API when loaded
    script.onload = () => {
      if (window.Tawk_API) {
        setIsWidgetLoaded(true);

        // Set user attributes
        window.Tawk_API.setAttributes({
          name: user.username,
          email: user.email || "",
          id: user.id || user.username,
          role: user.role || "Client",
        });

        // Set visitor information
        window.Tawk_API.addEvent("User Login", {
          username: user.username,
          role: user.role || "Client",
          loginTime: new Date().toISOString(),
        });

        // Check if we're on a venue details page and initialize with property info
        const venueMatch = location.pathname.match(/^\/venues\/(\d+)$/);
        if (venueMatch && currentVenue) {
          const venueId = venueMatch[1];

          window.Tawk_API.setAttributes({
            pageType: "venue_details",
            venueId: venueId,
            venueName: currentVenue.name || "Unknown Venue",
            venueLocation: currentVenue.location || "Unknown Location",
            venuePrice: currentVenue.price_per_day || 0,
            venueCategory: currentVenue.category || "Unknown Category",
            inquiryType: "property_information",
          });

          // Add event for property inquiry
          window.Tawk_API.addEvent("Property Inquiry", {
            venueId: venueId,
            venueName: currentVenue.name || "Unknown Venue",
            page: location.pathname,
            timestamp: new Date().toISOString(),
          });
        }

        // Hide the widget initially
        window.Tawk_API.hideWidget();

        // Show widget after a short delay
        setTimeout(() => {
          window.Tawk_API.showWidget();
        }, 1000);

        // Listen for chat events
        window.Tawk_API.onLoad = function () {
          console.log("Tawk.to chat loaded successfully");

          // Set custom attributes based on current page
          const pageAttributes = {
            currentPage: location.pathname,
            pageTitle: document.title,
            timestamp: new Date().toISOString(),
          };

          window.Tawk_API.setAttributes(pageAttributes);
        };

        // Handle chat start
        window.Tawk_API.onChatStarted = function () {
          console.log("Chat started with admin");
        };

        // Handle chat end
        window.Tawk_API.onChatEnded = function () {
          console.log("Chat ended");
        };
      }
    };

    // Cleanup function
    return () => {
      // Remove Tawk.to widget when component unmounts or user logs out
      if (window.Tawk_API) {
        window.Tawk_API.hideWidget();
        setIsWidgetLoaded(false);
      }

      // Remove the script
      const tawkScript = document.querySelector('script[src*="embed.tawk.to"]');
      if (tawkScript) {
        tawkScript.remove();
      }

      // Remove Tawk.to container
      const tawkContainer = document.getElementById("tawkToContainer");
      if (tawkContainer) {
        tawkContainer.remove();
      }
    };
  }, [user]); // Only depend on user

  // Fetch venue details when on venue page
  useEffect(() => {
    const venueMatch = location.pathname.match(/^\/venues\/(\d+)$/);
    if (venueMatch && user) {
      // Only fetch for logged-in users
      const venueId = venueMatch[1];
      const fetchVenueDetails = async () => {
        try {
          const response = await api.get(`/venues/${venueId}`);
          setCurrentVenue(response.data);
        } catch (error) {
          console.error("Error fetching venue details for chat:", error);
        }
      };
      fetchVenueDetails();
    } else {
      setCurrentVenue(null);
    }
  }, [location.pathname, user]);

  // Fetch venue details when on venue page
  useEffect(() => {
    const venueMatch = location.pathname.match(/^\/venues\/(\d+)$/);
    if (venueMatch) {
      const venueId = venueMatch[1];
      const fetchVenueDetails = async () => {
        try {
          const response = await api.get(`/venues`);
          const venue = response.data.find((v) => v.id == venueId);
          if (venue) {
            setCurrentVenue(venue);
          }
        } catch (error) {
          console.error("Error fetching venue details:", error);
        }
      };
      fetchVenueDetails();
    } else {
      setCurrentVenue(null);
    }
  }, [location.pathname]);

  // Update attributes when user, location, or venue changes
  useEffect(() => {
    if (window.Tawk_API && window.Tawk_API.setAttributes) {
      const attributes = {
        currentPage: location.pathname,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
      };

      if (user) {
        attributes.name = user.username;
        attributes.email = user.email || "";
        attributes.id = user.id || user.username;
        attributes.role = user.role || "Client";
      }

      // Add venue details if available
      if (currentVenue) {
        attributes.pageType = "venue_details";
        attributes.venueId = currentVenue.id;
        attributes.venueName = currentVenue.name;
        attributes.venueLocation = currentVenue.location;
        attributes.venuePrice = currentVenue.price_per_day;
        attributes.venueCategory = currentVenue.category;
        attributes.inquiryType = "property_information";

        // Add event for property inquiry
        window.Tawk_API.addEvent("Property Inquiry Started", {
          venueId: currentVenue.id,
          venueName: currentVenue.name,
          venueLocation: currentVenue.location,
          venuePrice: currentVenue.price_per_day,
          timestamp: new Date().toISOString(),
        });
      }

      window.Tawk_API.setAttributes(attributes);
    }
  }, [user, location.pathname, currentVenue]);

  return null; // This component doesn't render anything visible
};

export default TawkToChat;
