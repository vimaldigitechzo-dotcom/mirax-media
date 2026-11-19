/**
 * MIRAX MEDIA — Admin API Service
 * Centralized API client for all Admin Portal operations.
 */

// Determine base API URL safely
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// In local dev: talk to http://localhost:5000/api
// In production (Vercel): use relative '/api', which Vercel rewrites directly to Render.
// This guarantees 100% same-origin security with zero CORS or CORP blocks.
const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : '/api';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('mirax_admin_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('mirax_admin_token');
    localStorage.removeItem('mirax_admin_user');
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
      window.location.href = '/admin';
    }
    throw new Error(data.message || 'Session expired. Please log in again.');
  }
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const adminApi = {
  // Authentication
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        throw new Error(
          'Connecting to server... If Render was asleep, it may take 15-20 seconds to wake up. Please click Sign In again in a few seconds.'
        );
      }
      throw err;
    }
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(res);
  },

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('mirax_admin_token');
    localStorage.removeItem('mirax_admin_user');
  },

  // Dashboard
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Content (CMS)
  async getContent() {
    const res = await fetch(`${API_BASE_URL}/admin/content`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateContent(sectionKey, payload) {
    const res = await fetch(`${API_BASE_URL}/admin/content/${sectionKey}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Banners
  async getBanners() {
    const res = await fetch(`${API_BASE_URL}/admin/banners`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createBanner(bannerData) {
    const res = await fetch(`${API_BASE_URL}/admin/banners`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bannerData),
    });
    return handleResponse(res);
  },

  async updateBanner(id, bannerData) {
    const res = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(bannerData),
    });
    return handleResponse(res);
  },

  async deleteBanner(id) {
    const res = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Services
  async getServices() {
    const res = await fetch(`${API_BASE_URL}/admin/services`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createService(serviceData) {
    const res = await fetch(`${API_BASE_URL}/admin/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleResponse(res);
  },

  async updateService(id, serviceData) {
    const res = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleResponse(res);
  },

  async deleteService(id) {
    const res = await fetch(`${API_BASE_URL}/admin/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Projects / Portfolio
  async getProjects() {
    const res = await fetch(`${API_BASE_URL}/admin/projects`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createProject(projectData) {
    const res = await fetch(`${API_BASE_URL}/admin/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    return handleResponse(res);
  },

  async updateProject(id, projectData) {
    const res = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    return handleResponse(res);
  },

  async deleteProject(id) {
    const res = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Testimonials
  async getTestimonials() {
    const res = await fetch(`${API_BASE_URL}/admin/testimonials`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createTestimonial(testimonialData) {
    const res = await fetch(`${API_BASE_URL}/admin/testimonials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testimonialData),
    });
    return handleResponse(res);
  },

  async updateTestimonial(id, testimonialData) {
    const res = await fetch(`${API_BASE_URL}/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(testimonialData),
    });
    return handleResponse(res);
  },

  async deleteTestimonial(id) {
    const res = await fetch(`${API_BASE_URL}/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Inquiries
  async getInquiries(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/inquiries${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateInquiry(id, payload) {
    const res = await fetch(`${API_BASE_URL}/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deleteInquiry(id) {
    const res = await fetch(`${API_BASE_URL}/admin/inquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getExportInquiriesCsvUrl() {
    const token = localStorage.getItem('mirax_admin_token');
    return `${API_BASE_URL}/admin/inquiries/export/csv?token=${token || ''}`;
  },

  // Blogs
  async getBlogs() {
    const res = await fetch(`${API_BASE_URL}/admin/blogs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createBlog(blogData) {
    const res = await fetch(`${API_BASE_URL}/admin/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData),
    });
    return handleResponse(res);
  },

  async updateBlog(id, blogData) {
    const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData),
    });
    return handleResponse(res);
  },

  async deleteBlog(id) {
    const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Media Library
  async getMedia(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/media${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async uploadMedia(formData) {
    const res = await fetch(`${API_BASE_URL}/admin/media/upload`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteMedia(id) {
    const res = await fetch(`${API_BASE_URL}/admin/media/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // SEO Settings
  async getSeoSettings() {
    const res = await fetch(`${API_BASE_URL}/admin/seo`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateSeoSetting(seoData) {
    const res = await fetch(`${API_BASE_URL}/admin/seo`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(seoData),
    });
    return handleResponse(res);
  },

  // Website Settings
  async getSettings() {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ settings }),
    });
    return handleResponse(res);
  },

  // Admin Users
  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async updateUser(id, userData) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Public website dynamic payload
  async getPublicWebsiteData() {
    const res = await fetch(`${API_BASE_URL}/public/data`);
    return handleResponse(res);
  },
};

export default adminApi;
