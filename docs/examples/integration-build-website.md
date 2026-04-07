# Integration Tutorial: Build Website Programmatically

This tutorial shows you how to create, manage, and publish websites using the DJ Technologies API.

## Overview

We'll build a complete website from scratch using the API:

1. Create a new website
2. Add pages with components
3. Update page content
4. Publish the website
5. Manage website lifecycle

The full working example is at the end of this tutorial.

## Tutorial 1: Create Your First Website

### Step 1: Create a Website

```javascript
const response = await fetch('http://localhost:4000/api/v1/websites', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Awesome Site',
    domain: 'myawesomesite.example.com',
    description: 'A website built entirely via API',
    templateId: 'template_business', // Optional: use a template
  }),
});

const { data } = await response.json();
const website = data.website;

console.log('Website created:', website.id);
// {
//   id: 'web_abc123',
//   name: 'My Awesome Site',
//   domain: 'myawesomesite.example.com',
//   status: 'DRAFT',
//   createdAt: '2026-04-07T10:00:00.000Z'
// }
```

**Request parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Website name (1-100 chars) |
| domain | string | No | Custom domain |
| description | string | No | Website description |
| templateId | string | No | Template to use as starting point |

### Step 2: Add Pages to Your Website

A website needs at least one page. Let's create a home page:

```javascript
const pageResponse = await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}/pages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Home',
      slug: 'home',
      isHomepage: true,
      meta: {
        title: 'My Awesome Site - Home',
        description: 'Welcome to my awesome website',
        keywords: ['awesome', 'website'],
      },
      components: [
        {
          type: 'navbar',
          id: 'nav_001',
          props: {
            logo: 'MySite',
            links: [
              { label: 'Home', href: '#home' },
              { label: 'About', href: '#about' },
              { label: 'Contact', href: '#contact' },
            ],
          },
        },
        {
          type: 'hero',
          id: 'hero_001',
          props: {
            title: 'Welcome to My Awesome Site',
            subtitle: 'Built entirely using the DJ Technologies API',
            ctaText: 'Get Started',
            ctaLink: '#about',
            backgroundImage: '/images/hero-bg.jpg',
          },
        },
        {
          type: 'features',
          id: 'features_001',
          props: {
            title: 'Why Choose Us',
            items: [
              {
                icon: 'zap',
                title: 'Lightning Fast',
                description: 'Optimized for speed and performance',
              },
              {
                icon: 'shield',
                title: 'Secure',
                description: 'Built with security best practices',
              },
              {
                icon: 'heart',
                title: 'User-Friendly',
                description: 'Designed with users in mind',
              },
            ],
          },
        },
      ],
    }),
  }
);

const { data: pageData } = await pageResponse.json();
const homePage = pageData.page;

console.log('Home page created:', homePage.id);
```

**Available component types:**

| Type | Description | Common Props |
|------|-------------|--------------|
| `navbar` | Navigation bar | logo, links, logoUrl |
| `hero` | Hero/banner section | title, subtitle, ctaText, backgroundImage |
| `features` | Feature grid | title, items (array of icon/title/description) |
| `testimonial` | Customer testimonials | title, testimonials (array) |
| `pricing` | Pricing cards | title, plans (array) |
| `cta` | Call-to-action section | title, subtitle, buttonText |
| `footer` | Site footer | links, copyright, socialLinks |
| `text` | Rich text content | content (HTML/markdown) |
| `image` | Image display | src, alt, caption |
| `contact` | Contact form | email, phone, fields |

### Step 3: Update Page Components

Want to modify the hero section? Update the page:

```javascript
await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}/pages/${homePage.id}`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      components: [
        {
          type: 'hero',
          id: 'hero_001',
          props: {
            title: 'Welcome to the NEW Awesome Site', // Updated title
            subtitle: 'Now with API-powered content management',
            ctaText: 'Explore Now',
            ctaLink: '#about',
          },
        },
        // ... other components remain the same
      ],
    }),
  }
);
```

## Tutorial 2: Add an About Page

```javascript
const aboutResponse = await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}/pages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'About Us',
      slug: 'about',
      meta: {
        title: 'About Us - My Awesome Site',
        description: 'Learn more about our company',
      },
      components: [
        {
          type: 'text',
          id: 'text_001',
          props: {
            title: 'Our Story',
            content: `
              <p>We founded this company with a simple mission: make web development accessible to everyone.</p>
              <p>Using AI and modern technology, we've built a platform that allows anyone to create professional websites in minutes.</p>
            `,
          },
        },
        {
          type: 'team',
          id: 'team_001',
          props: {
            title: 'Meet the Team',
            members: [
              { name: 'Jane Doe', role: 'CEO', image: '/images/jane.jpg' },
              { name: 'John Smith', role: 'CTO', image: '/images/john.jpg' },
              { name: 'Alice Johnson', role: 'Designer', image: '/images/alice.jpg' },
            ],
          },
        },
      ],
    }),
  }
);

const { data: aboutData } = await aboutResponse.json();
console.log('About page created:', aboutData.page.id);
```

## Tutorial 3: Publish Your Website

Once you're happy with your website, it's time to publish:

```javascript
const publishResponse = await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}/publish`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
);

const { data: publishData } = await publishResponse.json();
console.log('Website published!', publishData.website.url);
// Website published! https://myawesomesite.djtechnologies.net
```

After publishing:
- The website status changes from `DRAFT` to `PUBLISHED`
- A live URL is generated
- SSL certificate is automatically provisioned
- CDN caching is enabled

## Tutorial 4: Manage Your Website

### List All Your Websites

```javascript
const response = await fetch('http://localhost:4000/api/v1/websites', {
  headers: { 'Authorization': `Bearer ${accessToken}` },
});

const { data } = await response.json();
console.log('Your websites:', data.websites);
console.log('Total:', data.pagination.total);

// Support pagination
const page2Response = await fetch(
  'http://localhost:4000/api/v1/websites?limit=10&offset=10',
  {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }
);
```

### Get Website Details

```javascript
const response = await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}`,
  {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }
);

const { data } = await response.json();
console.log('Website:', data.website);
```

### Update Website Settings

```javascript
await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Updated Site Name',
      description: 'New description',
      customDomain: 'www.mydomain.com',
      settings: {
        analytics: { googleAnalyticsId: 'UA-123456-1' },
        seo: { robotsTxt: 'User-agent: *\nAllow: /' },
      },
    }),
  }
);
```

### Archive a Website

```javascript
const response = await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}/archive`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
);

console.log('Website archived');
// Status changes to ARCHIVED
```

### Delete a Website

```javascript
await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}`,
  {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }
);

console.log('Website deleted');
```

**Warning:** Deletion is permanent and cannot be undone. Archive first if you want to preserve data.

## Tutorial 5: Manage Page Components

### Add a Component to Existing Page

```javascript
// Get existing page components
const pageResponse = await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}/pages/${homePage.id}`,
  {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }
);

const { data: pageData } = await pageResponse.json();
const existingComponents = pageData.page.components || [];

// Add new component
existingComponents.push({
  type: 'cta',
  id: 'cta_001',
  props: {
    title: 'Ready to Get Started?',
    subtitle: 'Join thousands of satisfied customers',
    buttonText: 'Sign Up Now',
    buttonLink: '/signup',
  },
});

// Update page with new component
await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}/pages/${homePage.id}/components`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'cta',
      props: {
        title: 'Ready to Get Started?',
        subtitle: 'Join thousands of satisfied customers',
        buttonText: 'Sign Up Now',
        buttonLink: '/signup',
      },
    }),
  }
);
```

### Delete a Component

```javascript
await fetch(
  `http://localhost:4000/api/v1/websites/${website.id}/pages/${homePage.id}/components/cta_001`,
  {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }
);

console.log('Component deleted');
```

## Complete Working Example

Here's a complete script that creates a full website with multiple pages:

```javascript
const API_BASE = 'http://localhost:4000/api/v1';
const TOKEN = process.env.DJ_API_TOKEN;

async function createCompleteWebsite() {
  // 1. Create website
  const siteResponse = await fetch(`${API_BASE}/websites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'API-Built Website',
      description: 'Created programmatically',
    }),
  });
  const { data: siteData } = await siteResponse.json();
  const website = siteData.website;

  console.log(`✓ Created website: ${website.name} (${website.id})`);

  // 2. Create home page
  const homePageResponse = await fetch(
    `${API_BASE}/websites/${website.id}/pages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Home',
        slug: 'home',
        isHomepage: true,
        components: [
          {
            type: 'navbar',
            props: {
              logo: website.name,
              links: [
                { label: 'Home', href: '/home' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ],
            },
          },
          {
            type: 'hero',
            props: {
              title: 'Welcome to Our Platform',
              subtitle: 'The best solution for your needs',
              ctaText: 'Learn More',
            },
          },
          {
            type: 'features',
            props: {
              title: 'Our Features',
              items: [
                { icon: 'star', title: 'Quality', description: 'Top-notch quality' },
                { icon: 'clock', title: 'Fast', description: 'Lightning fast delivery' },
                { icon: 'check', title: 'Reliable', description: '99.9% uptime' },
              ],
            },
          },
          {
            type: 'footer',
            props: {
              copyright: `© ${(new Date()).getFullYear()} ${website.name}`,
              links: [
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ],
            },
          },
        ],
      }),
    }
  );
  const { data: homePageData } = await homePageResponse.json();
  console.log(`✓ Created home page: ${homePageData.page.id}`);

  // 3. Create about page
  const aboutResponse = await fetch(
    `${API_BASE}/websites/${website.id}/pages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'About',
        slug: 'about',
        components: [
          {
            type: 'text',
            props: {
              title: 'About Us',
              content: '<p>We are a forward-thinking company dedicated to excellence.</p>',
            },
          },
        ],
      }),
    }
  );
  const { data: aboutData } = await aboutResponse.json();
  console.log(`✓ Created about page: ${aboutData.page.id}`);

  // 4. Publish website
  const publishResponse = await fetch(
    `${API_BASE}/websites/${website.id}/publish`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const { data: publishData } = await publishResponse.json();
  console.log(`✓ Published website: ${publishData.website.url}`);

  console.log('\n✨ Website creation complete!');
  return website;
}

// Run it
createCompleteWebsite().catch(console.error);
```

### Run the Example

```bash
# Set your API token
export DJ_API_TOKEN="dj_live_your_api_key_here"

# Run with Node.js
node create-website.js
```

## Website Status Lifecycle

```
┌───────┐   Create    ┌───────┐  Publish   ┌──────────┐
│ (new) │────────────►│ DRAFT │───────────►│ PUBLISHED │
└───────┘             └───────┘            └─────┬────┘
                                                  │
                                       Unpublish  │  Archive
                                       ┌────┴────┐
                                             │
                                        ┌────────┐
                                        │ARCHIVED│
                                        └────────┘
```

| Status | Description | Can Edit | Live URL |
|--------|-------------|----------|----------|
| DRAFT | Website is being built | Yes | No |
| PUBLISHED | Website is live | Yes | Yes |
| ARCHIVED | Website is archived | No | No |

## Next Steps

- Learn about [using templates](../templates.md) to speed up website creation
- Set up [webhooks](webhooks.md) to get notified when websites are published
- Review the complete [API reference](openapi.yaml)
- Check out [Python integration examples](python.md)
- Read about [webhook integration](../examples/integration-webhooks.md)
