import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { FileText, Save, CheckCircle, RefreshCw } from 'lucide-react';

export default function ContentPage() {
  const [contents, setContents] = useState([]);
  const [activeSection, setActiveSection] = useState('hero');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    bodyText: '',
    buttonText: '',
    buttonLink: '',
    isEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadContent = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getContent();
      if (res.success) {
        setContents(res.data);
        const current = res.data.find((c) => c.sectionKey === activeSection);
        if (current) {
          setFormData({
            title: current.title || '',
            subtitle: current.subtitle || '',
            bodyText: current.bodyText || '',
            buttonText: current.buttonText || '',
            buttonLink: current.buttonLink || '',
            isEnabled: current.isEnabled !== undefined ? current.isEnabled : true,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSelectSection = (key) => {
    setActiveSection(key);
    const item = contents.find((c) => c.sectionKey === key);
    if (item) {
      setFormData({
        title: item.title || '',
        subtitle: item.subtitle || '',
        bodyText: item.bodyText || '',
        buttonText: item.buttonText || '',
        buttonLink: item.buttonLink || '',
        isEnabled: item.isEnabled !== undefined ? item.isEnabled : true,
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        bodyText: '',
        buttonText: '',
        buttonLink: '',
        isEnabled: true,
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.updateContent(activeSection, formData);
      if (res.success) {
        setContents((prev) => {
          const idx = prev.findIndex((c) => c.sectionKey === activeSection);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = res.data;
            return next;
          }
          return [...prev, res.data];
        });
        setMsg(`"${activeSection.toUpperCase()}" section published live to public website!`);
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update section content');
    } finally {
      setSaving(false);
    }
  };

  const SECTIONS = [
    { key: 'hero', label: 'Hero Stage' },
    { key: 'about', label: 'About Agency' },
    { key: 'cta', label: 'Call-to-Action Banner' },
  ];

  return (
    <div>
      <div className="admin-card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-card-title" style={{ fontSize: '20px' }}>
            Website Content Management (CMS)
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Edit public website headlines, paragraphs, and buttons without touching source code
          </p>
        </div>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{msg}</span>
        </div>
      )}

      {/* Section Selector Tabs */}
      <div className="admin-tabs-row">
        {SECTIONS.map((sec) => (
          <button
            key={sec.key}
            type="button"
            onClick={() => handleSelectSection(sec.key)}
            className={`admin-tab-btn ${activeSection === sec.key ? 'active' : ''}`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Content Form Card */}
      <div className="admin-card">
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="admin-card-title">
              Editing: <span style={{ color: 'var(--admin-cerulean)' }}>{activeSection.toUpperCase()}</span>
            </h2>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              />
              <span>Section Visible on Public Website</span>
            </label>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Category / Eyebrow Subtitle</label>
            <input
              type="text"
              className="admin-input"
              value={formData.subtitle}
              placeholder="e.g., DIGITAL MARKETING & GROWTH AGENCY"
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Main Heading / Title</label>
            <input
              type="text"
              required
              className="admin-input"
              value={formData.title}
              placeholder="e.g., Where Strategy meets Digital Growth."
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description / Paragraph Body</label>
            <textarea
              className="admin-textarea"
              style={{ minHeight: '140px' }}
              value={formData.bodyText}
              placeholder="Enter the main body paragraph displayed to visitors..."
              onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
            />
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-form-label">Button Label</label>
              <input
                type="text"
                className="admin-input"
                value={formData.buttonText}
                placeholder="e.g., Explore Our Services"
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Button Link / Target Anchor</label>
              <input
                type="text"
                className="admin-input"
                value={formData.buttonLink}
                placeholder="e.g., #services or https://..."
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              <Save size={16} />
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
