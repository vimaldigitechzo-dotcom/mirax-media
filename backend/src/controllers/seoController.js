import prisma from '../config/database.js';

/**
 * Get all page SEO settings
 * Route: GET /api/admin/seo
 */
export async function getAllSeoSettings(req, res, next) {
  try {
    const seo = await prisma.seoSetting.findMany({
      orderBy: { pagePath: 'asc' },
    });
    return res.status(200).json({ success: true, data: seo });
  } catch (err) {
    return next(err);
  }
}

/**
 * Update or create page SEO settings
 * Route: POST /api/admin/seo
 */
export async function updateSeoSetting(req, res, next) {
  try {
    const { pagePath, metaTitle, metaDescription, metaKeywords, ogTitle, ogDescription, ogImage, canonicalUrl } = req.body;

    if (!pagePath || !metaTitle) {
      return res.status(400).json({ success: false, message: 'Page path and meta title are required.' });
    }

    const updated = await prisma.seoSetting.upsert({
      where: { pagePath },
      update: {
        metaTitle,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        canonicalUrl: canonicalUrl || null,
      },
      create: {
        pagePath,
        metaTitle,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        canonicalUrl: canonicalUrl || null,
      },
    });

    return res.status(200).json({ success: true, message: 'SEO settings saved.', data: updated });
  } catch (err) {
    return next(err);
  }
}
