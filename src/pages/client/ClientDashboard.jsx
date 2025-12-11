import { useEffect, useState, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Heart, Settings, User, MapPin, Mail, Phone, Eye, AlertCircle } from 'lucide-react';
import './ClientDashboard.css';

const ClientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [siteVisits, setSiteVisits] = useState([]);
    const [expressInterests, setExpressInterests] = useState([]);
    const [savedProperties, setSavedProperties] = useState([]);
    const [activeTab, setActiveTab] = useState('site-visits');
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: '', // We'll need to get this from backend
        phone: '',
        location: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Fetch user's site visits (appointments)
        const fetchSiteVisits = async () => {
            try {
                const res = await api.get('/appointments/my-appointments');
                setSiteVisits(res.data);
            } catch (error) {
                console.error('Error fetching site visits:', error);
            }
        };

        // Fetch user's express interests (vacancy alerts)
        const fetchExpressInterests = async () => {
            try {
                const res = await api.get('/user/interests');
                setExpressInterests(res.data);
            } catch (error) {
                console.error('Error fetching express interests:', error);
            }
        };

        // Fetch user profile
        const fetchUserProfile = async () => {
            try {
                const res = await api.get('/users/me');
                setProfileData({
                    username: res.data.username,
                    email: res.data.email,
                    phone: profileData.phone, // Keep local state for these
                    location: profileData.location
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        // Fetch saved properties
        const fetchSavedProperties = async () => {
            try {
                const res = await api.get('/properties/saved');
                setSavedProperties(res.data);
            } catch (error) {
                console.error('Error fetching saved properties:', error);
            }
        };

        fetchSiteVisits();
        fetchExpressInterests();
        fetchUserProfile();
        fetchSavedProperties();
    }, []);


    const getStatusBadge = (status) => {
        if (status === 'Approved') return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold"><CheckCircle size={14}/> Approved</span>;
        if (status === 'Rejected') return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold"><XCircle size={14}/> Rejected</span>;
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold"><Clock size={14}/> Pending</span>;
    };

    // Calculate some stats for gamification
    const totalSiteVisits = siteVisits.length;
    const confirmedVisits = siteVisits.filter(v => v.status === 'confirmed').length;
    const pendingInterests = expressInterests.filter(i => i.is_active).length;

    return (
        <div className="dashboard-container">
            {/* Welcome Section with Stats */}
            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <div className="welcome-text">
                        <h1>Welcome back, {user?.username}! 🎉</h1>
                        <p>Ready to find your perfect property?</p>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-number">{totalSiteVisits}</span>
                            <span className="stat-label">Site Visits</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{confirmedVisits}</span>
                            <span className="stat-label">Confirmed</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">{pendingInterests}</span>
                            <span className="stat-label">Pending Interests</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <div className="action-card" onClick={() => setActiveTab('site-visits')}>
                    <div className="action-header">
                        <div className="action-icon book">
                            <Eye size={24} />
                        </div>
                        <div>
                            <h3 className="action-title">Schedule Site Visit</h3>
                            <p className="action-description">Book a property viewing</p>
                        </div>
                    </div>
                </div>

                <div className="action-card" onClick={() => setActiveTab('saved')}>
                    <div className="action-header">
                        <div className="action-icon save">
                            <Heart size={24} />
                        </div>
                        <div>
                            <h3 className="action-title">Browse Saved</h3>
                            <p className="action-description">Your favorite properties</p>
                        </div>
                    </div>
                </div>

                <div className="action-card" onClick={() => setActiveTab('settings')}>
                    <div className="action-header">
                        <div className="action-icon profile">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h3 className="action-title">Update Profile</h3>
                            <p className="action-description">Manage your account</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Sidebar */}
                <div className="sidebar">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="user-name">{user?.username}</h2>
                        <p className="user-role">Client</p>
                    </div>

                    <nav className="nav-menu">
                        <button onClick={() => setActiveTab('site-visits')} className={`nav-item ${activeTab === 'site-visits' ? 'active' : ''}`}>
                            <Eye size={18} />
                            Track Site Visit
                        </button>
                        <button onClick={() => setActiveTab('express-interests')} className={`nav-item ${activeTab === 'express-interests' ? 'active' : ''}`}>
                            <AlertCircle size={18} />
                            Track Express Interest
                        </button>
                        <button onClick={() => setActiveTab('saved')} className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}>
                            <Heart size={18} />
                            Saved Properties
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
                            <Settings size={18} />
                            Account Settings
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    <div className="content-header">
                        <h1 className="content-title">
                            {activeTab === 'site-visits' && "Track Site Visit"}
                            {activeTab === 'express-interests' && "Track Express Interest"}
                            {activeTab === 'saved' && "Saved Properties"}
                            {activeTab === 'settings' && "Account Settings"}
                        </h1>
                        <p className="content-subtitle">
                            {activeTab === 'site-visits' && "Track your scheduled property viewings and their approval status"}
                            {activeTab === 'express-interests' && "Monitor your property interest requests waiting for admin approval"}
                            {activeTab === 'saved' && "Properties you've saved for later"}
                            {activeTab === 'settings' && "Manage your account preferences and information"}
                        </p>
                    </div>

                    {activeTab === 'site-visits' && (
                        <div className="site-visits-grid">
                            {siteVisits.length === 0 ? (
                                <div className="empty-state">
                                    <Eye className="empty-icon" size={64} />
                                    <h3 className="empty-title">No site visits scheduled</h3>
                                    <p className="empty-subtitle">
                                        You haven't scheduled any property viewings yet. Browse properties and book a site visit!
                                    </p>
                                </div>
                            ) : (
                                siteVisits.map((visit) => (
                                    <div key={visit.id} className="visit-card">
                                        <div className="visit-header">
                                            <div>
                                                <h3 className="visit-title">Site Visit #{visit.id}</h3>
                                                <div className="visit-meta">
                                                    <div className="visit-meta-item">
                                                        <Calendar size={16} />
                                                        <span>{new Date(visit.appointment_date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="visit-meta-item">
                                                        <MapPin size={16} />
                                                        <span>{visit.unit_type?.name || 'Property'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="mb-2">{getStatusBadge(visit.status)}</div>
                                                <p className="visit-type">{visit.type === 'viewing' ? 'Property Viewing' : 'Waitlist Join'}</p>
                                            </div>
                                        </div>
                                        {visit.admin_notes && (
                                            <div className="visit-notes">
                                                <p><strong>Admin Notes:</strong> {visit.admin_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'express-interests' && (
                        <div className="interests-grid">
                            {expressInterests.length === 0 ? (
                                <div className="empty-state">
                                    <AlertCircle className="empty-icon" size={64} />
                                    <h3 className="empty-title">No express interests yet</h3>
                                    <p className="empty-subtitle">
                                        You haven't expressed interest in any properties yet. Browse properties and show your interest!
                                    </p>
                                </div>
                            ) : (
                                expressInterests.map((interest) => (
                                    <div key={interest.id} className="interest-card">
                                        <div className="interest-header">
                                            <div>
                                                <h3 className="interest-title">{interest.property_name}</h3>
                                                <div className="interest-meta">
                                                    <div className="interest-meta-item">
                                                        <Calendar size={16} />
                                                        <span>Expires: {new Date(interest.valid_until).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="interest-meta-item">
                                                        <MapPin size={16} />
                                                        <span>{interest.contact_email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="mb-2">{getStatusBadge(interest.is_active ? 'Active' : 'Expired')}</div>
                                            </div>
                                        </div>
                                        {interest.special_requests && (
                                            <div className="interest-requests">
                                                <p><strong>Special Requests:</strong> {interest.special_requests}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="saved-grid">
                            {savedProperties.length === 0 ? (
                                <div className="empty-state">
                                    <Heart className="empty-icon" size={64} />
                                    <h3 className="empty-title">No saved properties yet</h3>
                                    <p className="empty-subtitle">
                                        Start exploring properties and save your favorites by clicking the heart icon!
                                    </p>
                                </div>
                            ) : (
                                savedProperties.map((property) => (
                                    <div key={property.id} className="saved-card">
                                        <div className="saved-header">
                                            <h3 className="saved-title">{property.name}</h3>
                                            <Heart className="text-pink-500 fill-current" size={20} />
                                        </div>
                                        <div className="saved-meta">
                                            <div className="saved-location">
                                                <MapPin size={16} />
                                                <span>{property.city}, {property.neighborhood}</span>
                                            </div>
                                        </div>
                                        <div className="saved-address">
                                            {property.address}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-form">
                            <div className="form-section">
                                <h3 className="section-title">
                                    <User size={20} />
                                    Profile Information
                                </h3>

                                {!isEditing ? (
                                    <div>
                                        <div className="preference-item">
                                            <span className="font-medium">Username:</span>
                                            <span>{profileData.username}</span>
                                        </div>
                                        <div className="preference-item">
                                            <span className="font-medium">Email:</span>
                                            <span>{profileData.email || 'Not set'}</span>
                                        </div>
                                        <div className="preference-item">
                                            <span className="font-medium">Phone:</span>
                                            <span>{profileData.phone || 'Not set'}</span>
                                        </div>
                                        <div className="preference-item">
                                            <span className="font-medium">Location:</span>
                                            <span>{profileData.location || 'Not set'}</span>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn btn-primary"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                ) : (
                                    <form>
                                        <div className="form-group">
                                            <label className="form-label">Username</label>
                                            <input
                                                type="text"
                                                value={profileData.username}
                                                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Location</label>
                                            <input
                                                type="text"
                                                value={profileData.location}
                                                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                }}
                                                className="btn btn-primary"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="btn btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">
                                    <Settings size={20} />
                                    Account Preferences
                                </h3>
                                <div className="preference-item">
                                    <div className="preference-content">
                                        <h4>Email Notifications</h4>
                                        <p>Receive booking updates via email</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="preference-item">
                                    <div className="preference-content">
                                        <h4>SMS Notifications</h4>
                                        <p>Receive booking reminders via SMS</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="danger-zone">
                                <h4 className="danger-title">Delete Account</h4>
                                <p className="danger-text">
                                    Once you delete your account, there is no going back. This action cannot be undone.
                                </p>
                                <button className="btn btn-danger">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;