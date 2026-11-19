import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for MIRAX MEDIA Admin Panel...');

  // 1. Create Initial Super Admin
  const adminEmail = 'miraxcontact@gmail.com';
  const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Mirax2026!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  const superAdmin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      fullName: 'MIRAX Super Admin',
      passwordHash: passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Super Admin ready: ${superAdmin.email} (Password: ${defaultPassword})`);

  // 2. Initial Website Settings
  const settings = [
    { key: 'site_name', value: 'MIRAX MEDIA', group: 'branding' },
    { key: 'tagline', value: 'Where Strategy meets Digital Growth.', group: 'branding' },
    { key: 'contact_email', value: 'miraxcontact@gmail.com', group: 'contact' },
    { key: 'contact_phone', value: '+91 7200405822', group: 'contact' },
    { key: 'address', value: 'India (Pan-India & Global)', group: 'contact' },
    { key: 'working_hours', value: 'Mon – Sat (9:00 AM – 7:00 PM IST)', group: 'contact' },
    { key: 'copyright', value: '© 2026 MIRAX MEDIA. All rights reserved.', group: 'general' },
    { key: 'instagram_url', value: 'https://instagram.com/miraxmedia', group: 'social' },
    { key: 'linkedin_url', value: 'https://linkedin.com/company/miraxmedia', group: 'social' },
    { key: 'whatsapp_number', value: '+917200405822', group: 'contact' },
  ];

  for (const s of settings) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s,
    });
  }
  console.log(`✅ Initial Website Settings created (${settings.length} records)`);

  // 3. Initial Website Content (Hero, About, Why, CTA)
  const contents = [
    {
      sectionKey: 'hero',
      title: 'Where Strategy meets Digital Growth.',
      subtitle: 'DIGITAL MARKETING & GROWTH AGENCY',
      bodyText:
        'Mirax Media is a results-driven digital marketing agency helping businesses build a strong online presence through SEO, creative content creation, personal branding, Meta Ads, Google Ads, and social media marketing. We combine creativity, strategy, and data-driven marketing to turn your digital presence into measurable business growth.',
      buttonText: 'Explore Our Services',
      buttonLink: '#services',
      isEnabled: true,
    },
    {
      sectionKey: 'about',
      title: 'Built on Strategy, Driven by Results',
      subtitle: 'WHO WE ARE',
      bodyText:
        'We help modern brands, visionary founders, and enterprises unlock digital revenue with high-ROI execution.',
      isEnabled: true,
    },
    {
      sectionKey: 'cta',
      title: 'Ready to Grow Your Business Online?',
      subtitle: 'YOUR NEXT CHAPTER STARTS HERE',
      bodyText:
        'Let’s build a stronger digital presence for your brand with the right strategy, creative content, and performance marketing.',
      buttonText: 'Get a Free Consultation',
      buttonLink: '#contact',
      isEnabled: true,
    },
  ];

  for (const c of contents) {
    await prisma.websiteContent.upsert({
      where: { sectionKey: c.sectionKey },
      update: c,
      create: c,
    });
  }
  console.log(`✅ Website CMS sections populated`);

  // 4. Initial Services
  const initialServices = [
    {
      number: '01',
      title: 'Search Engine Optimization',
      category: 'Organic Growth',
      description:
        'Dominate search rankings, drive high-intent organic traffic, and establish sustainable search visibility with data-backed SEO.',
      iconName: 'Search',
      displayOrder: 1,
      isPublished: true,
    },
    {
      number: '02',
      title: 'Social Media Marketing',
      category: 'Brand Awareness',
      description:
        'Build loyal brand communities and ignite social engagement with high-impact, channel-native campaigns across Instagram, LinkedIn, and YouTube.',
      iconName: 'Share2',
      displayOrder: 2,
      isPublished: true,
    },
    {
      number: '03',
      title: 'Creative Content Creation',
      category: 'Brand Storytelling',
      description:
        'Stop the scroll with cinematic video reels, motion graphics, and narrative storytelling engineered to convert viewers into paying clients.',
      iconName: 'Video',
      displayOrder: 3,
      isPublished: true,
    },
    {
      number: '04',
      title: 'Personal Branding',
      category: 'Authority Building',
      description:
        'Transform founders, executives, and creators into recognized industry authorities with tailored narrative positioning and thought leadership.',
      iconName: 'UserCheck',
      displayOrder: 4,
      isPublished: true,
    },
    {
      number: '05',
      title: 'Meta & Google Ads',
      category: 'Performance Marketing',
      description:
        'Scale your revenue profitably with targeted paid advertising campaigns optimized for maximum return on ad spend (ROAS).',
      iconName: 'Target',
      displayOrder: 5,
      isPublished: true,
    },
    {
      number: '06',
      title: 'Web Design & Development',
      category: 'Conversion Optimization',
      description:
        'High-converting, ultra-fast websites and landing pages crafted with modern interactive UI, responsive layouts, and seamless user experiences.',
      iconName: 'Globe',
      displayOrder: 6,
      isPublished: true,
    },
  ];

  for (const s of initialServices) {
    const existing = await prisma.service.findFirst({ where: { number: s.number } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }
  console.log(`✅ Default Services seeded`);

  // 5. Initial Projects / Portfolio
  const initialProjects = [
    {
      title: 'D2C Ecommerce Scale',
      category: 'Performance Marketing',
      metric: '4.8x ROAS',
      description: 'End-to-end Meta & Google Ads optimization scaling monthly revenue past 8 figures.',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      displayOrder: 1,
      isPublished: true,
    },
    {
      title: 'B2B SaaS Organic SEO Engine',
      category: 'SEO & Organic Growth',
      metric: '+340% Organic Leads',
      description: 'Comprehensive technical SEO and content cluster strategy targeting high-intent keywords.',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      displayOrder: 2,
      isPublished: true,
    },
    {
      title: 'Founder Thought Leadership Campaign',
      category: 'Personal Branding',
      metric: '2.4M Impressions',
      description: 'LinkedIn content engine and video series establishing CEO authority in fintech.',
      coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      displayOrder: 3,
      isPublished: true,
    },
  ];

  for (const p of initialProjects) {
    const existing = await prisma.project.findFirst({ where: { title: p.title } });
    if (!existing) {
      await prisma.project.create({ data: p });
    }
  }
  console.log(`✅ Default Projects seeded`);

  // 6. Initial SEO Settings
  await prisma.seoSetting.upsert({
    where: { pagePath: '/' },
    update: {},
    create: {
      pagePath: '/',
      metaTitle: 'MIRAX MEDIA | Results-Driven Digital Marketing Agency',
      metaDescription:
        'Mirax Media is a results-driven digital marketing agency helping businesses build a strong online presence through SEO, creative content creation, personal branding, Meta Ads, Google Ads, and social media marketing.',
      metaKeywords:
        'digital marketing agency, SEO services, Meta ads, Google ads, video marketing, personal branding, web development',
      ogTitle: 'MIRAX MEDIA — Where Strategy meets Digital Growth',
      ogDescription:
        'Turn your digital presence into measurable business growth with high-ROI digital marketing and creative strategy.',
      ogImage: '/mirax-logo.jpg',
      canonicalUrl: 'https://mirax-media-alpha.vercel.app/',
    },
  });
  console.log(`✅ Default SEO Setting seeded`);

  console.log('\n🎉 Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
