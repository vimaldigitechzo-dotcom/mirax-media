import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Plus, Edit2, Trash2, Star, ExternalLink, X, Image as ImageIcon } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    metric: '',
    description: '',
    coverImage: '',
    videoUrl: '',
    projectUrl: '',
    isFeatured: false,
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProjects();
      if (res.success) setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Performance Marketing',
      metric: '+120% Growth',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      videoUrl: '',
      projectUrl: '',
      isFeatured: false,
      isPublished: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      category: project.category,
      metric: project.metric || '',
      description: project.description || '',
      coverImage: project.coverImage,
      videoUrl: project.videoUrl || '',
      projectUrl: project.projectUrl || '',
      isFeatured: project.isFeatured,
      isPublished: project.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateProject(editingId, formData);
        setMsg('Project updated successfully.');
      } else {
        await adminApi.createProject(formData);
        setMsg('New project added to portfolio.');
      }
      setModalOpen(false);
      loadProjects();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio project?')) return;
    try {
      await adminApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setMsg('Project deleted.');
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
            Portfolio & Works Management
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Showcase your agency campaigns, creative results, and growth metrics
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>Add New Project</span>
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-cerulean)' }}>Loading Projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9e97aa' }}>
            No portfolio projects added yet.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Project Title</th>
                  <th>Category</th>
                  <th>Metric Badge</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        style={{ width: '50px', height: '36px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{item.title}</strong>
                      {item.description && (
                        <div style={{ color: '#9e97aa', fontSize: '11px', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ color: '#9e97aa', fontSize: '12px' }}>{item.category}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--admin-cerulean)', fontWeight: 700, fontSize: '12px', background: 'var(--admin-cerulean-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                        {item.metric || 'Case Study'}
                      </span>
                    </td>
                    <td>
                      {item.isFeatured ? (
                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}>
                          <Star size={12} fill="#f59e0b" /> Featured
                        </span>
                      ) : (
                        <span style={{ color: '#9e97aa', fontSize: '11px' }}>Standard</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${item.isPublished ? 'status-completed' : 'status-rejected'}`}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
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

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-card-title">{editingId ? 'Edit Project' : 'Add New Portfolio Project'}</h2>
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
                <label className="admin-form-label">Project Title</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={formData.title}
                  placeholder="e.g., D2C Brand Scale Campaign"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={formData.category}
                    placeholder="Performance Marketing"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Metric Badge</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.metric}
                    placeholder="e.g., 4.8x ROAS or +312% Growth"
                    onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Cover Image URL</label>
                <input
                  type="url"
                  required
                  className="admin-input"
                  value={formData.coverImage}
                  placeholder="https://..."
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Project Description</label>
                <textarea
                  className="admin-textarea"
                  value={formData.description}
                  placeholder="Briefly describe the campaign, tactics used, and outcomes achieved..."
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', margin: '16px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Mark as Featured Project</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  <span>Publish to Public Website</span>
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
                  {saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
