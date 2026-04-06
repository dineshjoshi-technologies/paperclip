// Product Showcase E-commerce Template
// Category: E-commerce
// Description: Clean, modern e-commerce template focused on showcasing physical products
// Tags: e-commerce, products, retail, shopping, storefront

export const productShowcaseTemplate = {
  name: "Product Showcase",
  category: "E-commerce",
  description: "Clean, modern e-commerce template perfect for showcasing physical products with emphasis on product imagery, detailed descriptions, and seamless shopping experience.",
  tags: ["e-commerce", "products", "retail", "shopping", "storefront"],
  preview: "/templates/ecommerce/product-showcase-preview.png",
  sections: [
    // Hero Section with Featured Product
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
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "3rem",
            alignItems: "center"
          },
          position: 1
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            flex: "1 1 400px"
          },
          position: 2
        },
        {
          type: "container",
          config: {
            children: []
          },
          style: {
            flex: "1 1 500px"
          },
          position: 3
        }
        // Product image and details will be populated dynamically
      ]
    },
    // Product Categories Section
    {
      id: "categories-2",
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
            content: "Shop By Category",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            maxWidth: "1000px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Category cards will be populated dynamically
      ]
    },
    // Featured Products Section
    {
      id: "featured-3",
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
            content: "New Arrivals",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto"
          },
          position: 2
        }
        // Featured product cards will be populated dynamically
      ]
    },
    // About the Brand Section
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
            content: "Our Story",
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
            content: "Founded on the principles of quality, sustainability, and timeless design, we create products that are made to last and designed to be loved."
          },
          style: {
            fontSize: "1.125rem",
            fontWeight: "400",
            textAlign: "center",
            textColor: "#475569",
            maxWidth: "800px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.7"
          },
          position: 2
        }
      ]
    },
    // Call to Action Section
    {
      id: "cta-5",
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
            content: "Free Shipping on All Orders",
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
            content: "Enjoy complimentary shipping on all orders, plus easy returns and exceptional customer service."
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
            label: "Shop Now",
            href: "#shop",
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