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
        background: 'radial-gradient(circle at 50% 20%, #161616 0%, #0A0A0A 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'inherit',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow accents */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(0, 150, 255, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(255, 20, 147, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="admin-modal"
        style={{
          maxWidth: '440px',
          padding: '36px 30px',
          background: 'rgba(18, 18, 18, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 150, 255, 0.25)',
          position: 'relative',
          zIndex: 1,
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
              border: '2px solid #0096FF',
              boxShadow: '0 0 20px rgba(0, 150, 255, 0.5), 0 0 35px rgba(255, 20, 147, 0.3)',
            }}
          />
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '0.5px' }}>
            MIRAX <span style={{ background: 'linear-gradient(135deg, #0096FF 0%, #FF1493 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ADMIN</span>
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '6px' }}>
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
