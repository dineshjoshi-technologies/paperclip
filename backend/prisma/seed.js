const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/authUtils');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@djtechnologies.com' },
    update: {},
    create: {
      email: 'admin@djtechnologies.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true
    }
  });
  console.log('Created admin user:', admin.email);

  // Create 3 starter templates
  const templates = [
    {
      name: 'Business Pro',
      slug: 'business-pro',
      description: 'Professional business website with hero, features, testimonials, and contact sections',
      category: 'BUSINESS',
      isPublic: true,
      isFeatured: true,
      config: {
        theme: 'modern',
        colors: { primary: '#2563eb', secondary: '#1e40af' },
        fonts: { heading: 'Inter', body: 'Inter' }
      }
    },
    {
      name: 'Portfolio Showcase',
      slug: 'portfolio-showcase',
      description: 'Clean portfolio template for creatives with gallery and project showcase',
      category: 'PORTFOLIO',
      isPublic: true,
      isFeatured: true,
      config: {
        theme: 'minimal',
        colors: { primary: '#000000', secondary: '#666666' },
        fonts: { heading: 'Playfair Display', body: 'Inter' }
      }
    },
    {
      name: 'Blog Starter',
      slug: 'blog-starter',
      description: 'Content-focused blog template with article listings and newsletter signup',
      category: 'BLOG',
      isPublic: true,
      isFeatured: true,
      config: {
        theme: 'editorial',
        colors: { primary: '#059669', secondary: '#047857' },
        fonts: { heading: 'Merriweather', body: 'Source Sans Pro' }
      }
    }
  ];

  for (const template of templates) {
    const created = await prisma.template.upsert({
      where: { slug: template.slug },
      update: {},
      create: {
        ...template,
        creatorId: admin.id
      }
    });
    console.log('Created template:', created.name);
  }

  // Create default components
  const components = [
    {
      name: 'Hero Section',
      slug: 'hero-section',
      type: 'HERO',
      description: 'Full-width hero section with headline, subtitle, and CTA button',
      isPublic: true,
      html: '<section class="hero"><h1>{{headline}}</h1><p>{{subtitle}}</p><a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a></section>',
      css: '.hero { padding: 4rem 2rem; text-align: center; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; } .hero h1 { font-size: 3rem; margin-bottom: 1rem; } .hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; } .cta-button { display: inline-block; padding: 0.75rem 2rem; background: white; color: var(--primary); text-decoration: none; border-radius: 0.5rem; font-weight: 600; }',
      props: { headline: 'Build Something Amazing', subtitle: 'Create your dream website in minutes', ctaText: 'Get Started', ctaLink: '#' }
    },
    {
      name: 'Features Grid',
      slug: 'features-grid',
      type: 'FEATURES',
      description: '3-column feature grid with icons and descriptions',
      isPublic: true,
      html: '<section class="features"><div class="container"><h2>{{title}}</h2><div class="grid">{{#each features}}<div class="feature"><div class="icon">{{icon}}</div><h3>{{title}}</h3><p>{{description}}</p></div>{{/each}}</div></div></section>',
      css: '.features { padding: 4rem 2rem; } .features .container { max-width: 1200px; margin: 0 auto; } .features h2 { text-align: center; margin-bottom: 3rem; } .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; } .feature { text-align: center; padding: 2rem; } .icon { font-size: 2rem; margin-bottom: 1rem; }',
      props: { title: 'Why Choose Us', features: [{ icon: '⚡', title: 'Lightning Fast', description: 'Optimized for speed and performance' }, { icon: '🎨', title: 'Beautiful Design', description: 'Professionally crafted templates' }, { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' }] }
    },
    {
      name: 'Pricing Table',
      slug: 'pricing-table',
      type: 'PRICING',
      description: 'Three-tier pricing table with feature comparison',
      isPublic: true,
      html: '<section class="pricing"><div class="container"><h2>{{title}}</h2><div class="pricing-grid">{{#each plans}}<div class="plan {{#if featured}}featured{{/if}}"><h3>{{name}}</h3><div class="price">{{price}}</div><ul>{{#each features}}<li>{{this}}</li>{{/each}}</ul><a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a></div>{{/each}}</div></div></section>',
      css: '.pricing { padding: 4rem 2rem; } .pricing .container { max-width: 1200px; margin: 0 auto; } .pricing h2 { text-align: center; margin-bottom: 3rem; } .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; } .plan { padding: 2rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-align: center; } .plan.featured { border-color: var(--primary); box-shadow: 0 0 20px rgba(37, 99, 235, 0.1); } .price { font-size: 2.5rem; font-weight: 700; margin: 1rem 0; } .plan ul { list-style: none; padding: 0; margin: 2rem 0; } .plan li { padding: 0.5rem 0; }',
      props: { title: 'Simple, Transparent Pricing', plans: [{ name: 'Starter', price: '$9/mo', features: ['1 Website', 'Basic Templates', 'Email Support'], ctaText: 'Start Free Trial', ctaLink: '#' }, { name: 'Professional', price: '$29/mo', features: ['10 Websites', 'All Templates', 'Priority Support', 'Custom Domain'], ctaText: 'Start Free Trial', ctaLink: '#', featured: true }, { name: 'Enterprise', price: '$99/mo', features: ['Unlimited Websites', 'White Label', 'Dedicated Support', 'API Access'], ctaText: 'Contact Sales', ctaLink: '#' }] }
    },
    {
      name: 'Testimonials',
      slug: 'testimonials',
      type: 'TESTIMONIALS',
      description: 'Customer testimonials carousel section',
      isPublic: true,
      html: '<section class="testimonials"><div class="container"><h2>{{title}}</h2><div class="testimonial-grid">{{#each testimonials}}<div class="testimonial"><p class="quote">"{{quote}}"</p><div class="author"><img src="{{avatar}}" alt="{{name}}" class="avatar"><div><strong>{{name}}</strong><span>{{role}}</span></div></div></div>{{/each}}</div></div></section>',
      css: '.testimonials { padding: 4rem 2rem; background: #f9fafb; } .testimonials .container { max-width: 1200px; margin: 0 auto; } .testimonials h2 { text-align: center; margin-bottom: 3rem; } .testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; } .testimonial { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); } .quote { font-style: italic; margin-bottom: 1.5rem; color: #374151; } .author { display: flex; align-items: center; gap: 1rem; } .avatar { width: 48px; height: 48px; border-radius: 50%; }',
      props: { title: 'What Our Customers Say', testimonials: [{ quote: 'This platform transformed our online presence. We went from zero to a professional website in under an hour.', name: 'Sarah Johnson', role: 'CEO, TechStart', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }, { quote: 'The AI-powered editing is a game-changer. We can update our site without any technical knowledge.', name: 'Michael Chen', role: 'Marketing Director, GrowthCo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' }] }
    },
    {
      name: 'Contact Form',
      slug: 'contact-form',
      type: 'FORM',
      description: 'Simple contact form with name, email, and message fields',
      isPublic: true,
      html: '<section class="contact"><div class="container"><h2>{{title}}</h2><form class="contact-form"><div class="form-group"><label for="name">Name</label><input type="text" id="name" name="name" required></div><div class="form-group"><label for="email">Email</label><input type="email" id="email" name="email" required></div><div class="form-group"><label for="message">Message</label><textarea id="message" name="message" rows="5" required></textarea></div><button type="submit" class="submit-btn">{{submitText}}</button></form></div></section>',
      css: '.contact { padding: 4rem 2rem; } .contact .container { max-width: 600px; margin: 0 auto; } .contact h2 { text-align: center; margin-bottom: 2rem; } .contact-form { display: flex; flex-direction: column; gap: 1.5rem; } .form-group { display: flex; flex-direction: column; gap: 0.5rem; } .form-group label { font-weight: 500; } .form-group input, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; } .submit-btn { padding: 0.75rem 2rem; background: var(--primary); color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }',
      props: { title: 'Get In Touch', submitText: 'Send Message' }
    },
    {
      name: 'Footer',
      slug: 'footer',
      type: 'FOOTER',
      description: 'Site footer with links, copyright, and social media icons',
      isPublic: true,
      html: '<footer class="footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><h3>{{brandName}}</h3><p>{{tagline}}</p></div><div class="footer-links">{{#each linkGroups}}<div class="link-group"><h4>{{title}}</h4><ul>{{#each links}}<li><a href="{{url}}">{{label}}</a></li>{{/each}}</ul></div>{{/each}}</div></div><div class="footer-bottom"><p>&copy; {{year}} {{brandName}}. All rights reserved.</p></div></div></footer>',
      css: '.footer { background: #1f2937; color: white; padding: 3rem 2rem 1rem; } .footer .container { max-width: 1200px; margin: 0 auto; } .footer-grid { display: grid; grid-template-columns: 2fr 3fr; gap: 3rem; margin-bottom: 2rem; } .footer-brand h3 { font-size: 1.5rem; margin-bottom: 0.5rem; } .footer-brand p { color: #9ca3af; } .footer-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; } .link-group h4 { margin-bottom: 1rem; } .link-group ul { list-style: none; padding: 0; } .link-group li { margin-bottom: 0.5rem; } .link-group a { color: #9ca3af; text-decoration: none; } .link-group a:hover { color: white; } .footer-bottom { border-top: 1px solid #374151; padding-top: 1rem; text-align: center; color: #9ca3af; }',
      props: { brandName: 'DJ Technologies', tagline: 'Building the future of digital creation', year: new Date().getFullYear(), linkGroups: [{ title: 'Product', links: [{ label: 'Features', url: '#' }, { label: 'Pricing', url: '#' }, { label: 'Templates', url: '#' }] }, { title: 'Company', links: [{ label: 'About', url: '#' }, { label: 'Blog', url: '#' }, { label: 'Careers', url: '#' }] }, { title: 'Support', links: [{ label: 'Help Center', url: '#' }, { label: 'Contact', url: '#' }, { label: 'Privacy', url: '#' }] }] }
    }
  ];

  for (const component of components) {
    const created = await prisma.component.upsert({
      where: { slug: component.slug },
      update: {},
      create: {
        ...component,
        creatorId: admin.id
      }
    });
    console.log('Created component:', created.name);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
