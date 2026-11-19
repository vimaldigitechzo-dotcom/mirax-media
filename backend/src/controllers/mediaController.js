import { v2 as cloudinary } from 'cloudinary';
import prisma from '../config/database.js';

// Configure Cloudinary if credentials exist in environment
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Get all media items with optional category filtering
 * Route: GET /api/admin/media
 */
export async function getAllMedia(req, res, next) {
  try {
    const { category, type } = req.query;
    const where = {};

    if (category && category !== 'ALL') where.category = category;
    if (type && type !== 'ALL') where.resourceType = type;

    const mediaList = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: mediaList });
  } catch (err) {
    return next(err);
  }
}

/**
 * Upload single or multiple media files
 * Route: POST /api/admin/media/upload
 */
export async function uploadMedia(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      // Check if URL was passed directly
      if (req.body.url) {
        const { title, url, category, resourceType, altText, caption } = req.body;
        const newMedia = await prisma.media.create({
          data: {
            title: title || 'External Media',
            altText: altText || null,
            caption: caption || null,
            category: category || 'general',
            resourceType: resourceType || 'IMAGE',
            url,
            secureUrl: url,
          },
        });
        return res.status(201).json({ success: true, data: [newMedia] });
      }

      return res.status(400).json({ success: false, message: 'No files provided for upload.' });
    }

    const uploadedRecords = [];
    const category = req.body.category || 'general';

    for (const file of req.files) {
      const isVideo = file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'VIDEO' : 'IMAGE';

      let fileUrl = '';
      let secureUrl = '';
      let publicId = null;
      let width = null;
      let height = null;
      let format = file.mimetype.split('/')[1] || null;

      if (hasCloudinary) {
        // Upload to Cloudinary using buffer stream
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'mirax_media',
              resource_type: isVideo ? 'video' : 'image',
              transformation: isVideo ? [] : [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        fileUrl = uploadResult.url;
        secureUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
        width = uploadResult.width;
        height = uploadResult.height;
        format = uploadResult.format;
      } else {
        // Local base64 data URI fallback when Cloudinary env is not set yet
        const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        fileUrl = base64Data;
        secureUrl = base64Data;
        publicId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      }

      const media = await prisma.media.create({
        data: {
          title: req.body.title || file.originalname,
          altText: req.body.altText || file.originalname,
          caption: req.body.caption || null,
          category,
          resourceType,
          publicId,
          url: fileUrl,
          secureUrl,
          format,
          bytes: file.size,
          width,
          height,
        },
      });

      uploadedRecords.push(media);
    }

    return res.status(201).json({
      success: true,
      message: `${uploadedRecords.length} file(s) uploaded successfully.`,
      data: uploadedRecords,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete a media file
 * Route: DELETE /api/admin/media/:id
 */
export async function deleteMedia(req, res, next) {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found.' });
    }

    // If on Cloudinary, delete remote asset
    if (hasCloudinary && media.publicId && !media.publicId.startsWith('local_')) {
      try {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.resourceType.toLowerCase(),
        });
      } catch (cloudErr) {
        console.warn('[Cloudinary Delete Notice]:', cloudErr.message);
      }
    }

    await prisma.media.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Media deleted.' });
  } catch (err) {
    return next(err);
  }
}
