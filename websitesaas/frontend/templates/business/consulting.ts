// Consulting Business Template
// Category: Business
// Description: Modern consulting firm template with focus on expertise, case studies, and client testimonials
// Tags: consulting, business, professional, services, advisory

export const consultingTemplate = {
  name: "Consulting Business",
  category: "Business",
  description: "Modern consulting firm template designed to showcase expertise, highlight case studies, and feature client testimonials with a clean, authoritative design.",
  tags: ["consulting", "business", "professional", "services", "advisory"],
  preview: "/templates/business/consulting-preview.png",
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
            backgroundColor: "#ffffff",
            padding: "4rem 2rem"
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
            content: "Strategic Consulting That Delivers Results",
            level: "h1"
          },
          style: {
            fontSize: "2.75rem",
            fontWeight: "700",
            textAlign: "center",
            textColor: "#0f172a",
            marginBottom: "1.5rem"
          },
          position: 2
        },
        {
          type: "paragraph",
          config: {
            content: "We partner with ambitious organizations to solve complex challenges and drive sustainable growth through data-driven strategies."
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
            marginBottom: "2rem"
          },
          position: 3
        },
        {
          type: "button",
          config: {
            label: "Our Approach",
            href: "#approach",
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
          position: 4
        }
      ]
    },
    // Expertise Section
    {
      id: "expertise-2",
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
            content: "Our Expertise",
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
            maxWidth: "1000px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Expertise cards will be populated dynamically
      ]
    },
    // Case Studies Section
    {
      id: "case-studies-3",
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
            content: "Proven Results",
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            maxWidth: "1000px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Case study cards will be populated dynamically
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
            backgroundColor: "#f1f5f9",
            padding: "4rem 2rem"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "What Clients Say",
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
    // Contact Section
    {
      id: "contact-5",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            padding: "4rem 2rem",
            textAlign: "center"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Ready to Elevate Your Business?",
            level: "h2"
          },
          style: {
            fontSize: "2rem",
            fontWeight: "600",
            textAlign: "center",
            textColor: "#0f172a",
            marginBottom: "1.5rem"
          },
          position: 1
        },
        {
          type: "paragraph",
          config: {
            content: "Let's discuss your challenges and explore how we can help you achieve your goals."
          },
          style: {
            fontSize: "1.125rem",
            fontWeight: "400",
            textAlign: "center",
            textColor: "#475569",
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
            label: "Schedule Consultation",
            href: "#contact",
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
    }
  ]
};