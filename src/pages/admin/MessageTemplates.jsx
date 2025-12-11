import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Save,
  Edit3,
  Settings,
  Phone,
  Globe,
  Mail,
  Building,
} from "lucide-react";
import "./MessageTemplates.css";

const MessageTemplates = () => {
  const [templates, setTemplates] = useState({});
  const [globalSettings, setGlobalSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [editedSubject, setEditedSubject] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesRes, settingsRes] = await Promise.all([
        api.get("/admin/message-templates"),
        api.get("/admin/global-settings"),
      ]);

      setTemplates(templatesRes.data);
      setGlobalSettings(settingsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load message templates");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (templateKey, template) => {
    setEditingTemplate(templateKey);
    setEditedSubject(template.subject);
    setEditedMessage(template.message);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    try {
      await api.post(`/admin/message-templates/${editingTemplate}`, {
        subject: editedSubject,
        message: editedMessage,
      });

      // Update local state
      setTemplates((prev) => ({
        ...prev,
        [editingTemplate]: {
          ...prev[editingTemplate],
          subject: editedSubject,
          message: editedMessage,
        },
      }));

      setEditingTemplate(null);
      toast.success("Message template updated successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditedSubject("");
    setEditedMessage("");
  };

  const handleUpdateGlobalSettings = async (newSettings) => {
    try {
      await api.post("/admin/global-settings", newSettings);
      setGlobalSettings(newSettings);
      toast.success("Global settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update global settings");
    }
  };

  const getTemplateIcon = (key) => {
    const icons = {
      site_visit_request: "🏛️",
      site_visit_confirmation: "✅",
      express_interest: "💝",
      unit_available: "🎉",
      site_visit_reminder: "⏰",
      welcome: "🎉",
      account_verification: "🔐",
      password_reset: "🔑",
    };
    return icons[key] || "📱";
  };

  const getTemplateTitle = (key) => {
    const titles = {
      site_visit_request: "Site Visit Request",
      site_visit_confirmation: "Site Visit Confirmation",
      express_interest: "Express Interest",
      unit_available: "Unit Available",
      site_visit_reminder: "Site Visit Reminder",
      welcome: "Welcome Message",
      account_verification: "Account Verification",
      password_reset: "Password Reset",
    };
    return titles[key] || key.replace("_", " ").toUpperCase();
  };

  if (loading) {
    return (
      <div className="message-templates-page">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p>Loading message templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-templates-page">
      <div className="page-header">
        <div className="header-content">
          <MessageSquare size={32} className="header-icon" />
          <div>
            <h1 className="page-title">Message Templates</h1>
            <p className="page-subtitle">
              Customize notification messages sent to users
            </p>
          </div>
        </div>
      </div>

      {/* Global Settings */}
      <div className="global-settings-section">
        <div className="section-header">
          <Settings size={20} />
          <h2>Global Settings</h2>
        </div>

        <div className="global-settings-grid">
          <div className="setting-item">
            <label>
              <Phone size={16} />
              Support Phone
            </label>
            <input
              type="text"
              value={globalSettings.support_phone || ""}
              onChange={(e) =>
                setGlobalSettings((prev) => ({
                  ...prev,
                  support_phone: e.target.value,
                }))
              }
              placeholder="+254 700 000 000"
            />
          </div>

          <div className="setting-item">
            <label>
              <Globe size={16} />
              Website URL
            </label>
            <input
              type="url"
              value={globalSettings.website_url || ""}
              onChange={(e) =>
                setGlobalSettings((prev) => ({
                  ...prev,
                  website_url: e.target.value,
                }))
              }
              placeholder="https://victor-springs.com"
            />
          </div>

          <div className="setting-item">
            <label>
              <Building size={16} />
              Company Name
            </label>
            <input
              type="text"
              value={globalSettings.company_name || ""}
              onChange={(e) =>
                setGlobalSettings((prev) => ({
                  ...prev,
                  company_name: e.target.value,
                }))
              }
              placeholder="Victor Springs"
            />
          </div>

          <div className="setting-item">
            <label>
              <Mail size={16} />
              Support Email
            </label>
            <input
              type="email"
              value={globalSettings.support_email || ""}
              onChange={(e) =>
                setGlobalSettings((prev) => ({
                  ...prev,
                  support_email: e.target.value,
                }))
              }
              placeholder="support@victor-springs.com"
            />
          </div>
        </div>

        <div className="settings-actions">
          <button
            onClick={() => handleUpdateGlobalSettings(globalSettings)}
            className="save-settings-btn"
          >
            <Save size={16} />
            Save Global Settings
          </button>
        </div>
      </div>

      {/* Message Templates */}
      <div className="templates-section">
        <div className="section-header">
          <MessageSquare size={20} />
          <h2>Message Templates</h2>
        </div>

        <div className="templates-grid">
          {Object.entries(templates).map(([key, template]) => (
            <div key={key} className="template-card">
              <div className="template-header">
                <div className="template-icon">
                  {getTemplateIcon(key)}
                </div>
                <div className="template-info">
                  <h3>{getTemplateTitle(key)}</h3>
                  <p>{template.subject}</p>
                </div>
                <button
                  onClick={() => handleEditTemplate(key, template)}
                  className="edit-template-btn"
                  disabled={editingTemplate === key}
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              </div>

              {editingTemplate === key ? (
                <div className="template-editor">
                  <div className="editor-field">
                    <label>Subject Line</label>
                    <input
                      type="text"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      placeholder="Enter subject line"
                    />
                  </div>

                  <div className="editor-field">
                    <label>Message Content</label>
                    <textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      placeholder="Enter message content"
                      rows="12"
                    />
                  </div>

                  <div className="variables-info">
                    <h4>Available Variables:</h4>
                    <div className="variables-list">
                      {template.variables.map((variable) => (
                        <span key={variable} className="variable-tag">
                          {`{${variable}}`}
                        </span>
                      ))}
                    </div>
                    <p className="variables-note">
                      Use curly braces {"{variable}"} to insert dynamic content
                    </p>
                  </div>

                  <div className="editor-actions">
                    <button
                      onClick={handleCancelEdit}
                      className="cancel-btn"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      className="save-btn"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Template
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="template-preview">
                  <pre className="message-preview">{template.message}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageTemplates;