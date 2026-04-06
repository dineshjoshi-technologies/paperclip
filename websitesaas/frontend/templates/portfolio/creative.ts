// Creative Portfolio Template
// Category: Portfolio
// Description: Vibrant, creative portfolio template for designers, artists, and creative professionals
// Tags: portfolio, creative, design, artist, showcase

export const creativePortfolioTemplate = {
  name: "Creative Portfolio",
  category: "Portfolio",
  description: "Vibrant, creative portfolio template perfect for designers, artists, and creative professionals who want to showcase their work with bold colors and dynamic layouts.",
  tags: ["portfolio", "creative", "design", "artist", "showcase"],
  preview: "/templates/portfolio/creative-preview.png",
  sections: [
    // Hero Section with Animated Elements
    {
      id: "hero-1",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            content: "Hello, I'm Alex Morgan",
            level: "h1"
          },
          style: {
            fontSize: "3rem",
            fontWeight: "700",
            textAlign: "center",
            textColor: "#ffffff",
            marginBottom: "1rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          },
          position: 2
        },
        {
          type: "paragraph",
          config: {
            content: "Award-winning designer & visual storyteller creating meaningful experiences that connect brands with people."
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
            label: "View My Work",
            href: "#portfolio",
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
    // About Section
    {
      id: "about-2",
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
            content: "About Me",
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
    // Portfolio Section
    {
      id: "portfolio-3",
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
            content: "Featured Work",
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
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Portfolio items will be populated dynamically
      ]
    },
    // Skills Section
    {
      id: "skills-4",
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
            content: "Skills & Tools",
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
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center"
          },
          position: 2
        }
        // Skills tags will be populated dynamically
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
            backgroundColor: "#0f172a",
            padding: "4rem 2rem",
            textAlign: "center",
            color: "#ffffff"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Let's Create Something Amazing",
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
            content: "I'm always excited to discuss new projects, creative collaborations, or just chat about design."
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
            label: "Get In Touch",
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
    }
  ]
};