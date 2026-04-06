// News Magazine Template
// Category: Blog/Media
// Description: Modern news magazine template with featured articles, categories, and clean layout
// Tags: news, magazine, media, journalism, publishing

export const newsMagazineTemplate = {
  name: "News Magazine",
  category: "Blog/Media",
  description: "Modern news magazine template designed for online publications with featured articles, category sections, trending topics, and clean, readable layout optimized for content consumption.",
  tags: ["news", "magazine", "media", "journalism", "publishing"],
  preview: "/templates/blog-media/news-magazine-preview.png",
  sections: [
    // Header with Navigation and Search
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
            padding: "1rem 2rem"
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
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          },
          position: 1
        }
        // Logo, navigation, and search will be populated dynamically
      ]
    },
    // Featured Hero Section
    {
      id: "featured-2",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundImage: "url('/templates/blog-media/news-hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "80vh",
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
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "3rem",
            borderRadius: "1rem",
            maxWidth: "600px"
          },
          position: 1
        },
        {
          type: "heading",
          config: {
            content: "Breaking: Major Climate Agreement Reached",
            level: "h1"
          },
          style: {
            fontSize: "2.75rem",
            fontWeight: "700",
            textAlign: "left",
            textColor: "#ffffff",
            marginBottom: "1.5rem",
            lineHeight: "1.3"
          },
          position: 2
        },
        {
          type: "paragraph",
          config: {
            content: "World leaders come together to establish new emissions targets in historic summit."
          },
          style: {
            fontSize: "1.25rem",
            fontWeight: "400",
            textAlign: "left",
            textColor: "#f0f0f0",
            maxWidth: "500px",
            marginBottom: "2rem"
          },
          position: 3
        },
        {
          type: "button",
          config: {
            label: "Read Full Story",
            href: "#article",
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
        }
      ]
    },
    // Categories Section
    {
      id: "categories-3",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            padding: "3rem 2rem",
            backgroundColor: "#f8fafc"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Topics",
            level: "h2"
          },
          style: {
            fontSize: "2rem",
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
        // Category chips will be populated dynamically
      ]
    },
    // Latest Articles Section
    {
      id: "articles-4",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            padding: "3rem 2rem"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Latest News",
            level: "h2"
          },
          style: {
            fontSize: "2rem",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Article cards will be populated dynamically
      ]
    },
    // Trending Section
    {
      id: "trending-5",
      components: [
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            backgroundColor: "#f1f5f9",
            padding: "3rem 2rem"
          },
          position: 0
        },
        {
          type: "heading",
          config: {
            content: "Trending Now",
            level: "h2"
          },
          style: {
            fontSize: "2rem",
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
        // Trending chips will be populated dynamically
      ]
    },
    // Newsletter Section
    {
      id: "newsletter-6",
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
            content: "Stay Informed",
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
            content: "Get the most important news of the day delivered to your inbox every morning. Sign up for our free daily newsletter."
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
      id: "footer-7",
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