import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import adminApi from '../../services/adminApi';
import { User, Lock, CheckCircle, Save, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { admin, updateCurrentAdmin } = useAdminAuth();
  const [fullName, setFullName] = useState(admin?.fullName || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await adminApi.updateProfile({ fullName });
      if (res.success) {
        updateCurrentAdmin(res.data);
        setProfileMsg('Profile updated successfully.');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdErr('');
    setPwdMsg('');

    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPwdErr('New password must be at least 8 characters long.');
      return;
    }

    setPwdSaving(true);
    try {
      const res = await adminApi.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPwdMsg('Password updated successfully. Please use your new password next time.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdMsg(''), 4000);
      }
    } catch (err) {
      setPwdErr(err.message || 'Failed to change password');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="admin-card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-card-title" style={{ fontSize: '20px' }}>
            Profile & Security Settings
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Manage your administrator credentials and account security
          </p>
        </div>
      </div>

      {/* Account Info & Name Card */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <h2 className="admin-card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="#b66bff" />
          <span>Account Information</span>
        </h2>

        {profileMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Email Address (Read-only)</label>
              <input
                type="text"
                disabled
                className="admin-input"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                value={admin?.email || ''}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Assigned Role</label>
              <input
                type="text"
                disabled
                className="admin-input"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                value={admin?.role || 'ADMIN'}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Full Display Name</label>
            <input
              type="text"
              required
              className="admin-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="submit"
              disabled={profileSaving}
              className="admin-btn admin-btn-primary"
            >
              <Save size={15} />
              <span>{profileSaving ? 'Saving...' : 'Update Name'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="admin-card">
        <h2 className="admin-card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="#b66bff" />
          <span>Change Password</span>
        </h2>

        {pwdMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            {pwdMsg}
          </div>
        )}

        {pwdErr && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            {pwdErr}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="admin-form-group">
            <label className="admin-form-label">Current Password</label>
            <input
              type="password"
              required
              className="admin-input"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">New Password (Min 8 characters)</label>
              <input
                type="password"
                required
                minLength={8}
                className="admin-input"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="admin-input"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="submit"
              disabled={pwdSaving}
              className="admin-btn admin-btn-primary"
            >
              <Shield size={15} />
              <span>{pwdSaving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
