import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard,
  FileText,
  Image,
  Layers,
  Briefcase,
  MessageSquare,
  Users,
  Settings,
  Globe,
  Share2,
  ExternalLink,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import '../../admin.css';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/inquiries', label: 'Customer Inquiries', icon: MessageSquare },
  { path: '/admin/content', label: 'Website Content', icon: FileText },
  { path: '/admin/banners', label: 'Banner Management', icon: Layers },
  { path: '/admin/media', label: 'Media Library', icon: Image },
  { path: '/admin/services', label: 'Services', icon: Share2 },
  { path: '/admin/projects', label: 'Projects / Portfolio', icon: Briefcase },
  { path: '/admin/testimonials', label: 'Testimonials', icon: FolderOpen },
  { path: '/admin/blogs', label: 'Blog Posts', icon: FileText },
  { path: '/admin/seo', label: 'SEO Management', icon: Globe },
  { path: '/admin/users', label: 'Admin Users', icon: Users, roleRequired: 'ADMIN' },
  { path: '/admin/settings', label: 'Website Settings', icon: Settings },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of the Admin Panel?')) {
      await logout();
      navigate('/admin');
    }
  };

  const isSuperAdminOrAdmin = admin?.role === 'SUPER_ADMIN' || admin?.role === 'ADMIN';

  return (
    <div className="admin-wrapper">
      {/* Mobile Backdrop Overlay */}
      <div
        className={`admin-sidebar-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <a href="/admin/dashboard" className="admin-brand">
            <img src="/mirax-logo.jpg" alt="MIRAX MEDIA" />
            <div>
              MIRAX <span>PANEL</span>
            </div>
          </a>
          <button
            className="admin-sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav-list">
          {NAV_ITEMS.map((item) => {
            if (item.roleRequired && !isSuperAdminOrAdmin) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info-row">
            <div className="admin-avatar">
              {admin?.fullName ? admin.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {admin?.fullName || 'Administrator'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--admin-neon-rose)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                {admin?.role || 'ADMIN'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="admin-btn admin-btn-danger"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="admin-hamburger-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="admin-topbar-title">
              MIRAX <span>PANEL</span>
            </h1>
          </div>

          <div className="admin-topbar-actions">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-view-site-btn"
              title="View Public Website"
            >
              <ExternalLink size={14} />
              <span className="desktop-only">View Website</span>
            </a>

            <NavLink to="/admin/profile" className="admin-user-pill" title="Profile & Security">
              <User size={14} />
              <span className="desktop-only">Profile</span>
            </NavLink>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
