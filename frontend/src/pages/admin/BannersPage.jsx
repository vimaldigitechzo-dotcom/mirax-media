import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Plus, Edit2, Trash2, X, Layers } from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    imageUrl: '',
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getBanners();
      if (res.success) setBanners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      ctaText: 'Explore More',
      ctaLink: '#services',
      imageUrl: '/mirax-logo.jpg',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      ctaText: banner.ctaText || '',
      ctaLink: banner.ctaLink || '',
      imageUrl: banner.imageUrl || '',
      isPublished: banner.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateBanner(editingId, formData);
        setMsg('Banner updated.');
      } else {
        await adminApi.createBanner(formData);
        setMsg('Banner created.');
      }
      setModalOpen(false);
      loadBanners();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await adminApi.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      setMsg('Banner deleted.');
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
            Banner Management
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Configure hero and promotional banners for your agency website
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>Add New Banner</span>
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#b66bff' }}>Loading Banners...</div>
        ) : banners.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9e97aa' }}>
            No banners created yet. Click "Add New Banner" to add your first promotional spotlight.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subtitle</th>
                  <th>CTA Button</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{b.title}</strong>
                    </td>
                    <td>{b.subtitle || '—'}</td>
                    <td>
                      {b.ctaText ? (
                        <span style={{ color: '#b66bff' }}>
                          {b.ctaText} ({b.ctaLink})
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${b.isPublished ? 'status-completed' : 'status-rejected'}`}>
                        {b.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 10px' }}
                          onClick={() => openEditModal(b)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleDelete(b.id)}
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

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-card-title">{editingId ? 'Edit Banner' : 'New Banner'}</h2>
              <button
                className="admin-btn admin-btn-secondary"
                style={{ padding: '4px' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label className="admin-form-label">Banner Title</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={formData.title}
                  placeholder="e.g., Growth Acceleration Q1"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Subtitle</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.subtitle}
                  placeholder="e.g., Special Agency Retainer"
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">CTA Text</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.ctaText}
                    placeholder="e.g., Get Started"
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">CTA Link</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.ctaLink}
                    placeholder="#contact"
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Banner Image URL</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.imageUrl}
                  placeholder="https://... or /mirax-logo.jpg"
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
                <input
                  type="checkbox"
                  id="bPub"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <label htmlFor="bPub" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                  Publish Banner Immediately
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
                  {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
