import prisma from '../config/database.js';

/**
 * Get all Customer Inquiries with Search, Filter & Pagination
 * Route: GET /api/admin/inquiries
 */
export async function getAllInquiries(req, res, next) {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search), mode: 'insensitive' } },
        { service: { contains: String(search), mode: 'insensitive' } },
        { message: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [inquiries, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Update Inquiry Status and/or Internal Notes
 * Route: PATCH /api/admin/inquiries/:id
 */
export async function updateInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const { status, internalNotes, isStarred } = req.body;

    const inquiry = await prisma.contact.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(internalNotes !== undefined ? { internalNotes } : {}),
        ...(isStarred !== undefined ? { isStarred: Boolean(isStarred) } : {}),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully.',
      data: inquiry,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete Spam Inquiry
 * Route: DELETE /api/admin/inquiries/:id
 */
export async function deleteInquiry(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.contact.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Inquiry deleted permanently.' });
  } catch (err) {
    return next(err);
  }
}

/**
 * Export Customer Inquiries to CSV
 * Route: GET /api/admin/inquiries/export/csv
 */
export async function exportInquiriesCsv(req, res, next) {
  try {
    const inquiries = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Company',
      'Service',
      'Budget',
      'Status',
      'Message',
      'Internal Notes',
      'Date Submitted',
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = inquiries.map((i) => [
      escapeCsv(i.id),
      escapeCsv(i.fullName),
      escapeCsv(i.email),
      escapeCsv(i.phone),
      escapeCsv(i.companyName || ''),
      escapeCsv(i.service),
      escapeCsv(i.budget || ''),
      escapeCsv(i.status),
      escapeCsv(i.message),
      escapeCsv(i.internalNotes || ''),
      escapeCsv(new Date(i.createdAt).toLocaleString()),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="mirax_inquiries_export.csv"');
    return res.status(200).send(csvContent);
  } catch (err) {
    return next(err);
  }
}
