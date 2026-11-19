import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import {
  MessageSquare,
  Search,
  Download,
  Trash2,
  CheckCircle,
  Eye,
  X,
  FileSpreadsheet,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeModalInquiry, setActiveModalInquiry] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [msg, setMsg] = useState('');

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await adminApi.getInquiries(params);
      if (res.success) {
        setInquiries(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadInquiries();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateInquiry(id, { status: newStatus });
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      setMsg('Status updated successfully');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer enquiry?')) return;
    try {
      await adminApi.deleteInquiry(id);
      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (activeModalInquiry?.id === id) setActiveModalInquiry(null);
      setMsg('Inquiry deleted.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleSaveNotes = async () => {
    if (!activeModalInquiry) return;
    setSavingNote(true);
    try {
      await adminApi.updateInquiry(activeModalInquiry.id, { internalNotes });
      setInquiries((prev) =>
        prev.map((i) => (i.id === activeModalInquiry.id ? { ...i, internalNotes } : i))
      );
      setActiveModalInquiry((prev) => ({ ...prev, internalNotes }));
      setMsg('Notes saved.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save notes');
    } finally {
      setSavingNote(false);
    }
  };

  const handleExportCsv = () => {
    window.open(adminApi.getExportInquiriesCsvUrl(), '_blank');
  };

  return (
    <div>
      <div className="admin-card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="admin-card-title" style={{ fontSize: '20px' }}>
            Customer Inquiries & Leads
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '4px' }}>
            Manage and respond to client enquiries received from your website contact form
          </p>
        </div>

        <button onClick={handleExportCsv} className="admin-btn admin-btn-secondary">
          <FileSpreadsheet size={16} />
          <span>Export All to CSV</span>
        </button>
      </div>

      {msg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {msg}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="admin-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '260px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search by name, email, phone, or service..."
                className="admin-input"
                style={{ paddingLeft: '36px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9e97aa' }} />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary">
              Search
            </button>
          </form>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: statusFilter === st ? '1px solid #b66bff' : '1px solid var(--admin-border)',
                  background: statusFilter === st ? 'rgba(182, 107, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: statusFilter === st ? '#fff' : '#9e97aa',
                  cursor: 'pointer',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#b66bff' }}>Loading Inquiries...</div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9e97aa' }}>
            No customer inquiries found matching your filters.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact Info</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: '#fff', fontSize: '14px' }}>{item.fullName}</strong>
                      {item.companyName && (
                        <div style={{ color: '#9e97aa', fontSize: '12px' }}>{item.companyName}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} color="#b66bff" />
                        <a href={`mailto:${item.email}`} style={{ color: '#e2dced', textDecoration: 'none' }}>
                          {item.email}
                        </a>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <Phone size={12} color="#10b981" />
                        <a href={`tel:${item.phone}`} style={{ color: '#9e97aa', textDecoration: 'none', fontSize: '12px' }}>
                          {item.phone}
                        </a>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#b66bff', fontWeight: 600 }}>{item.service}</span>
                      {item.budget && (
                        <div style={{ color: '#9e97aa', fontSize: '11px' }}>Budget: {item.budget}</div>
                      )}
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '12px', color: '#9e97aa' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 10px' }}
                          title="View Details & Notes"
                          onClick={() => {
                            setActiveModalInquiry(item);
                            setInternalNotes(item.internalNotes || '');
                          }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '6px 10px' }}
                          title="Delete Spam"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={14} />
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

      {/* Inquiry Detail & Internal Notes Modal */}
      {activeModalInquiry && (
        <div className="admin-modal-overlay" onClick={() => setActiveModalInquiry(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-card-title">Enquiry Details</h2>
              <button
                className="admin-btn admin-btn-secondary"
                style={{ padding: '4px' }}
                onClick={() => setActiveModalInquiry(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#9e97aa', textTransform: 'uppercase' }}>Client Name</span>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{activeModalInquiry.fullName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#9e97aa', textTransform: 'uppercase' }}>Service</span>
                  <div style={{ fontWeight: 700, color: '#b66bff' }}>{activeModalInquiry.service}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#9e97aa', textTransform: 'uppercase' }}>Email</span>
                  <div>{activeModalInquiry.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#9e97aa', textTransform: 'uppercase' }}>Phone</span>
                  <div>{activeModalInquiry.phone}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#9e97aa', textTransform: 'uppercase' }}>Project Details / Message</span>
                <p style={{ color: '#e2dced', fontSize: '13px', lineHeight: '1.6', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                  {activeModalInquiry.message}
                </p>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="admin-form-group">
              <label className="admin-form-label">Internal Strategy Notes & Follow-up History</label>
              <textarea
                className="admin-textarea"
                placeholder="Add private notes for your team (e.g., Called client, budget agreed at ₹50K, scheduled kickoff call on Monday)..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setActiveModalInquiry(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={savingNote}
                onClick={handleSaveNotes}
              >
                {savingNote ? 'Saving...' : 'Save Internal Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
