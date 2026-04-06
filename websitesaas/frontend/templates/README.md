# Website Templates

This directory contains 10 production-ready website templates for the DJ Technologies SaaS platform. Each template is designed to be fully responsive, visually appealing, and built using the existing component system from the page builder.

## Template Categories

### Business (2)
1. **Corporate** - Professional corporate website template for established businesses
2. **Consulting** - Modern consulting firm template with focus on expertise and case studies

### Portfolio (2)
1. **Creative** - Vibrant, creative portfolio template for designers and artists
2. **Photography** - Elegant, minimalist photography portfolio template

### E-commerce (2)
1. **Product Showcase** - Clean, modern e-commerce template for physical products
2. **Digital Products** - Sleek e-commerce template for digital products, software, and courses

### Landing Page (2)
1. **SaaS Product** - High-converting landing page template for SaaS products
2. **App Launch** - Mobile app launch landing page template

### Blog/Media (2)
1. **Personal Blog** - Clean, readable personal blog template focused on content
2. **News Magazine** - Modern news magazine template for online publications

## Template Structure

Each template exports a TypeScript object with the following properties:

- `name`: Display name of the template
- `category`: Category classification
- `description`: Detailed description of the template
- `tags`: Array of tags for filtering and search
- `preview`: Path to preview thumbnail image
- `sections`: Array of template sections, each containing:
  - `id`: Unique section identifier
  - `components`: Array of builder components that make up the section
    - Each component follows the `BuilderComponent` type from `@/components/builder/types.ts`
    - Includes `type`, `config`, `style`, and `position` properties

## Usage

Templates can be imported individually or as a group:

```typescript
// Import specific template
import { corporateTemplate } from '@/templates/business/corporate';

// Import all templates
import { allTemplates } from '@/templates';

// Import templates by category
import { templatesByCategory } from '@/templates';
```

## Seeding Templates to Database

To load these templates into the database, create a seed script in the backend that imports from this frontend templates directory:

```typescript
// In backend/scripts/seed-templates.ts
import { PrismaClient } from '@prisma/client'
import { allTemplates } from '../../websitesaas/frontend/templates'

const prisma = new PrismaClient()

async function main() {
  await prisma.template.deleteMany({})
  
  for (const templateData of allTemplates) {
    await prisma.template.create({
      data: {
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        previewUrl: templateData.preview,
        config: JSON.stringify({ sections: templateData.sections }),
        isPremium: false
      }
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run from the backend directory:
```bash
npx tsx scripts/seed-templates.ts
```

## Technical Notes

- All templates use the existing component system from the builder
- Sections are designed to be flexible and editable within the builder
- Placeholder content should be replaced with real content when used
- Templates are fully responsive and mobile-first
- Style properties use CSS values compatible with the builder's styling system
- Each template contains 5-10 sections as specified in requirements

## Preview Images

Preview thumbnail images should be placed in the corresponding template directories:
- `/templates/business/corporate-preview.png`
- `/templates/business/consulting-preview.png`
- etc.

These images are referenced in the `preview` field of each template and used in the template selection UI.