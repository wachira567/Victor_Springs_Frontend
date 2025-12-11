import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Heart, Settings, User, MapPin, Mail, Phone, Eye, AlertCircle, Trash2, ExternalLink } from 'lucide-react';
import './ClientDashboard.css';

const ClientDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [siteVisits, setSiteVisits] = useState([]);
    const [expressInterests, setExpressInterests] = useState([]);
    const [savedProperties, setSavedProperties] = useState([]);
    const [activeTab, setActiveTab] = useState('site-visits');
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        phone: '',
        location: ''
    });
    const [originalProfileData, setOriginalProfileData] = useState({
        username: '',
        email: '',
        phone: '',
        location: ''
    });
    const [notificationPrefs, setNotificationPrefs] = useState({
        email: false, // Disabled/unavailable
        sms: true // Enabled by default
    });
    const [isEditing, setIsEditing] = useState(false);

    // Save user profile
    const saveUserProfile = async () => {
        try {
            const updateData = {
                first_name: profileData.username,
                email: profileData.email,
                phone_number: profileData.phone
            };
            const res = await api.put('/users/me', updateData);
            setOriginalProfileData({
                username: res.data.username || '',
                email: res.data.email || '',
                phone: res.data.phone_number || '',
                location: ''
            });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    };

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
                const userData = {
                    username: res.data.username || '',
                    email: res.data.email || '',
                    phone: res.data.phone_number || '',
                    location: '' // Location not stored in backend yet
                };
                setProfileData(userData);
                setOriginalProfileData(userData);
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

    // Delete functions
    const handleDeleteSavedProperty = async (propertyId) => {
        if (window.confirm('Are you sure you want to remove this property from your saved list?')) {
            try {
                await api.delete(`/properties/${propertyId}/save`);
                setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
            } catch (error) {
                console.error('Error deleting saved property:', error);
                alert('Failed to remove property from saved list');
            }
        }
    };

    const handleDeleteInterest = async (interestId) => {
        if (window.confirm('Are you sure you want to delete this interest?')) {
            try {
                await api.delete(`/user/interests/${interestId}`);
                setExpressInterests(prev => prev.filter(i => i.id !== interestId));
            } catch (error) {
                console.error('Error deleting interest:', error);
                alert('Failed to delete interest');
            }
        }
    };

    const handleViewProperty = (propertyId) => {
        navigate(`/properties/${propertyId}`);
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await api.delete(`/appointments/${appointmentId}`);
                setSiteVisits(prev => prev.filter(a => a.id !== appointmentId));
            } catch (error) {
                console.error('Error deleting appointment:', error);
                alert('Failed to cancel appointment');
            }
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete your account?\n\n' +
            'This action cannot be undone. All your data, including:\n' +
            '- Saved properties\n' +
            '- Appointments\n' +
            '- Express interests\n\n' +
            'will be permanently deleted.'
        );

        if (confirmDelete) {
            const finalConfirm = window.prompt(
                'Please type "DELETE" to confirm account deletion:'
            );

            if (finalConfirm === 'DELETE') {
                try {
                    await api.delete('/users/me');
                    alert('Account deleted successfully. You will be logged out.');
                    // Logout will be handled by the API response
                    window.location.href = '/login';
                } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('Failed to delete account. Please try again or contact support.');
                }
            } else {
                alert('Account deletion cancelled.');
            }
        }
    };

    return (
        <div className="dashboard-container">
            {/* Welcome Section with Stats */}
            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <div className="welcome-text">
                        <h1>Welcome back, {profileData.username || user?.username || 'user'}! 🎉</h1>
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
                            {(profileData.username || user?.username || 'user').charAt(0).toUpperCase()}
                        </div>
                        <h2 className="user-name">{profileData.username || user?.username || 'user'}</h2>
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
                                                <h3 className="visit-title">{visit.property_name || 'Site Visit'}</h3>
                                                <div className="visit-meta">
                                                    <div className="visit-meta-item">
                                                        <Calendar size={16} />
                                                        <span>{new Date(visit.appointment_date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="visit-meta-item">
                                                        <MapPin size={16} />
                                                        <span>{visit.unit_type_name || 'Property Unit'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="visit-actions">
                                                <div className="mb-2">{getStatusBadge(visit.status)}</div>
                                                <p className="visit-type">{visit.type === 'viewing' ? 'Property Viewing' : 'Waitlist Join'}</p>
                                                <button
                                                    onClick={() => handleDeleteAppointment(visit.id)}
                                                    className="btn-icon btn-delete"
                                                    title="Cancel Appointment"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
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
                                            <div className="interest-actions">
                                                <div className="mb-2">{getStatusBadge(interest.is_active ? 'Active' : 'Expired')}</div>
                                                <div className="action-buttons">
                                                    {interest.property_id && (
                                                        <button
                                                            onClick={() => handleViewProperty(interest.property_id)}
                                                            className="btn-icon btn-view"
                                                            title="View Property"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteInterest(interest.id)}
                                                        className="btn-icon btn-delete"
                                                        title="Delete Interest"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
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
                                            <div className="saved-actions">
                                                <button
                                                    onClick={() => handleViewProperty(property.id)}
                                                    className="btn-icon btn-view"
                                                    title="View Property"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSavedProperty(property.id)}
                                                    className="btn-icon btn-delete"
                                                    title="Remove from Saved"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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
                                                onClick={saveUserProfile}
                                                className="btn btn-primary"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProfileData(originalProfileData);
                                                    setIsEditing(false);
                                                }}
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
                                <div className="preference-item disabled">
                                    <div className="preference-content">
                                        <h4 className="text-gray-500">Email Notifications</h4>
                                        <p className="text-gray-400">Email notifications are currently unavailable</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" disabled />
                                        <span className="toggle-slider disabled"></span>
                                    </label>
                                </div>
                                <div className="preference-item">
                                    <div className="preference-content">
                                        <h4>SMS Notifications</h4>
                                        <p>Receive booking reminders via SMS</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="danger-zone">
                                <h4 className="danger-title">Delete Account</h4>
                                <p className="danger-text">
                                    Once you delete your account, there is no going back. This action cannot be undone.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="btn btn-danger"
                                >
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