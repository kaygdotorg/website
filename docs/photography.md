# Photography cards

Each Markdown file in `src/content/photography/` is one frosted card. For a deck,
use a `photos` array in its frontmatter. Each item owns its image and settings:

```yaml
title: An afternoon outside
photos:
  - title: A photograph title
    alt: Describe what is actually visible
    src: /photography/original.jpg
    thumb: /photography/preview.webp
    camera: Canon EOS R6 Mark III
    lens: RF 50mm F1.8 STM
    aperture: f/2.8
    shutterSpeed: 1/250 s
    iso: 400
    focalLength: 50 mm
    description: A short note about this photograph.
```

The settings above illustrate the field format, not the supplied demo images.
Use the actual capture metadata. Missing settings display “Not recorded”.
`width` and `height` may describe the source dimensions; the frame uses contain
so portraits and wide photos are not cropped. `location` and `date` are optional.

For a single photograph, use the same image/settings fields at the top level,
without `photos`; its Markdown body becomes the description. The top-level
`title` is the card title. `draft: true` hides either form.

The included sample collection is explicitly `demo: true`. Remove it when adding
original work. Images are not uploaded or published automatically by this UI.
Local files in `public/photography/` are served as supplied, so provide appropriately
sized previews. Only the existing Unsplash samples use generated CDN width URLs.

Select a print with click, Enter, or Space. Arrow keys move between photographs;
Escape or Close details collapses the card and returns focus to the print.
The component owns its listeners and removes them during Astro navigation.
