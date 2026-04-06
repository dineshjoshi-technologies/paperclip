// SaaS Product Landing Page Template
// Category: Landing Page
// Description: High-converting landing page template for SaaS products with feature highlights, social proof, and clear CTAs
// Tags: landing-page, saas, software, product, conversion

export const saasLandingTemplate = {
  name: "SaaS Product Landing Page",
  category: "Landing Page",
  description: "High-converting landing page template designed specifically for SaaS products with clear value propositions, feature highlights, pricing tables, and strong calls-to-action to drive sign-ups and conversions.",
  tags: ["landing-page", "saas", "software", "product", "conversion"],
  preview: "/templates/landing-page/saas-preview.png",
  sections: [
    // Hero Section with Clear Value Proposition
    {
      id: "hero-1",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
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
            content: "Work Smarter, Not Harder",
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
            content: "All-in-one platform that helps teams collaborate, automate workflows, and get more done in less time."
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
            label: "Start Free Trial",
            href: "#signup",
            variant: "secondary"
          },
          style: {
            padding: "0.75rem 2rem",
            backgroundColor: "#ffffff",
            textColor: "#0f172a",
            fontSize: "1rem",
            fontWeight: "500",
            borderRadius: "0.5rem"
          },
          position: 4
        },
        {
          type: "button",
          config: {
            label: "Watch Demo",
            href: "#demo",
            variant: "ghost"
          },
          style: {
            padding: "0.75rem 2rem",
            backgroundColor: "rgba(255,255,255,0.1)",
            textColor: "#ffffff",
            fontSize: "1rem",
            fontWeight: "500",
            borderRadius: "0.5rem"
          },
          position: 5
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
            content: "Powerful Features for Modern Teams",
            level: "h2"
          },
          style: {
            fontSize: "2.25rem",
            fontWeight: "600",
            textAlign: "center",
            textColor: "#ffffff",
            marginBottom: "3rem"
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
    // How It Works Section
    {
      id: "how-it-works-3",
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
            content: "How It Works",
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
            gap: "3rem",
            justifyContent: "center"
          },
          position: 2
        }
        // How it works steps will be populated dynamically
      ]
    },
    // Pricing Section
    {
      id: "pricing-4",
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
            content: "Simple, Transparent Pricing",
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
        // Pricing cards will be populated dynamically
      ]
    },
    // Testimonials Section
    {
      id: "testimonials-5",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundColor: "#f1f5f9",
            padding: "4rem 2rem"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "What Our Customers Say",
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
    // Call to Action Section
    {
      id: "cta-6",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            padding: "4rem 2rem",
            textAlign: "center",
            color: "#ffffff"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Ready to Transform Your Team's Productivity?",
            level: "h2"
          },
          style: {
            fontSize: "2rem",
            fontWeight: "600",
            textAlign: "center",
            textColor: "#ffffff",
            marginBottom: "1.5rem"
          },
          position: 1
        },
        {
          type: "button",
          config: {
            label: "Get Started Free",
            href: "#signup",
            variant: "secondary"
          },
          style: {
            padding: "0.75rem 2rem",
            backgroundColor: "#ffffff",
            textColor: "#0f172a",
            fontSize: "1rem",
            fontWeight: "500",
            borderRadius: "0.5rem"
          },
          position: 2
        }
      ]
    }
  ]
};