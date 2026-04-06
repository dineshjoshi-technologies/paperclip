// Personal Blog Template
// Category: Blog/Media
// Description: Clean, readable personal blog template focused on content and typography
// Tags: blog, personal, writing, articles, journal

export const personalBlogTemplate = {
  name: "Personal Blog",
  category: "Blog/Media",
  description: "Clean, readable personal blog template focused on beautiful typography, easy navigation, and putting content first. Perfect for writers, journalists, and thought leaders who want to share their ideas with the world.",
  tags: ["blog", "personal", "writing", "articles", "journal"],
  preview: "/templates/blog-media/personal-blog-preview.png",
  sections: [
    // Header with Navigation
    {
      id: "header-1",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            padding: "1.5rem 2rem"
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
            justifyContent: "space-between",
            alignItems: "center"
          },
          position: 1
        }
        // Navigation and branding will be populated dynamically
      ]
    },
    // Hero Section
    {
      id: "hero-2",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundColor: "#f8fafc",
            padding: "6rem 2rem 4rem",
            textAlign: "center"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Thoughts on Design, Technology, and Creativity",
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
            content: "Exploring the intersection of creativity and technology through essays, tutorials, and reflections on the creative process."
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
        }
      ]
    },
    // Recent Posts Section
    {
      id: "posts-3",
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
            content: "Recent Articles",
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
        // Post cards will be populated dynamically
      ]
    },
    // About the Author Section
    {
      id: "about-4",
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
            content: "About the Author",
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
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            alignItems: "center"
          },
          position: 2
        }
        // About content will be populated dynamically
      ]
    },
    // Newsletter Section
    {
      id: "newsletter-5",
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
            content: "Get My Best Writing in Your Inbox",
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
            content: "Monthly essays on creativity, productivity, and living a meaningful life. No spam, just quality content."
          },
          style: {
            fontSize: "1.125rem",
            fontWeight: "400",
            textAlign: "center",
            textColor: "#cbd5e1",
            maxWidth: "500px",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "2rem"
          },
          position: 2
        },
        {
          type: "button",
          config: {
            label: "Subscribe",
            href: "#newsletter",
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
      id: "footer-6",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            padding: "3rem 2rem",
            textAlign: "center",
            color: "#64748b",
            fontSize: "0.875rem"
          },
          position: 0
        }
        // Footer content will be populated dynamically
      ]
    }
  ]
};