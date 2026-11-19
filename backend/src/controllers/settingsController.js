import prisma from '../config/database.js';

/**
 * Get all Website Settings
 * Route: GET /api/admin/settings
 */
export async function getAllSettings(req, res, next) {
  try {
    const settings = await prisma.websiteSetting.findMany({
      orderBy: { group: 'asc' },
    });

    const settingsMap = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return res.status(200).json({ success: true, data: settings, map: settingsMap });
  } catch (err) {
    return next(err);
  }
}

/**
 * Update Website Settings
 * Route: POST /api/admin/settings
 */
export async function updateBulkSettings(req, res, next) {
  try {
    const { settings } = req.body;

    if (Array.isArray(settings)) {
      for (const item of settings) {
        if (item.key) {
          await prisma.websiteSetting.upsert({
            where: { key: item.key },
            update: { value: String(item.value || ''), group: item.group || 'general' },
            create: { key: item.key, value: String(item.value || ''), group: item.group || 'general' },
          });
        }
      }
    } else if (typeof settings === 'object') {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.websiteSetting.upsert({
          where: { key },
          update: { value: String(value || '') },
          create: { key, value: String(value || ''), group: 'general' },
        });
      }
    }

    return res.status(200).json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    return next(err);
  }
}
