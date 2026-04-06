// Photography Portfolio Template
// Category: Portfolio
// Description: Elegant, minimalist photography portfolio template focused on showcasing visual work
// Tags: portfolio, photography, minimalist, gallery, visual

export const photographyPortfolioTemplate = {
  name: "Photography Portfolio",
  category: "Portfolio",
  description: "Elegant, minimalist photography portfolio template designed to let stunning visual work take center stage with clean typography and generous whitespace.",
  tags: ["portfolio", "photography", "minimalist", "gallery", "visual"],
  preview: "/templates/portfolio/photography-preview.png",
  sections: [
    // Full-screen Hero with Image
    {
      id: "hero-1",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundImage: "url('/templates/portfolio/photography-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
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
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "3rem",
            borderRadius: "1rem",
            backdropFilter: "blur(5px)"
          },
          position: 1
        },
        {
          type: "heading",
          config: {
            content: "Emma Richardson",
            level: "h1"
          },
          style: {
            fontSize: "3.5rem",
            fontWeight: "700",
            textAlign: "center",
            textColor: "#ffffff",
            marginBottom: "1rem",
            letterSpacing: "-0.5px"
          },
          position: 2
        },
        {
          type: "paragraph",
          config: {
            content: "Fine Art & Documentary Photographer",
          },
          style: {
            fontSize: "1.5rem",
            fontWeight: "400",
            textAlign: "center",
            textColor: "#f0f0f0",
            marginBottom: "2.5rem"
          },
          position: 3
        },
        {
          type: "button",
          config: {
            label: "View Gallery",
            href: "#gallery",
            variant: "secondary"
          },
          style: {
            padding: "0.75rem 2rem",
            backgroundColor: "rgba(255,255,255,0.1)",
            textColor: "#ffffff",
            fontSize: "1rem",
            fontWeight: "500",
            borderRadius: "0.5rem",
            backdropFilter: "blur(5px)"
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
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "About My Work",
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
          type: "paragraph",
          config: {
            content: "I specialize in capturing authentic moments and telling visual stories that resonate. My work explores the intersection of humanity and environment through intimate, thoughtful imagery."
          },
          style: {
            fontSize: "1.125rem",
            fontWeight: "400",
            textAlign: "center",
            textColor: "#475569",
            lineHeight: "1.8",
            marginBottom: "2rem"
          },
          position: 2
        }
      ]
    },
    // Gallery Section
    {
      id: "gallery-3",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1400px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Gallery images will be populated dynamically
      ]
    },
    // Process Section
    {
      id: "process-4",
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
            content: "My Creative Process",
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
            maxWidth: "1000px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Process steps will be populated dynamically
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
            textAlign: "center",
            backgroundColor: "#0f172a",
            color: "#ffffff"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Let's Create Together",
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
            content: "I'm available for commissions, collaborations, and creative projects. Let's discuss how we can bring your vision to life."
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