import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { Globe, Save, CheckCircle } from 'lucide-react';

export default function SeoPage() {
  const [seoList, setSeoList] = useState([]);
  const [selectedPath, setSelectedPath] = useState('/');
  const [formData, setFormData] = useState({
    pagePath: '/',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadSeo = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSeoSettings();
      if (res.success) {
        setSeoList(res.data);
        const current = res.data.find((s) => s.pagePath === selectedPath);
        if (current) {
          setFormData(current);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeo();
  }, []);

  const handleSelectPage = (path) => {
    setSelectedPath(path);
    const item = seoList.find((s) => s.pagePath === path);
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        pagePath: path,
        metaTitle: 'MIRAX MEDIA | Digital Growth Agency',
        metaDescription: '',
        metaKeywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '/mirax-logo.jpg',
        canonicalUrl: `https://mirax-media-alpha.vercel.app${path === '/' ? '' : path}`,
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.updateSeoSetting(formData);
      if (res.success) {
        setMsg(`SEO settings saved for ${selectedPath}`);
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const PAGES = [
    { path: '/', label: 'Home Page (/)' },
    { path: '/services', label: 'Services (/services)' },
    { path: '/works', label: 'Portfolio (/works)' },
    { path: '/contact', label: 'Contact (/contact)' },
  ];

  return (
    <div>
      <div className="admin-card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-card-title" style={{ fontSize: '20px' }}>
            SEO & Social Metadata Management
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Configure Google search titles, descriptions, and Open Graph social sharing cards
          </p>
        </div>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      {/* Page Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {PAGES.map((p) => (
          <button
            key={p.path}
            onClick={() => handleSelectPage(p.path)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedPath === p.path ? '1px solid var(--admin-cerulean)' : '1px solid var(--admin-border)',
              background: selectedPath === p.path ? 'rgba(0, 150, 255, 0.22)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedPath === p.path ? '#fff' : '#9CA3AF',
              boxShadow: selectedPath === p.path ? '0 0 10px rgba(0, 150, 255, 0.25)' : 'none',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <form onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-form-label">Search Engine Title (Meta Title)</label>
            <input
              type="text"
              required
              className="admin-input"
              value={formData.metaTitle}
              placeholder="e.g., MIRAX MEDIA | Results-Driven Digital Marketing Agency"
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            />
            <span style={{ fontSize: '11px', color: '#9e97aa' }}>
              Recommended length: 50-60 characters
            </span>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Meta Description (Snippet in Google)</label>
            <textarea
              className="admin-textarea"
              style={{ minHeight: '80px' }}
              value={formData.metaDescription || ''}
              placeholder="High-converting description that appears in Google search engine result snippets..."
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            />
            <span style={{ fontSize: '11px', color: '#9e97aa' }}>
              Recommended length: 140-160 characters
            </span>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Meta Keywords</label>
            <input
              type="text"
              className="admin-input"
              value={formData.metaKeywords || ''}
              placeholder="digital marketing agency, SEO, Meta ads, performance growth"
              onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Open Graph Social Title</label>
              <input
                type="text"
                className="admin-input"
                value={formData.ogTitle || ''}
                placeholder="Title when shared on WhatsApp/LinkedIn"
                onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Social Share Image URL</label>
              <input
                type="text"
                className="admin-input"
                value={formData.ogImage || ''}
                placeholder="/mirax-logo.jpg or https://..."
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Canonical URL</label>
            <input
              type="url"
              className="admin-input"
              value={formData.canonicalUrl || ''}
              placeholder="https://mirax-media-alpha.vercel.app/"
              onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save SEO Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
