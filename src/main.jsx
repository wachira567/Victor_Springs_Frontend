import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Import global CSS files in main.jsx to prevent FOUC
// This ensures styles are loaded before React renders
import "./index.css";
import "./App.css";

// Preload component CSS files to prevent FOUC on lazy-loaded components
import "./pages/client/MyInterests.css";

// Preload public page CSS
import "./pages/public/Home.css";
import "./pages/public/About.css";
import "./pages/public/Contact.css";
import "./pages/public/Login.css";
import "./pages/public/Register.css";
import "./pages/public/PropertyDetails.css";
import "./pages/public/VenueList.css";

// Preload admin page CSS
import "./pages/admin/AdminDashboard.css";
import "./pages/admin/Activity.css";
import "./pages/admin/MessageTemplates.css";

// Preload client page CSS
import "./pages/client/ClientDashboard.css";
import "./pages/client/AccountSettings.css";
import "./pages/client/SavedVenues.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
