import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Plus, Edit2, Trash2, Check, X, Share2, Layers } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    category: '',
    description: '',
    iconName: 'TrendingUp',
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getServices();
      if (res.success) setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      number: String(services.length + 1).padStart(2, '0'),
      title: '',
      category: 'Digital Marketing',
      description: '',
      iconName: 'TrendingUp',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingId(service.id);
    setFormData({
      number: service.number,
      title: service.title,
      category: service.category,
      description: service.description,
      iconName: service.iconName || 'TrendingUp',
      isPublished: service.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateService(editingId, formData);
        setMsg('Service updated successfully.');
      } else {
        await adminApi.createService(formData);
        setMsg('New service created successfully.');
      }
      setModalOpen(false);
      loadServices();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await adminApi.deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setMsg('Service deleted.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete service');
    }
  };

  const handleTogglePublish = async (service) => {
    try {
      await adminApi.updateService(service.id, { isPublished: !service.isPublished });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isPublished: !s.isPublished } : s))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="admin-card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-card-title" style={{ fontSize: '20px' }}>
            Services Management
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Add, edit, and organize services displayed on the public website
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-cerulean)' }}>Loading Services...</div>
        ) : services.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9e97aa' }}>
            No services configured yet.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service Title</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--admin-cerulean)' }}>{item.number}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{item.title}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#9e97aa', fontSize: '12px' }}>{item.category}</span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '12.5px', color: '#9e97aa' }}>
                      {item.description}
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(item)}
                        style={{
                          background: item.isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: item.isPublished ? '#10b981' : '#ef4444',
                          border: item.isPublished ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {item.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 10px' }}
                          onClick={() => openEditModal(item)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-card-title">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button
                className="admin-btn admin-btn-secondary"
                style={{ padding: '4px' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Number</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={formData.number}
                    placeholder="01"
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Service Title</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={formData.title}
                    placeholder="e.g., Search Engine Optimization"
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Category</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={formData.category}
                  placeholder="e.g., Organic Growth"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Service Description</label>
                <textarea
                  required
                  className="admin-textarea"
                  value={formData.description}
                  placeholder="Detailed description of what clients receive with this service..."
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <label htmlFor="pubCheck" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                  Publish immediately to public website
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                  {saving ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
