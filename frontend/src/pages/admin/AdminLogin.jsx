import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import '../../admin.css';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #1b112d 0%, #09070f 85%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'inherit',
      }}
    >
      <div
        className="admin-modal"
        style={{
          maxWidth: '440px',
          padding: '36px',
          border: '1px solid rgba(182, 107, 255, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(139, 61, 255, 0.35)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/mirax-logo.jpg"
            alt="MIRAX MEDIA"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              margin: '0 auto 14px',
              border: '2px solid #b66bff',
              boxShadow: '0 0 25px rgba(182, 107, 255, 0.5)',
            }}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
            MIRAX <span style={{ color: '#b66bff' }}>ADMIN</span>
          </h1>
          <p style={{ color: '#9e97aa', fontSize: '13px', marginTop: '6px' }}>
            Sign in to manage MIRAX MEDIA website and inquiries
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="admin-input"
                style={{ paddingLeft: '38px' }}
                placeholder="miraxcontact@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#9e97aa' }}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="admin-input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#9e97aa' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#9e97aa',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              justifyContent: 'center',
              marginTop: '10px',
              fontSize: '14px',
            }}
          >
            <ShieldCheck size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#9e97aa',
              fontSize: '12.5px',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Public Website</span>
          </a>
        </div>
      </div>
    </div>
  );
}
