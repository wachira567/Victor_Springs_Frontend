import React, { useState, useEffect } from 'react';
import { Settings, MessageSquare, Phone, Save, RefreshCw, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const CommunicationSettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    sms_api_key: '',
    sms_sender_phone: '',
    whatsapp_bridge_url: 'http://localhost:3001',
    test_phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [bridgeStatus, setBridgeStatus] = useState('disconnected');
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadSettings();
    checkBridgeStatus();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/communication-settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load communication settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.post('/admin/communication-settings', settings);
      toast.success('Communication settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save communication settings');
    } finally {
      setSaving(false);
    }
  };

  const checkBridgeStatus = async () => {
    try {
      const response = await api.get('/admin/whatsapp-bridge-status');
      setBridgeStatus(response.data.status);
    } catch (error) {
      setBridgeStatus('error');
    }
  };

  const connectWhatsApp = async () => {
    try {
      setTestingConnection(true);
      const response = await api.post('/admin/connect-whatsapp');
      if (response.data.qr_code) {
        setQrCode(response.data.qr_code);
        toast.info('Scan the QR code with WhatsApp to connect');
      }
    } catch (error) {
      console.error('Failed to get QR code:', error);
      toast.error('Failed to generate WhatsApp QR code');
    } finally {
      setTestingConnection(false);
    }
  };

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      await api.post('/admin/test-connection', {
        phone: settings.test_phone || '+254700000000'
      });
      toast.success('Test message sent! Check your phone.');
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Test message failed to send');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Communication Settings</h1>
        <p className="text-gray-600">Configure WhatsApp and SMS settings for automated notifications and live chat</p>
      </div>

      {/* Status Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                bridgeStatus === 'connected' ? 'bg-green-500' :
                bridgeStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <h3 className="font-semibold">WhatsApp Bridge</h3>
            </div>
            <Phone className="text-gray-400" size={20} />
          </div>
          <p className="text-sm text-gray-600 capitalize">{bridgeStatus}</p>
          <button
            onClick={checkBridgeStatus}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Refresh Status
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="font-semibold">SMS Gateway</h3>
            </div>
            <MessageSquare className="text-gray-400" size={20} />
          </div>
          <p className="text-sm text-gray-600">
            {settings.sms_api_key ? 'Configured' : 'Not configured'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <h3 className="font-semibold">Live Chat</h3>
            </div>
            <Settings className="text-gray-400" size={20} />
          </div>
          <p className="text-sm text-gray-600">Widget active</p>
        </div>
      </div>

      {/* WhatsApp Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Phone className="text-green-600" size={24} />
          WhatsApp Settings
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin WhatsApp Number
            </label>
            <input
              type="tel"
              value={settings.whatsapp_number}
              onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
              placeholder="+254700000000"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Number that receives website chat messages</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bridge URL
            </label>
            <input
              type="url"
              value={settings.whatsapp_bridge_url}
              onChange={(e) => handleInputChange('whatsapp_bridge_url', e.target.value)}
              placeholder="http://localhost:3001"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* WhatsApp Connection */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">WhatsApp Connection</h3>

          {!qrCode ? (
            <div className="flex items-center gap-4">
              <button
                onClick={connectWhatsApp}
                disabled={testingConnection}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {testingConnection ? <RefreshCw className="animate-spin" size={16} /> : <QrCode size={16} />}
                {testingConnection ? 'Generating...' : 'Connect WhatsApp'}
              </button>
              <p className="text-sm text-gray-600">
                Click to generate QR code for WhatsApp Web connection
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-sm text-gray-600">
                Scan this QR code with WhatsApp on your phone:
              </p>
              <div className="inline-block p-4 bg-white rounded-lg border">
                <pre className="text-xs font-mono whitespace-pre-wrap">{qrCode}</pre>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                QR code expires in 60 seconds. Refresh if needed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SMS Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="text-blue-600" size={24} />
          SMS Settings (httpSMS)
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              httpSMS API Key
            </label>
            <input
              type="password"
              value={settings.sms_api_key}
              onChange={(e) => handleInputChange('sms_api_key', e.target.value)}
              placeholder="uk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">From httpSMS Android app</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Phone Number
            </label>
            <input
              type="tel"
              value={settings.sms_sender_phone}
              onChange={(e) => handleInputChange('sms_sender_phone', e.target.value)}
              placeholder="+254700000000"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Your phone number for sending SMS</p>
          </div>
        </div>
      </div>

      {/* Testing Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Testing</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Phone Number
            </label>
            <input
              type="tel"
              value={settings.test_phone}
              onChange={(e) => handleInputChange('test_phone', e.target.value)}
              placeholder="+254700000000"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={testConnection}
              disabled={testingConnection || !settings.test_phone}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {testingConnection ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
              Send Test Message
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold"
        >
          {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>WhatsApp:</strong> Website visitors can chat directly with you via WhatsApp</li>
          <li>• <strong>SMS:</strong> Automatic fallback for notifications when WhatsApp fails</li>
          <li>• <strong>Quoted Replies:</strong> Swipe right on WhatsApp messages to reply to specific visitors</li>
          <li>• <strong>Live Chat:</strong> Tawk.to widget as backup when WhatsApp is unavailable</li>
        </ul>
      </div>
    </div>
  );
};

export default CommunicationSettings;