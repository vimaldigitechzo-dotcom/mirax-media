import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Plus, Edit2, Trash2, X, FileText } from 'lucide-react';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    authorName: 'MIRAX Team',
    category: 'Digital Marketing',
    status: 'DRAFT',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getBlogs();
      if (res.success) setBlogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      authorName: 'MIRAX Growth Team',
      category: 'SEO & Growth Strategy',
      status: 'PUBLISHED',
    });
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content,
      authorName: blog.authorName || 'MIRAX Team',
      category: blog.category || 'Digital Marketing',
      status: blog.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.updateBlog(editingId, formData);
        setMsg('Blog post updated.');
      } else {
        await adminApi.createBlog(formData);
        setMsg('Blog post published.');
      }
      setModalOpen(false);
      loadBlogs();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await adminApi.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      setMsg('Blog post deleted.');
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
            Blog & Thought Leadership
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Publish marketing insights, SEO guides, and agency news
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={16} />
          <span>Write New Post</span>
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#b66bff' }}>Loading Blog Posts...</div>
        ) : blogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9e97aa' }}>
            No blog articles written yet. Click "Write New Post" to start sharing digital growth strategies.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{b.title}</strong>
                      <div style={{ color: '#9e97aa', fontSize: '11px' }}>slug: /{b.slug}</div>
                    </td>
                    <td>{b.category}</td>
                    <td>{b.authorName}</td>
                    <td>
                      <span className={`status-pill ${b.status === 'PUBLISHED' ? 'status-completed' : 'status-rejected'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#9e97aa' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
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
          <div className="admin-modal" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-card-title">{editingId ? 'Edit Article' : 'Write New Article'}</h2>
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
                <label className="admin-form-label">Article Title</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  value={formData.title}
                  placeholder="e.g., How to Scale D2C Brands with High-ROI Meta Ads in 2026"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.category}
                    placeholder="Performance Marketing"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Publish Status</label>
                  <select
                    className="admin-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="DRAFT">DRAFT (Hidden)</option>
                    <option value="PUBLISHED">PUBLISHED (Live)</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Summary / Excerpt</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.excerpt}
                  placeholder="Short teaser description shown on previews..."
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Article Content</label>
                <textarea
                  required
                  className="admin-textarea"
                  style={{ minHeight: '180px' }}
                  value={formData.content}
                  placeholder="Write full article body content..."
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
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
                  {saving ? 'Saving...' : editingId ? 'Update Post' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
