import prisma from '../config/database.js';

/**
 * Public dynamic content endpoints for public website.
 * These endpoints return published content with automatic fallback so the public website never breaks.
 */

export async function getPublicWebsiteData(req, res, next) {
  try {
    const [
      contents,
      banners,
      services,
      projects,
      testimonials,
      settings,
      seo,
      blogs,
    ] = await Promise.all([
      prisma.websiteContent.findMany({ where: { isEnabled: true } }),
      prisma.banner.findMany({ where: { isPublished: true }, orderBy: { displayOrder: 'asc' } }),
      prisma.service.findMany({ where: { isPublished: true }, orderBy: { displayOrder: 'asc' } }),
      prisma.project.findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: 'asc' },
        include: { images: { orderBy: { displayOrder: 'asc' } } },
      }),
      prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { displayOrder: 'asc' } }),
      prisma.websiteSetting.findMany(),
      prisma.seoSetting.findMany(),
      prisma.blogPost.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' } }),
    ]);

    const contentMap = {};
    for (const c of contents) {
      contentMap[c.sectionKey] = c;
    }

    const settingsMap = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return res.status(200).json({
      success: true,
      data: {
        content: contentMap,
        banners,
        services,
        projects,
        testimonials,
        settings: settingsMap,
        seo,
        blogs,
      },
    });
  } catch (err) {
    console.warn('[Public API Fallback Notice]:', err.message);
    // Return empty success structure so frontend uses existing hardcoded defaults
    return res.status(200).json({
      success: true,
      data: {
        content: {},
        banners: [],
        services: [],
        projects: [],
        testimonials: [],
        settings: {},
        seo: [],
        blogs: [],
      },
      fallback: true,
    });
  }
}
