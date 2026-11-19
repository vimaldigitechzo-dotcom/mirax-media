import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Settings, Save, CheckCircle, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    site_name: 'MIRAX MEDIA',
    tagline: 'Where Strategy meets Digital Growth.',
    contact_email: 'miraxcontact@gmail.com',
    contact_phone: '+91 7200405822',
    address: 'India (Pan-India & Global)',
    working_hours: 'Mon – Sat (9:00 AM – 7:00 PM IST)',
    copyright: '© 2026 MIRAX MEDIA. All rights reserved.',
    instagram_url: 'https://instagram.com/miraxmedia',
    linkedin_url: 'https://linkedin.com/company/miraxmedia',
    whatsapp_number: '+917200405822',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSettings();
      if (res.success && res.map) {
        setSettings((prev) => ({ ...prev, ...res.map }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.updateSettings(settings);
      if (res.success) {
        setMsg('Website settings updated successfully! Live website refreshed.');
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-card-title" style={{ fontSize: '20px' }}>
            Website & Company Settings
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Manage official agency phone number, notification email, business hours, and social media links
          </p>
        </div>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Contact Info Card */}
        <div className="admin-card">
          <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>
            Primary Contact & Notification Channels
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Official Notification Email</label>
              <input
                type="email"
                required
                className="admin-input"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
              />
              <span style={{ fontSize: '11px', color: '#9e97aa' }}>
                All website leads and enquiries will be dispatched to this inbox.
              </span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Official Phone Number</label>
              <input
                type="text"
                required
                className="admin-input"
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
              />
              <span style={{ fontSize: '11px', color: '#9e97aa' }}>
                Displayed across website header, contact card, and footer.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Headquarters / Location</label>
              <input
                type="text"
                className="admin-input"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Working Hours</label>
              <input
                type="text"
                className="admin-input"
                value={settings.working_hours}
                onChange={(e) => handleChange('working_hours', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Branding & Social Links Card */}
        <div className="admin-card">
          <h2 className="admin-card-title" style={{ marginBottom: '16px' }}>
            Branding & Social Presence
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Agency Name</label>
              <input
                type="text"
                required
                className="admin-input"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Tagline</label>
              <input
                type="text"
                className="admin-input"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Instagram Profile URL</label>
              <input
                type="url"
                className="admin-input"
                value={settings.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">LinkedIn Page URL</label>
              <input
                type="url"
                className="admin-input"
                value={settings.linkedin_url}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">WhatsApp Contact Number</label>
              <input
                type="text"
                className="admin-input"
                value={settings.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Footer Copyright Notice</label>
            <input
              type="text"
              className="admin-input"
              value={settings.copyright}
              onChange={(e) => handleChange('copyright', e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ padding: '12px 28px', fontSize: '14px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving Settings...' : 'Save All Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
