import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./admin.css";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import DashboardPage from "./pages/admin/DashboardPage";
import InquiriesPage from "./pages/admin/InquiriesPage";
import ContentPage from "./pages/admin/ContentPage";
import BannersPage from "./pages/admin/BannersPage";
import MediaPage from "./pages/admin/MediaPage";
import ServicesPage from "./pages/admin/ServicesPage";
import ProjectsPage from "./pages/admin/ProjectsPage";
import TestimonialsPage from "./pages/admin/TestimonialsPage";
import BlogsPage from "./pages/admin/BlogsPage";
import SeoPage from "./pages/admin/SeoPage";
import UsersPage from "./pages/admin/UsersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ProfilePage from "./pages/admin/ProfilePage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<App />} />

          {/* Admin Authentication */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Protected Admin Portal */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/inquiries" element={<InquiriesPage />} />
              <Route path="/admin/content" element={<ContentPage />} />
              <Route path="/admin/banners" element={<BannersPage />} />
              <Route path="/admin/media" element={<MediaPage />} />
              <Route path="/admin/services" element={<ServicesPage />} />
              <Route path="/admin/projects" element={<ProjectsPage />} />
              <Route path="/admin/testimonials" element={<TestimonialsPage />} />
              <Route path="/admin/blogs" element={<BlogsPage />} />
              <Route path="/admin/seo" element={<SeoPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
