import prisma from '../config/database.js';

// --- PROJECTS ---

export async function getAllProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
    return res.status(200).json({ success: true, data: projects });
  } catch (err) {
    return next(err);
  }
}

export async function createProject(req, res, next) {
  try {
    const { title, category, metric, description, coverImage, videoUrl, projectUrl, isFeatured, displayOrder, isPublished, images } = req.body;

    if (!title || !coverImage) {
      return res.status(400).json({ success: false, message: 'Project title and cover image are required.' });
    }

    const count = await prisma.project.count();

    const project = await prisma.project.create({
      data: {
        title,
        category: category || 'General',
        metric: metric || null,
        description: description || null,
        coverImage,
        videoUrl: videoUrl || null,
        projectUrl: projectUrl || null,
        isFeatured: Boolean(isFeatured),
        displayOrder: Number(displayOrder) || count + 1,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        ...(Array.isArray(images) && images.length > 0
          ? {
              images: {
                create: images.map((img, idx) => ({
                  imageUrl: typeof img === 'string' ? img : img.imageUrl,
                  caption: img.caption || null,
                  displayOrder: idx,
                })),
              },
            }
          : {}),
      },
      include: { images: true },
    });

    return res.status(201).json({ success: true, message: 'Project created.', data: project });
  } catch (err) {
    return next(err);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const { title, category, metric, description, coverImage, videoUrl, projectUrl, isFeatured, displayOrder, isPublished } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(metric !== undefined ? { metric } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
        ...(videoUrl !== undefined ? { videoUrl } : {}),
        ...(projectUrl !== undefined ? { projectUrl } : {}),
        ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
        ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      },
      include: { images: true },
    });

    return res.status(200).json({ success: true, message: 'Project updated.', data: project });
  } catch (err) {
    return next(err);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    return next(err);
  }
}

// --- TESTIMONIALS ---

export async function getAllTestimonials(req, res, next) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: testimonials });
  } catch (err) {
    return next(err);
  }
}

export async function createTestimonial(req, res, next) {
  try {
    const { clientName, designation, company, feedback, avatarUrl, rating, isPublished, displayOrder } = req.body;

    if (!clientName || !feedback) {
      return res.status(400).json({ success: false, message: 'Client name and feedback are required.' });
    }

    const count = await prisma.testimonial.count();

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName,
        designation: designation || null,
        company: company || null,
        feedback,
        avatarUrl: avatarUrl || null,
        rating: Number(rating) || 5,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        displayOrder: Number(displayOrder) || count + 1,
      },
    });

    return res.status(201).json({ success: true, message: 'Testimonial created.', data: testimonial });
  } catch (err) {
    return next(err);
  }
}

export async function updateTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const { clientName, designation, company, feedback, avatarUrl, rating, isPublished, displayOrder } = req.body;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(clientName !== undefined ? { clientName } : {}),
        ...(designation !== undefined ? { designation } : {}),
        ...(company !== undefined ? { company } : {}),
        ...(feedback !== undefined ? { feedback } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(rating !== undefined ? { rating: Number(rating) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
        ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
      },
    });

    return res.status(200).json({ success: true, message: 'Testimonial updated.', data: testimonial });
  } catch (err) {
    return next(err);
  }
}

export async function deleteTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Testimonial deleted.' });
  } catch (err) {
    return next(err);
  }
}
