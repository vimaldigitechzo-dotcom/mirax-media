import React, { useEffect, useState, useRef } from 'react';
import adminApi from '../../services/adminApi';
import { Upload, Image as ImageIcon, Trash2, Copy, Check, Filter, X, Film } from 'lucide-react';

export default function MediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [msg, setMsg] = useState('');
  const fileInputRef = useRef(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      const res = await adminApi.getMedia(params);
      if (res.success) setMediaList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [typeFilter]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('category', 'website_assets');

    setUploading(true);
    try {
      const res = await adminApi.uploadMedia(formData);
      if (res.success) {
        setMsg(`${files.length} asset(s) uploaded successfully!`);
        loadMedia();
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media asset permanently?')) return;
    try {
      await adminApi.deleteMedia(id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      setMsg('Media deleted.');
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
            Media Library & Assets
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Upload, store, and manage campaign images and videos via Cloudinary & PostgreSQL
          </p>
        </div>

        <div>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="admin-btn admin-btn-primary"
          >
            <Upload size={16} />
            <span>{uploading ? 'Uploading Files...' : 'Upload Media'}</span>
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {['ALL', 'IMAGE', 'VIDEO'].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              border: typeFilter === type ? '1px solid #b66bff' : '1px solid var(--admin-border)',
              background: typeFilter === type ? 'rgba(182, 107, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: typeFilter === type ? '#fff' : '#9e97aa',
              cursor: 'pointer',
            }}
          >
            {type === 'ALL' ? 'All Media' : type === 'IMAGE' ? 'Images' : 'Videos'}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#b66bff' }}>Loading Media Assets...</div>
        ) : mediaList.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <ImageIcon size={48} style={{ color: '#9e97aa', margin: '0 auto 14px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '6px' }}>Your media library is empty</h3>
            <p style={{ color: '#9e97aa', fontSize: '13px', marginBottom: '18px' }}>
              Upload your high-resolution client logos, campaign banners, and video reels.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="admin-btn admin-btn-secondary"
            >
              <Upload size={14} />
              <span>Select Files to Upload</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {mediaList.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '140px', background: '#000' }}>
                  {item.resourceType === 'VIDEO' ? (
                    <video
                      src={item.secureUrl || item.url}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      controls
                    />
                  ) : (
                    <img
                      src={item.secureUrl || item.url}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: item.resourceType === 'VIDEO' ? '#f59e0b' : '#b66bff',
                    }}
                  >
                    {item.resourceType}
                  </span>
                </div>

                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '12.5px', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
                    {item.title}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <button
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '5px 8px', fontSize: '11px' }}
                      title="Copy URL"
                      onClick={() => handleCopy(item.secureUrl || item.url, item.id)}
                    >
                      {copiedId === item.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    <button
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '5px 8px' }}
                      title="Delete Asset"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
