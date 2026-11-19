import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  Briefcase,
  Share2,
  Image,
  MessageSquare,
  Layers,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await adminApi.getDashboardStats();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--admin-cerulean)', padding: '40px', textAlign: 'center' }}>Loading Dashboard Analytics...</div>;
  }

  if (error) {
    return (
      <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '16px', borderRadius: '8px', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  const counts = data?.counts || {};
  const recentInquiries = data?.recentInquiries || [];
  const recentMedia = data?.recentMedia || [];

  return (
    <div>
      {/* Top Banner KPI Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>New Inquiries</h3>
            <div className="stat-number" style={{ color: '#10b981' }}>
              {counts.newInquiries || 0}
            </div>
          </div>
          <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>Total Leads</h3>
            <div className="stat-number">{counts.totalInquiries || 0}</div>
          </div>
          <div className="admin-stat-icon">
            <MessageSquare size={22} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>Active Services</h3>
            <div className="stat-number">{counts.totalServices || 0}</div>
          </div>
          <div className="admin-stat-icon">
            <Share2 size={22} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>Portfolio Projects</h3>
            <div className="stat-number">{counts.totalProjects || 0}</div>
          </div>
          <div className="admin-stat-icon">
            <Briefcase size={22} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-info">
            <h3>Media Assets</h3>
            <div className="stat-number">{(counts.totalImages || 0) + (counts.totalVideos || 0)}</div>
          </div>
          <div className="admin-stat-icon">
            <Image size={22} />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <NavLink to="/admin/inquiries" className="admin-btn admin-btn-primary">
            <MessageSquare size={15} />
            <span>Review Customer Inquiries</span>
          </NavLink>
          <NavLink to="/admin/projects" className="admin-btn admin-btn-secondary">
            <Plus size={15} />
            <span>Add New Portfolio Project</span>
          </NavLink>
          <NavLink to="/admin/services" className="admin-btn admin-btn-secondary">
            <Plus size={15} />
            <span>Add New Service</span>
          </NavLink>
          <NavLink to="/admin/media" className="admin-btn admin-btn-secondary">
            <Image size={15} />
            <span>Upload Media Files</span>
          </NavLink>
          <NavLink to="/admin/content" className="admin-btn admin-btn-secondary">
            <FileText size={15} />
            <span>Edit Website Content</span>
          </NavLink>
        </div>
      </div>

      {/* Recent Inquiries Section */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Recent Customer Inquiries</h2>
            <p style={{ color: '#9e97aa', fontSize: '12.5px', marginTop: '2px' }}>
              Leads received directly through your MIRAX MEDIA contact form
            </p>
          </div>
          <NavLink to="/admin/inquiries" className="admin-btn admin-btn-secondary">
            <span>View All Leads</span>
            <ArrowRight size={14} />
          </NavLink>
        </div>

        {recentInquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9e97aa' }}>
            No customer inquiries yet.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Contact Details</th>
                  <th>Service Requested</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{inq.fullName}</strong>
                    </td>
                    <td>
                      <div>{inq.email}</div>
                      <div style={{ color: '#9e97aa', fontSize: '12px' }}>{inq.phone}</div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--admin-cerulean)', fontWeight: 600 }}>{inq.service}</span>
                    </td>
                    <td>
                      <span className={`status-pill status-${inq.status.toLowerCase().replace('_', '-')}`}>
                        {inq.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9e97aa', fontSize: '12px' }}>
                        <Clock size={12} />
                        <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Media Assets */}
      {recentMedia.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Media Library Uploads</h2>
            <NavLink to="/admin/media" className="admin-btn admin-btn-secondary">
              <span>Open Media Library</span>
              <ArrowRight size={14} />
            </NavLink>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
            {recentMedia.map((m) => (
              <div
                key={m.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  textAlign: 'center',
                }}
              >
                <img
                  src={m.secureUrl || m.url}
                  alt={m.title}
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
                <div style={{ padding: '8px', fontSize: '11px', color: '#9e97aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
