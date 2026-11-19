import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Plus, Edit2, Trash2, Star, X } from 'lucide-react';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    designation: '',
    company: '',
    feedback: '',
    rating: 5,
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTestimonials();
      if (res.success) setTestimonials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      clientName: '',
      designation: 'Founder & CEO',
      company: 'Tech Brand',
      feedback: '',
      rating: 5,
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingId(t.id);
    setFormData({
      clientName: t.clientName,
      designation: t.designation || '',
      company: t.company || '',
      feedback: t.feedback,
      rating: t.rating || 5,
      isPublished: t.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateTestimonial(editingId, formData);
        setMsg('Testimonial updated.');
      } else {
        await adminApi.createTestimonial(formData);
        setMsg('Testimonial created.');
      }
      setModalOpen(false);
      loadTestimonials();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await adminApi.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      setMsg('Testimonial deleted.');
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
            Customer Testimonials
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Manage client reviews, ratings, and social proof displayed to visitors
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-cerulean)' }}>Loading Testimonials...</div>
        ) : testimonials.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9e97aa' }}>
            No testimonials added yet. Click "Add Testimonial" to create your first client recommendation.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Designation / Company</th>
                  <th>Rating</th>
                  <th>Feedback</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{t.clientName}</strong>
                    </td>
                    <td>
                      {t.designation} {t.company ? `at ${t.company}` : ''}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} size={13} fill="#f59e0b" />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '12.5px', color: '#9e97aa' }}>
                      "{t.feedback}"
                    </td>
                    <td>
                      <span className={`status-pill ${t.isPublished ? 'status-completed' : 'status-rejected'}`}>
                        {t.isPublished ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 10px' }}
                          onClick={() => openEditModal(t)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleDelete(t.id)}
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
              <h2 className="admin-card-title">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h2>
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
                <label className="admin-form-label">Client Name</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={formData.clientName}
                  placeholder="e.g., Rajesh Sharma"
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Designation / Role</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.designation}
                    placeholder="e.g., Managing Director"
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Company / Brand</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.company}
                    placeholder="e.g., Apex Ventures"
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Customer Feedback Quote</label>
                <textarea
                  required
                  className="admin-textarea"
                  value={formData.feedback}
                  placeholder="What the client said about MIRAX MEDIA's marketing performance..."
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', alignItems: 'center' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Star Rating</label>
                  <select
                    className="admin-select"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                  </select>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                    <span>Publish to Public Website</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
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
                  {saving ? 'Saving...' : editingId ? 'Update Review' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
