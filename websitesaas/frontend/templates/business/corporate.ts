// Corporate Business Template
// Category: Business
// Description: Professional corporate website template for established businesses
// Tags: corporate, business, professional, company, enterprise

export const corporateTemplate = {
  name: "Corporate Business",
  category: "Business",
  description: "Professional corporate website template for established businesses with clean layout, professional color scheme, and sections for services, about, team, and contact.",
  tags: ["corporate", "business", "professional", "company", "enterprise"],
  preview: "/templates/business/corporate-preview.png",
  sections: [
    // Hero Section
    {
      id: "hero-1",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundColor: "#f8fafc",
            padding: "4rem 2rem",
            textAlign: "center",
            borderRadius: "0"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Innovative Solutions for Modern Business",
            level: "h1"
          },
          style: {
            fontSize: "3rem",
            fontWeight: "700",
            textAlign: "center",
            textColor: "#0f172a",
            marginBottom: "1.5rem"
          },
          position: 1
        },
        {
          type: "paragraph",
          config: {
            content: "We help businesses transform their digital presence with cutting-edge technology solutions tailored to your unique needs."
          },
          style: {
            fontSize: "1.25rem",
            fontWeight: "400",
            textAlign: "center",
            textColor: "#475569",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.7",
            marginBottom: "2.5rem"
          },
          position: 2
        },
        {
          type: "button",
          config: {
            label: "Get Started",
            href: "#services",
            variant: "primary"
          },
          style: {
            padding: "0.75rem 2rem",
            backgroundColor: "#0f172a",
            textColor: "#ffffff",
            fontSize: "1rem",
            fontWeight: "500",
            borderRadius: "0.5rem"
          },
          position: 3
        }
      ]
    },
    // Services Section
    {
      id: "services-2",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            padding: "4rem 2rem",
            backgroundColor: "#ffffff"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Our Services",
            level: "h2"
          },
          style: {
            fontSize: "2.25rem",
            fontWeight: "600",
            textAlign: "center",
            textColor: "#0f172a",
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
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center"
          },
          position: 2
        }
        // Service cards will be populated dynamically
      ]
    },
    // About Section
    {
      id: "about-3",
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
            content: "About Us",
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
            marginRight: "auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "3rem",
            alignItems: "center"
          },
          position: 2
        }
        // About content will be populated dynamically
      ]
    },
    // Call to Action Section
    {
      id: "cta-4",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundColor: "#0f172a",
            padding: "3rem 2rem",
            textAlign: "center"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Ready to Transform Your Business?",
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
          type: "paragraph",
          config: {
            content: "Let's work together to build something great. Contact us today to learn more about our services."
          },
          style: {
            fontSize: "1.125rem",
            fontWeight: "400",
            textAlign: "center",
            textColor: "#cbd5e1",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "2rem"
          },
          position: 2
        },
        {
          type: "button",
          config: {
            label: "Contact Us",
            href: "#contact",
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
          position: 3
        }
      ]
    },
    // Footer Section
    {
      id: "footer-5",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundColor: "#0f172a",
            padding: "3rem 2rem 2rem",
            color: "#cbd5e1"
          },
          position: 0
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "3rem",
            justifyContent: "space-between"
          },
          position: 1
        }
        // Footer content will be populated dynamically
      ]
    }
  ]
};