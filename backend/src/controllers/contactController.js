import { checkDatabaseConnection } from '../config/database.js';
import { saveContact } from '../services/storageService.js';
import {
  sendAdminNotification,
  sendCustomerConfirmation,
} from '../services/emailService.js';

/**
 * Handles public contact enquiry submission.
 * Route: POST /api/contact
 */
export async function createContact(req, res, next) {
  try {
    const {
      fullName,
      email,
      phone,
      companyName,
      service,
      budget,
      message,
    } = req.body;

    // 1. Save Enquiry safely (tries Neon PostgreSQL first, falls back gracefully to local store)
    const { contact, storageSource } = await saveContact({
      fullName,
      email,
      phone,
      companyName,
      service,
      budget,
      message,
    });

    console.log(`\n======================================================`);
    console.log(`📥 NEW LEAD RECEIVED (STORAGE: ${storageSource.toUpperCase()}):`);
    console.log(`   Client Name:  ${contact.fullName}`);
    console.log(`   Email:        ${contact.email}`);
    console.log(`   Phone:        ${contact.phone}`);
    console.log(`   Service:      ${contact.service}`);
    console.log(`   Company:      ${contact.companyName || 'Not specified'}`);
    console.log(`   Budget:       ${contact.budget || 'Not specified'}`);
    console.log(`   Message:      ${contact.message}`);
    console.log(`   Notify To:    ${process.env.ADMIN_NOTIFICATION_EMAIL || 'ruppavimal@gmail.com'}`);
    console.log(`======================================================\n`);

    // 2. Dispatch email notifications to ruppavimal@gmail.com asynchronously
    Promise.allSettled([
      sendAdminNotification(contact),
      sendCustomerConfirmation(contact),
    ]).catch((err) => {
      console.warn('[Notification Dispatch Notice]:', err.message);
    });

    // 3. Return clean, secure success response immediately
    return res.status(201).json({
      success: true,
      message:
        'Thank you! Your enquiry has been received. Our strategy team will contact you within 24 hours.',
      data: {
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        service: contact.service,
        status: contact.status,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Health check endpoint to verify backend and Neon PostgreSQL status.
 * Route: GET /api/health
 */
export async function getHealth(req, res) {
  const dbStatus = await checkDatabaseConnection();

  const isHealthy = dbStatus.isConnected;

  const responsePayload = {
    success: true,
    status: isHealthy ? 'healthy' : 'degraded_offline_fallback_active',
    service: 'mirax-media-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      provider: 'Neon PostgreSQL',
      connected: dbStatus.isConnected,
      latencyMs: dbStatus.latencyMs,
      ...(dbStatus.error ? { notice: dbStatus.error } : {}),
    },
    notificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'ruppavimal@gmail.com',
  };

  return res.status(200).json(responsePayload);
}
