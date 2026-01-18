import { defineCollection, z } from 'astro:content';

// Base schema for dated entries (now, uses)
const datedEntrySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  excerpt: z.string().optional(), // Short summary for timeline view
  date: z.coerce.date(), // Required for timeline entries - auto-coerces strings to Date
  "last edited": z.coerce.date().optional(),
});

// Collection for /now entries
const now = defineCollection({
  type: 'content',
  schema: datedEntrySchema,
});

// Collection for /uses entries
const uses = defineCollection({
  type: 'content',
  schema: datedEntrySchema,
});

// Schema for regular pages (home, etc.)
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Obsidian frontmatter compatibility
    date: z.coerce.date().optional(), // Created/Published date
    "last edited": z.coerce.date().optional(), // Last Updated date
    lastUpdated: z.string().optional(), // Legacy field

    // Home page specific fields (optional for other pages)
    name: z.string().optional(),
    tagline: z.string().optional(),
    profileImage: z.string().optional(),
    email: z.string().optional(),
    quote: z.string().optional(),

    interests: z.array(z.string()).optional(),

    socialLinks: z.array(z.object({
      label: z.string(),
      url: z.string(),
    })).optional(),

    cardPhotos: z.array(z.object({
      src: z.string(),
      label: z.string(),
      href: z.string(),
      date: z.string().optional(),
    })).optional(),

    recentWriting: z.array(z.object({
      title: z.string(),
      date: z.string(),
      href: z.string(),
    })).optional(),

    projects: z.array(z.object({
      title: z.string(),
      description: z.string(),
      link: z.string(),
    })).optional(),

    // Page cards for scroll sections
    pageCards: z.array(z.object({
      title: z.string(),
      summary: z.string(),
      href: z.string(),
    })).optional(),
  }),
});

const photos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    date: z.string().optional(),
    camera: z.string().optional(),
    location: z.string().optional(),
  }),
});

// Schema for writing/blog posts (from Ghost)
const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    "last edited": z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(), // Feature image
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  pages,
  photos,
  now,
  uses,
  writing,
};
