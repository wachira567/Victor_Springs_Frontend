import { useEffect, useState, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Heart, Settings, User, MapPin, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

const ClientDashboard = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [savedVenues, setSavedVenues] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings');
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: '', // We'll need to get this from backend
        phone: '',
        location: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Fetch USER specific bookings
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my-bookings');
                setBookings(res.data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                toast.error('Failed to load your bookings');
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

        fetchBookings();
        fetchUserProfile();
    }, []);

    const getStatusBadge = (status) => {
        if (status === 'Approved') return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold"><CheckCircle size={14}/> Approved</span>;
        if (status === 'Rejected') return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold"><XCircle size={14}/> Rejected</span>;
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold"><Clock size={14}/> Pending</span>;
    };

    // Calculate some stats for gamification
    const totalBookings = bookings.length;
    const approvedBookings = bookings.filter(b => b.status === 'Approved').length;
    const totalSpent = bookings.reduce((sum, b) => sum + b.total_cost, 0);

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Welcome Section with Stats */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-xl mb-8 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}! 🎉</h1>
                        <p className="text-indigo-100">Ready to plan your next amazing event?</p>
                    </div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{totalBookings}</div>
                            <div className="text-sm text-indigo-100">Total Bookings</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{approvedBookings}</div>
                            <div className="text-sm text-indigo-100">Approved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">KES {totalSpent.toLocaleString()}</div>
                            <div className="text-sm text-indigo-100">Total Spent</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="text-green-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Book New Event</h3>
                            <p className="text-sm text-gray-600">Find your perfect venue</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-pink-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Heart className="text-pink-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Browse Saved</h3>
                            <p className="text-sm text-gray-600">Your favorite venues</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Settings className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Update Profile</h3>
                            <p className="text-sm text-gray-600">Manage your account</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center mb-6">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-600">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="font-bold text-xl">{user?.username}</h2>
                        <p className="text-gray-500 text-sm">Client</p>
                    </div>

                    <nav className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <button onClick={() => setActiveTab('bookings')} className={`w-full text-left p-4 font-medium hover:bg-gray-50 border-b ${activeTab === 'bookings' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                            My Bookings
                        </button>
                        <button onClick={() => setActiveTab('saved')} className={`w-full text-left p-4 font-medium hover:bg-gray-50 border-b ${activeTab === 'saved' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                            Saved Venues
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`w-full text-left p-4 font-medium hover:bg-gray-50 ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                            Account Settings
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-6">
                        {activeTab === 'bookings' && "My Event Bookings"}
                        {activeTab === 'saved' && "Saved Properties"}
                        {activeTab === 'settings' && "Account Settings"}
                    </h1>

                    {activeTab === 'bookings' && (
                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <div className="bg-white p-10 rounded-xl text-center text-gray-500 shadow">
                                    You haven't made any bookings yet.
                                </div>
                            ) : (
                                bookings.map((booking) => (
                                    <div key={booking.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-600 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">Booking #{booking.id}</h3>
                                            <div className="flex items-center gap-4 text-gray-500 mt-2">
                                                <span className="flex items-center gap-1"><Calendar size={16}/> {new Date(booking.event_date).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{booking.guest_count} Guests</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-2">{getStatusBadge(booking.status)}</div>
                                            <p className="font-bold text-gray-900">KES {booking.total_cost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-pink-50 to-red-50 p-6 rounded-xl border border-pink-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <Heart className="text-pink-500" size={24} />
                                    <h3 className="text-xl font-bold text-gray-800">Saved Venues</h3>
                                </div>
                                <p className="text-gray-600 mb-4">Venues you've saved for later. Heart venues on the venue list to add them here!</p>

                                {/* Mock saved venues - in real app, fetch from backend */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold">Nairobi Arboretum</h4>
                                            <Heart className="text-pink-500 fill-current" size={20} />
                                        </div>
                                        <p className="text-sm text-gray-600">Perfect for outdoor weddings</p>
                                        <p className="text-sm font-medium text-indigo-600 mt-2">KES 50,000/day</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold">Koinange Grand Hall</h4>
                                            <Heart className="text-pink-500 fill-current" size={20} />
                                        </div>
                                        <p className="text-sm text-gray-600">Elegant indoor venue</p>
                                        <p className="text-sm font-medium text-indigo-600 mt-2">KES 75,000/day</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <Settings className="text-indigo-600" size={24} />
                                    <h3 className="text-xl font-bold">Account Settings</h3>
                                </div>

                                <div className="space-y-6">
                                    {/* Profile Information */}
                                    <div className="border-b pb-6">
                                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                                            <User size={18} />
                                            Profile Information
                                        </h4>

                                        {!isEditing ? (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">Username:</span>
                                                    <span>{profileData.username}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">Email:</span>
                                                    <span>{profileData.email || 'Not set'}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">Phone:</span>
                                                    <span>{profileData.phone || 'Not set'}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <span className="font-medium">Location:</span>
                                                    <span>{profileData.location || 'Not set'}</span>
                                                </div>
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    Edit Profile
                                                </button>
                                            </div>
                                        ) : (
                                            <form className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Username</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.username}
                                                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                                    <input
                                                        type="tel"
                                                        value={profileData.phone}
                                                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Location</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.location}
                                                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // Save profile logic here
                                                            toast.success('Profile updated successfully!');
                                                            setIsEditing(false);
                                                        }}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditing(false)}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>

                                    {/* Account Preferences */}
                                    <div className="border-b pb-6">
                                        <h4 className="font-semibold mb-4">Account Preferences</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">Email Notifications</p>
                                                    <p className="text-sm text-gray-600">Receive booking updates via email</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">SMS Notifications</p>
                                                    <p className="text-sm text-gray-600">Receive booking reminders via SMS</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div>
                                        <h4 className="font-semibold mb-4 text-red-600">Danger Zone</h4>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <h5 className="font-medium text-red-800 mb-2">Delete Account</h5>
                                            <p className="text-sm text-red-600 mb-3">
                                                Once you delete your account, there is no going back. This action cannot be undone.
                                            </p>
                                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;