import { PrismaClient } from '../src/generated/prisma/client';
import { hash } from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const adminPasswordHash = hash('admin123', 'sha256').toString('hex');
  const userPasswordHash = hash('user123', 'sha256').toString('hex');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@djtechnologies.com' },
    update: {},
    create: {
      email: 'admin@djtechnologies.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@djtechnologies.com' },
    update: {},
    create: {
      email: 'demo@djtechnologies.com',
      passwordHash: userPasswordHash,
      firstName: 'Demo',
      lastName: 'User',
      role: 'USER',
      emailVerified: true,
    },
  });

  console.log('Users created:', adminUser.email, demoUser.email);

  const headerComponent = await prisma.component.create({
    data: {
      name: 'Modern Header',
      slug: 'modern-header',
      type: 'HEADER',
      description: 'A clean, modern header with logo and navigation',
      isPublic: true,
      html: '<header class="header"><nav class="nav"><div class="logo">{{logo}}</div><ul class="nav-links">{{navLinks}}</ul></nav></header>',
      css: '.header { padding: 1rem 2rem; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }',
      props: JSON.stringify({
        logo: { type: 'string', default: 'Logo' },
        navLinks: { type: 'array', default: ['Home', 'About', 'Contact'] },
      }),
    },
  });

  const heroComponent = await prisma.component.create({
    data: {
      name: 'Hero Section',
      slug: 'hero-section',
      type: 'HERO',
      description: 'Full-width hero section with CTA',
      isPublic: true,
      html: '<section class="hero"><h1>{{title}}</h1><p>{{subtitle}}</p><button class="cta">{{ctaText}}</button></section>',
      css: '.hero { padding: 4rem 2rem; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }',
      props: JSON.stringify({
        title: { type: 'string', default: 'Welcome' },
        subtitle: { type: 'string', default: 'Build amazing websites' },
        ctaText: { type: 'string', default: 'Get Started' },
      }),
    },
  });

  const featuresComponent = await prisma.component.create({
    data: {
      name: 'Features Grid',
      slug: 'features-grid',
      type: 'FEATURES',
      description: 'Grid layout for showcasing features',
      isPublic: true,
      html: '<section class="features"><div class="features-grid">{{#each features}}<div class="feature-card"><h3>{{title}}</h3><p>{{description}}</p></div>{{/each}}</div></section>',
      css: '.features { padding: 4rem 2rem; } .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }',
      props: JSON.stringify({
        features: {
          type: 'array',
          default: [
            { title: 'Fast', description: 'Lightning fast performance' },
            { title: 'Easy', description: 'No coding required' },
            { title: 'Scalable', description: 'Grows with your business' },
          ],
        },
      }),
    },
  });

  const ctaComponent = await prisma.component.create({
    data: {
      name: 'Call to Action',
      slug: 'call-to-action',
      type: 'CTA',
      description: 'Prominent call-to-action banner',
      isPublic: true,
      html: '<section class="cta-banner"><h2>{{title}}</h2><p>{{description}}</p><button>{{buttonText}}</button></section>',
      css: '.cta-banner { padding: 3rem 2rem; text-align: center; background: #1a1a2e; color: white; }',
      props: JSON.stringify({
        title: { type: 'string', default: 'Ready to get started?' },
        description: { type: 'string', default: 'Join thousands of happy users' },
        buttonText: { type: 'string', default: 'Sign Up Free' },
      }),
    },
  });

  const footerComponent = await prisma.component.create({
    data: {
      name: 'Standard Footer',
      slug: 'standard-footer',
      type: 'FOOTER',
      description: 'Standard footer with links and copyright',
      isPublic: true,
      html: '<footer class="footer"><div class="footer-content">{{content}}</div><div class="copyright">{{copyright}}</div></footer>',
      css: '.footer { padding: 2rem; background: #333; color: #fff; }',
      props: JSON.stringify({
        content: { type: 'string', default: 'Footer links here' },
        copyright: { type: 'string', default: '© 2026 DJ Technologies' },
      }),
    },
  });

  console.log('Components created:', headerComponent.name, heroComponent.name, featuresComponent.name);

  const businessTemplate = await prisma.template.create({
    data: {
      name: 'Business Pro',
      slug: 'business-pro',
      description: 'Professional business website template with modern design',
      category: 'BUSINESS',
      isPublic: true,
      isFeatured: true,
      price: 0,
      thumbnail: '/templates/business-pro-thumb.png',
      previewUrl: '/templates/business-pro/preview',
      config: JSON.stringify({
        colors: { primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b' },
        fonts: { heading: 'Inter', body: 'Inter' },
      }),
    },
  });

  const portfolioTemplate = await prisma.template.create({
    data: {
      name: 'Creative Portfolio',
      slug: 'creative-portfolio',
      description: 'Showcase your work with this stunning portfolio template',
      category: 'PORTFOLIO',
      isPublic: true,
      isFeatured: true,
      price: 0,
      thumbnail: '/templates/creative-portfolio-thumb.png',
      previewUrl: '/templates/creative-portfolio/preview',
      config: JSON.stringify({
        colors: { primary: '#7c3aed', secondary: '#5b21b6', accent: '#ec4899' },
        fonts: { heading: 'Playfair Display', body: 'Inter' },
      }),
    },
  });

  const landingTemplate = await prisma.template.create({
    data: {
      name: 'SaaS Landing',
      slug: 'saas-landing',
      description: 'High-converting landing page template for SaaS products',
      category: 'LANDING_PAGE',
      isPublic: true,
      isFeatured: false,
      price: 0,
      thumbnail: '/templates/saas-landing-thumb.png',
      previewUrl: '/templates/saas-landing/preview',
      config: JSON.stringify({
        colors: { primary: '#059669', secondary: '#047857', accent: '#f97316' },
        fonts: { heading: 'Poppins', body: 'Inter' },
      }),
    },
  });

  console.log('Templates created:', businessTemplate.name, portfolioTemplate.name, landingTemplate.name);

  await prisma.templateComponent.createMany({
    data: [
      { templateId: businessTemplate.id, componentId: headerComponent.id, sortOrder: 0 },
      { templateId: businessTemplate.id, componentId: heroComponent.id, sortOrder: 1 },
      { templateId: businessTemplate.id, componentId: featuresComponent.id, sortOrder: 2 },
      { templateId: businessTemplate.id, componentId: ctaComponent.id, sortOrder: 3 },
      { templateId: businessTemplate.id, componentId: footerComponent.id, sortOrder: 4 },
      { templateId: portfolioTemplate.id, componentId: headerComponent.id, sortOrder: 0 },
      { templateId: portfolioTemplate.id, componentId: heroComponent.id, sortOrder: 1 },
      { templateId: portfolioTemplate.id, componentId: footerComponent.id, sortOrder: 2 },
      { templateId: landingTemplate.id, componentId: headerComponent.id, sortOrder: 0 },
      { templateId: landingTemplate.id, componentId: heroComponent.id, sortOrder: 1 },
      { templateId: landingTemplate.id, componentId: featuresComponent.id, sortOrder: 2 },
      { templateId: landingTemplate.id, componentId: ctaComponent.id, sortOrder: 3 },
      { templateId: landingTemplate.id, componentId: footerComponent.id, sortOrder: 4 },
    ],
  });

  console.log('Template components linked');

  const demoWebsite = await prisma.website.create({
    data: {
      userId: demoUser.id,
      name: 'My First Website',
      slug: 'my-first-website',
      description: 'A demo website built with DJ Technologies',
      status: 'DRAFT',
      config: JSON.stringify({
        layout: 'full-width',
        responsive: true,
      }),
      theme: JSON.stringify({
        colors: { primary: '#2563eb', secondary: '#1e40af' },
        fonts: { heading: 'Inter', body: 'Inter' },
      }),
      seoSettings: JSON.stringify({
        title: 'My First Website',
        description: 'Built with DJ Technologies',
      }),
    },
  });

  const homepage = await prisma.page.create({
    data: {
      websiteId: demoWebsite.id,
      name: 'Home',
      slug: 'home',
      title: 'Welcome to My Website',
      metaDesc: 'Welcome to my amazing website built with DJ Technologies',
      isHomepage: true,
      content: JSON.stringify({
        sections: ['hero', 'features', 'cta'],
      }),
    },
  });

  const aboutPage = await prisma.page.create({
    data: {
      websiteId: demoWebsite.id,
      name: 'About',
      slug: 'about',
      title: 'About Us',
      metaDesc: 'Learn more about us',
      content: JSON.stringify({
        sections: ['hero', 'features'],
      }),
    },
  });

  console.log('Website and pages created:', demoWebsite.name);

  await prisma.pageComponent.createMany({
    data: [
      { pageId: homepage.id, componentId: headerComponent.id, sortOrder: 0 },
      { pageId: homepage.id, componentId: heroComponent.id, sortOrder: 1 },
      { pageId: homepage.id, componentId: featuresComponent.id, sortOrder: 2 },
      { pageId: homepage.id, componentId: ctaComponent.id, sortOrder: 3 },
      { pageId: homepage.id, componentId: footerComponent.id, sortOrder: 4 },
      { pageId: aboutPage.id, componentId: headerComponent.id, sortOrder: 0 },
      { pageId: aboutPage.id, componentId: heroComponent.id, sortOrder: 1 },
      { pageId: aboutPage.id, componentId: footerComponent.id, sortOrder: 2 },
    ],
  });

  console.log('Page components linked');

  const subscription = await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      tier: 'FREE',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Subscription created for', demoUser.email);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
