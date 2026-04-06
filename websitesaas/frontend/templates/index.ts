// Template exports for easy importing
// Full template structures with sections are in their respective category directories
// This file provides template metadata and exports for easy iteration
export const corporateTemplate = {
  name: "Corporate Business",
  category: "Business",
  description: "Professional corporate website template for established businesses with clean layout, professional color scheme, and sections for services, about, team, and contact.",
  tags: ["corporate", "business", "professional", "company", "enterprise"],
  preview: "/templates/business/corporate-preview.png",
  sections: []
}

export const consultingTemplate = {
  name: "Consulting Business",
  category: "Business",
  description: "Modern consulting firm template designed to showcase expertise, highlight case studies, and feature client testimonials with a clean, authoritative design.",
  tags: ["consulting", "business", "professional", "services", "advisory"],
  preview: "/templates/business/consulting-preview.png",
  sections: []
}

export const creativePortfolioTemplate = {
  name: "Creative Portfolio",
  category: "Portfolio",
  description: "Vibrant, creative portfolio template perfect for designers, artists, and creative professionals who want to showcase their work with bold colors and dynamic layouts.",
  tags: ["portfolio", "creative", "design", "artist", "showcase"],
  preview: "/templates/portfolio/creative-preview.png",
  sections: []
}

export const photographyPortfolioTemplate = {
  name: "Photography Portfolio",
  category: "Portfolio",
  description: "Elegant, minimalist photography portfolio template designed to let stunning visual work take center stage with clean typography and generous whitespace.",
  tags: ["portfolio", "photography", "minimalist", "gallery", "visual"],
  preview: "/templates/portfolio/photography-preview.png",
  sections: []
}

export const productShowcaseTemplate = {
  name: "Product Showcase",
  category: "E-commerce",
  description: "Clean, modern e-commerce template perfect for showcasing physical products with emphasis on product imagery, detailed descriptions, and seamless shopping experience.",
  tags: ["e-commerce", "products", "retail", "shopping", "storefront"],
  preview: "/templates/ecommerce/product-showcase-preview.png",
  sections: []
}

export const digitalProductsTemplate = {
  name: "Digital Products Store",
  category: "E-commerce",
  description: "Sleek, conversion-focused e-commerce template designed specifically for selling digital products like software, courses, templates, and downloads with emphasis on features, benefits, and social proof.",
  tags: ["e-commerce", "digital", "download", "software", "courses", "saas"],
  preview: "/templates/ecommerce/digital-products-preview.png",
  sections: []
}

export const saasLandingTemplate = {
  name: "SaaS Product Landing Page",
  category: "Landing Page",
  description: "High-converting landing page template designed specifically for SaaS products with clear value propositions, feature highlights, pricing tables, and strong calls-to-action to drive sign-ups and conversions.",
  tags: ["landing-page", "saas", "software", "product", "conversion"],
  preview: "/templates/landing-page/saas-preview.png",
  sections: []
}

export const appLaunchTemplate = {
  name: "App Launch Landing Page",
  category: "Landing Page",
  description: "Mobile app launch landing page template designed to drive app downloads with prominent app store badges, device mockups, feature highlights, and social proof.",
  tags: ["landing-page", "app", "mobile", "ios", "android", "download"],
  preview: "/templates/landing-page/app-launch-preview.png",
  sections: []
}

export const personalBlogTemplate = {
  name: "Personal Blog",
  category: "Blog/Media",
  description: "Clean, readable personal blog template focused on beautiful typography, easy navigation, and putting content first. Perfect for writers, journalists, and thought leaders who want to share their ideas with the world.",
  tags: ["blog", "personal", "writing", "articles", "journal"],
  preview: "/templates/blog-media/personal-blog-preview.png",
  sections: []
}

export const newsMagazineTemplate = {
  name: "News Magazine",
  category: "Blog/Media",
  description: "Modern news magazine template designed for online publications with featured articles, category sections, trending topics, and clean, readable layout optimized for content consumption.",
  tags: ["news", "magazine", "media", "journalism", "publishing"],
  preview: "/templates/blog-media/news-magazine-preview.png",
  sections: []
}

// Array of all templates for easy iteration
export const allTemplates = [
  corporateTemplate,
  consultingTemplate,
  creativePortfolioTemplate,
  photographyPortfolioTemplate,
  productShowcaseTemplate,
  digitalProductsTemplate,
  saasLandingTemplate,
  appLaunchTemplate,
  personalBlogTemplate,
  newsMagazineTemplate
]

// Group templates by category
export const templatesByCategory = {
  Business: [corporateTemplate, consultingTemplate],
  Portfolio: [creativePortfolioTemplate, photographyPortfolioTemplate],
  Ecommerce: [productShowcaseTemplate, digitalProductsTemplate],
  'Landing Page': [saasLandingTemplate, appLaunchTemplate],
  'Blog/Media': [personalBlogTemplate, newsMagazineTemplate]
}