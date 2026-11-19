import prisma from '../config/database.js';

/**
 * Get Comprehensive Admin Dashboard Statistics
 * Route: GET /api/admin/dashboard/stats
 */
export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalProjects,
      totalServices,
      totalImages,
      totalVideos,
      totalInquiries,
      newInquiries,
      totalBanners,
      totalBlogs,
      recentInquiries,
      recentMedia,
      recentActivity,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.service.count(),
      prisma.media.count({ where: { resourceType: 'IMAGE' } }),
      prisma.media.count({ where: { resourceType: 'VIDEO' } }),
      prisma.contact.count(),
      prisma.contact.count({ where: { status: 'NEW' } }),
      prisma.banner.count(),
      prisma.blogPost.count(),
      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminActivityLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { fullName: true, email: true },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          totalProjects,
          totalServices,
          totalImages,
          totalVideos,
          totalInquiries,
          newInquiries,
          totalBanners,
          totalBlogs,
        },
        recentInquiries,
        recentMedia,
        recentActivity,
      },
    });
  } catch (error) {
    return next(error);
  }
}
