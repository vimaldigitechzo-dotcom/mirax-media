import prisma from '../config/database.js';

export async function getAllBlogs(req, res, next) {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: blogs });
  } catch (err) {
    return next(err);
  }
}

export async function createBlog(req, res, next) {
  try {
    const { title, slug, excerpt, content, coverImage, authorName, category, tags, status, publishedAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Blog title and content are required.' });
    }

    const generatedSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const blog = await prisma.blogPost.create({
      data: {
        title,
        slug: generatedSlug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        authorName: authorName || 'MIRAX Team',
        category: category || 'Digital Marketing',
        tags: tags || null,
        status: status || 'DRAFT',
        publishedAt: status === 'PUBLISHED' ? publishedAt ? new Date(publishedAt) : new Date() : null,
      },
    });

    return res.status(201).json({ success: true, message: 'Blog post created.', data: blog });
  } catch (err) {
    return next(err);
  }
}

export async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, coverImage, authorName, category, tags, status, publishedAt } = req.body;

    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
        ...(authorName !== undefined ? { authorName } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
      },
    });

    return res.status(200).json({ success: true, message: 'Blog post updated.', data: blog });
  } catch (err) {
    return next(err);
  }
}

export async function deleteBlog(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.blogPost.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Blog post deleted.' });
  } catch (err) {
    return next(err);
  }
}
