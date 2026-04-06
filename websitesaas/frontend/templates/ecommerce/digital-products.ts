// Digital Products E-commerce Template
// Category: E-commerce
// Description: Sleek e-commerce template for digital products, software, courses, and downloads
// Tags: e-commerce, digital, download, software, courses, saas

export const digitalProductsTemplate = {
  name: "Digital Products Store",
  category: "E-commerce",
  description: "Sleek, conversion-focused e-commerce template designed specifically for selling digital products like software, courses, templates, and downloads with emphasis on features, benefits, and social proof.",
  tags: ["e-commerce", "digital", "download", "software", "courses", "saas"],
  preview: "/templates/ecommerce/digital-products-preview.png",
  sections: [
    // Hero Section with Value Proposition
    {
      id: "hero-1",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            padding: "4rem 2rem",
            color: "#ffffff"
          },
          position: 0
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center"
          },
          position: 1
        },
        {
          type: "heading",
          config: {
            content: "Transform Your Workflow",
            level: "h1"
          },
          style: {
            fontSize: "3rem",
            fontWeight: "700",
            textAlign: "center",
            textColor: "#ffffff",
            marginBottom: "1.5rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          },
          position: 2
        },
        {
          type: "paragraph",
          config: {
            content: "Professional-grade digital tools designed to help you work smarter, create faster, and achieve more."
          },
          style: {
            fontSize: "1.25rem",
            fontWeight: "400",
            textAlign: "center",
            textColor: "#f0f0f0",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.7",
            marginBottom: "2.5rem"
          },
          position: 3
        },
        {
          type: "button",
          config: {
            label: "Explore Products",
            href: "#products",
            variant: "secondary"
          },
          style: {
            padding: "0.75rem 2rem",
            backgroundColor: "rgba(255,255,255,0.2)",
            textColor: "#ffffff",
            fontSize: "1rem",
            fontWeight: "500",
            borderRadius: "0.5rem",
            backdropFilter: "blur(10px)"
          },
          position: 4
        }
      ]
    },
    // Features Section
    {
      id: "features-2",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            padding: "4rem 2rem"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Why Choose Our Digital Products?",
            level: "h2"
          },
          style: {
            fontSize: "2.25rem",
            fontWeight: "600",
            textAlign: "center",
            textColor: "#ffffff",
            marginBottom: "2.5rem"
          },
          position: 1
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            maxWidth: "1000px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Feature cards will be populated dynamically
      ]
    },
    // Product Catalog Section
    {
      id: "products-3",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            padding: "4rem 2rem"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Our Digital Products",
            level: "h2"
          },
          style: {
            fontSize: "2.25rem",
            fontWeight: "600",
            textAlign: "center",
            textColor: "#ffffff",
            marginBottom: "2.5rem"
          },
          position: 1
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Product cards will be populated dynamically
      ]
    },
    // Testimonials Section
    {
      id: "testimonials-4",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundColor: "#f8fafc",
            padding: "4rem 2rem"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Trusted by Professionals",
            level: "h2"
          },
          style: {
            fontSize: "2.25rem",
            fontWeight: "600",
            textAlign: "center",
            textColor: "#0f172a",
            marginBottom: "2.5rem"
          },
          position: 1
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center"
          },
          position: 2
        }
        // Testimonial cards will be populated dynamically
      ]
    },
    // FAQ Section
    {
      id: "faq-5",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            padding: "4rem 2rem"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Frequently Asked Questions",
            level: "h2"
          },
          style: {
            fontSize: "2.25rem",
            fontWeight: "600",
            textAlign: "center",
            textColor: "#0f172a",
            marginBottom: "2rem"
          },
          position: 1
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // FAQ accordion will be populated dynamically
      ]
    }
  ]
};