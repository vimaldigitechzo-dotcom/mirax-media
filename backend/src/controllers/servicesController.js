import prisma from '../config/database.js';

export async function getAllServices(req, res, next) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: services });
  } catch (err) {
    return next(err);
  }
}

export async function createService(req, res, next) {
  try {
    const { number, title, category, description, deliverables, iconName, imageUrl, displayOrder, isPublished } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const count = await prisma.service.count();
    const serviceNumber = number || String(count + 1).padStart(2, '0');

    const service = await prisma.service.create({
      data: {
        number: serviceNumber,
        title,
        category: category || 'General',
        description,
        deliverables: typeof deliverables === 'string' ? deliverables : JSON.stringify(deliverables || []),
        iconName: iconName || 'TrendingUp',
        imageUrl: imageUrl || null,
        displayOrder: Number(displayOrder) || count + 1,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return res.status(201).json({ success: true, message: 'Service created.', data: service });
  } catch (err) {
    return next(err);
  }
}

export async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const { number, title, category, description, deliverables, iconName, imageUrl, displayOrder, isPublished } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(number !== undefined ? { number } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(deliverables !== undefined ? { deliverables: typeof deliverables === 'string' ? deliverables : JSON.stringify(deliverables) } : {}),
        ...(iconName !== undefined ? { iconName } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      },
    });

    return res.status(200).json({ success: true, message: 'Service updated.', data: service });
  } catch (err) {
    return next(err);
  }
}

export async function deleteService(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    return next(err);
  }
}
