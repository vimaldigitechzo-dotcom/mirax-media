/**
 * MIRAX MEDIA — Frontend API Client
 * Connects frontend forms to the Node.js/Express Neon PostgreSQL backend.
 */

// Determine base API URL safely
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const envUrl = import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL = isLocal
  ? (envUrl || 'http://localhost:5000/api')
  : (envUrl && envUrl.startsWith('https://')
      ? envUrl
      : 'https://mirax-backend.onrender.com/api');

/**
 * Submits a customer enquiry to the backend.
 * @param {object} enquiryData
 * @param {string} enquiryData.name - Customer full name
 * @param {string} enquiryData.email - Customer email address
 * @param {string} enquiryData.phone - Customer phone number
 * @param {string} enquiryData.service - Requested service
 * @param {string} enquiryData.message - Project details
 * @param {string} [enquiryData.companyName] - Optional company name
 * @param {string} [enquiryData.budget] - Optional target budget
 * @returns {Promise<{ success: boolean, message: string, data?: object }>}
 */
export async function submitContactEnquiry(enquiryData) {
  try {
    const payload = {
      fullName: enquiryData.name || enquiryData.fullName,
      email: enquiryData.email,
      phone: enquiryData.phone,
      service: enquiryData.service,
      message: enquiryData.message,
      companyName: enquiryData.companyName || null,
      budget: enquiryData.budget || null,
    };

    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Extract specific field errors if provided by Zod validator
      let errorMessage = result.message || 'Failed to submit enquiry. Please try again.';
      if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
        const fieldErrors = result.errors.map((e) => e.message).join(', ');
        errorMessage = `${result.message} (${fieldErrors})`;
      }

      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    // If backend server is unreachable (offline or network blocked)
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Backend server is currently offline or unreachable at http://localhost:5000. Please ensure the backend is running.'
      );
    }
    throw error;
  }
}

/**
 * Checks connectivity with the Express backend & Neon PostgreSQL database.
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      status: 'offline',
      error: error.message,
    };
  }
}
