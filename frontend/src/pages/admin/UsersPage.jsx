import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Users, Plus, Shield, Trash2, X, Check, Lock } from 'lucide-react';

export default function UsersPage() {
  const { admin: currentAdmin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.createUser(formData);
      if (res.success) {
        setMsg('Administrator created successfully.');
        setModalOpen(false);
        setFormData({ fullName: '', email: '', password: '', role: 'ADMIN' });
        loadUsers();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u) => {
    if (u.id === currentAdmin.id) {
      alert('You cannot deactivate your own account.');
      return;
    }
    try {
      await adminApi.updateUser(u.id, { isActive: !u.isActive });
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, isActive: !u.isActive } : item))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentAdmin.id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this administrator account?')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setMsg('User deleted.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="admin-card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-card-title" style={{ fontSize: '20px' }}>
            Admin User Management & RBAC
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Manage administrative access with role-based permissions (Super Admin, Admin, Editor)
          </p>
        </div>

        {currentAdmin?.role === 'SUPER_ADMIN' && (
          <button onClick={() => setModalOpen(true)} className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Create New Admin</span>
          </button>
        )}
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#b66bff' }}>Loading Administrators...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="admin-avatar">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: '#fff' }}>{u.fullName}</strong>
                          <div style={{ color: '#9e97aa', fontSize: '12px' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: u.role === 'SUPER_ADMIN' ? 'rgba(139, 61, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                          color: u.role === 'SUPER_ADMIN' ? '#b66bff' : '#fff',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={u.id === currentAdmin.id}
                        style={{
                          background: u.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.isActive ? '#10b981' : '#ef4444',
                          border: u.isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: u.id === currentAdmin.id ? 'default' : 'pointer',
                        }}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td style={{ fontSize: '12px', color: '#9e97aa' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never logged in'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#9e97aa' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.id !== currentAdmin.id && currentAdmin?.role === 'SUPER_ADMIN' && (
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px 10px' }}
                          title="Delete Admin"
                          onClick={() => handleDelete(u.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-card-title">Create Administrator Account</h2>
              <button
                className="admin-btn admin-btn-secondary"
                style={{ padding: '4px' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={formData.fullName}
                  placeholder="e.g., Harish Kumar"
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="admin-input"
                  value={formData.email}
                  placeholder="admin@miraxmedia.in"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="admin-input"
                  value={formData.password}
                  placeholder="Minimum 8 characters"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Role Assignment</label>
                <select
                  className="admin-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="ADMIN">Admin (Content, Inquiries & Media)</option>
                  <option value="EDITOR">Editor (Content & Media)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn admin-btn-primary"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
