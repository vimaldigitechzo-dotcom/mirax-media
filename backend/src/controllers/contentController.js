import prisma from '../config/database.js';

// --- WEBSITE CONTENT ---

export async function getAllContent(req, res, next) {
  try {
    const contents = await prisma.websiteContent.findMany({
      orderBy: { sectionKey: 'asc' },
    });
    return res.status(200).json({ success: true, data: contents });
  } catch (err) {
    return next(err);
  }
}

export async function updateContent(req, res, next) {
  try {
    const { sectionKey } = req.params;
    const { title, subtitle, bodyText, buttonText, buttonLink, isEnabled, extraJson } = req.body;

    const content = await prisma.websiteContent.upsert({
      where: { sectionKey },
      update: {
        ...(title !== undefined ? { title } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(bodyText !== undefined ? { bodyText } : {}),
        ...(buttonText !== undefined ? { buttonText } : {}),
        ...(buttonLink !== undefined ? { buttonLink } : {}),
        ...(isEnabled !== undefined ? { isEnabled: Boolean(isEnabled) } : {}),
        ...(extraJson !== undefined ? { extraJson } : {}),
      },
      create: {
        sectionKey,
        title: title || '',
        subtitle: subtitle || '',
        bodyText: bodyText || '',
        buttonText: buttonText || '',
        buttonLink: buttonLink || '',
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
        extraJson: extraJson || null,
      },
    });

    return res.status(200).json({ success: true, message: 'Section content updated.', data: content });
  } catch (err) {
    return next(err);
  }
}

// --- BANNERS ---

export async function getAllBanners(req, res, next) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: banners });
  } catch (err) {
    return next(err);
  }
}

export async function createBanner(req, res, next) {
  try {
    const { title, subtitle, description, ctaText, ctaLink, imageUrl, videoUrl, displayOrder, isPublished } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Banner title is required.' });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        displayOrder: Number(displayOrder) || 0,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return res.status(201).json({ success: true, message: 'Banner created.', data: banner });
  } catch (err) {
    return next(err);
  }
}

export async function updateBanner(req, res, next) {
  try {
    const { id } = req.params;
    const { title, subtitle, description, ctaText, ctaLink, imageUrl, videoUrl, displayOrder, isPublished } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(ctaText !== undefined ? { ctaText } : {}),
        ...(ctaLink !== undefined ? { ctaLink } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(videoUrl !== undefined ? { videoUrl } : {}),
        ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      },
    });

    return res.status(200).json({ success: true, message: 'Banner updated.', data: banner });
  } catch (err) {
    return next(err);
  }
}

export async function deleteBanner(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Banner deleted.' });
  } catch (err) {
    return next(err);
  }
}
