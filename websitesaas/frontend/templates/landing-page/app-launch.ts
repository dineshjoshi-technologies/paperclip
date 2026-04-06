// App Launch Landing Page Template
// Category: Landing Page
// Description: Mobile app launch landing page template with app store badges, screenshots, and feature highlights
// Tags: landing-page, app, mobile, ios, android, download

export const appLaunchTemplate = {
  name: "App Launch Landing Page",
  category: "Landing Page",
  description: "Mobile app launch landing page template designed to drive app downloads with prominent app store badges, device mockups, feature highlights, and social proof.",
  tags: ["landing-page", "app", "mobile", "ios", "android", "download"],
  preview: "/templates/landing-page/app-launch-preview.png",
  sections: [
    // Hero Section with App Store Badges
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
            textAlign: "center",
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 1
        },
        {
          type: "heading",
          config: {
            content: "Introducing Nova: Your Personal Productivity Assistant",
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
            content: "Stay organized, focused, and in control with the all-new productivity app designed for busy professionals who want to achieve more without the stress."
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
          position: 3
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
            marginTop: "2rem"
          },
          position: 4
        }
        // App store badges will be populated dynamically
      ]
    },
    // App Screenshots Section
    {
      id: "screenshots-2",
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
            content: "See Nova in Action",
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
            gap: "1.5rem",
            justifyContent: "center"
          },
          position: 2
        }
        // Screenshots will be populated dynamically
      ]
    },
    // Features Section
    {
      id: "features-3",
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
            content: "Why Users Love Nova",
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
      id: "how-it-works-4",
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
            content: "Simple & Intuitive",
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
            content: "What Our Users Say",
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
            content: "Ready to Boost Your Productivity?",
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
            label: "Download on the App Store",
            href: "#",
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
        },
        {
          type: "button",
          config: {
            label: "Get it on Google Play",
            href: "#",
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
          position: 3
        }
      ]
    }
  ]
};