# Roadmap

Future improvements and technical debt items for the website codebase.

---

## 🔧 Code Quality

### Extract BaseLayout Scripts
**Priority:** High | **Effort:** High | **Risk:** Medium

The client-side UI logic is currently concentrated in very large files:
- `src/layouts/BaseLayout.astro` (~1580 lines)
- `src/pages/index.astro` (~1660 lines)
- `src/layouts/MarkdownLayout.astro` (~700 lines)

These files include inline JavaScript for:
- Theme toggle & system preference detection
- Scroll-aware navigation show/hide
- Mobile menu & keyboard shortcuts
- Image zoom gallery with swipe gestures
- Pagefind search integration

**Proposed solution:**
Extract to focused client modules with explicit init/cleanup entry points:
```
src/scripts/
├── theme.ts        # Theme toggle, localStorage, system preference
├── navigation.ts   # Scroll detection, mobile menu, shortcuts
├── image-zoom.ts   # Gallery zoom, navigation, swipe gestures  
├── search.ts       # Pagefind integration
├── markdown.ts     # TOC, heading links, callouts, clipboard
└── homepage.ts     # Card deck + graph animation + hero/nav observers
```

**Benefits:**
- Smaller, easier-to-review Astro layout files
- Scripts are cacheable separately
- Easier to test and debug
- Lower risk of event-listener duplication on view transitions

---

## 🎨 Visual Refinement

### Dark Mode Contrast Pass
**Priority:** Medium | **Effort:** Medium | **Risk:** Low

The current visual system landed in a place where light mode reads clearly,
but dark mode compresses too many surfaces into the same value range.
Backgrounds, frosted cards, carousel containers, caption strips, and inactive
states are often too close together in luminance, which makes the interface
feel polished but flatter and less legible than intended.

**Observed design issue:**
- Page background, card background, and component chrome are too close in tone
- Contrast is being asked to come from tint alone instead of luminance first
- Secondary text is acceptable, but primary text and active states do not
  separate enough from surrounding UI in dark mode
- Multiple translucent dark layers stack into muddy purple-gray surfaces
- Borders and inner highlights are too subtle to define component edges cleanly

**Recommended pass order:**
1. Adjust global surface values first, before touching individual components
2. Improve text contrast for headings, body copy, and supporting metadata
3. Strengthen borders and edge definition with cleaner hairlines/highlights
4. Revisit component-specific dark mode styling only after the global system is
   clearer

**Practical implementation guidance:**
- Make the page background darker so cards can step forward more clearly
- Make cards slightly lighter and more opaque than the page background
- Brighten primary text to a more decisive dark-mode reading level
- Keep secondary text dimmer, but avoid putting all copy in the same muted band
- Use value contrast first; reintroduce color tint only as a secondary layer
- Reduce overuse of translucent dark overlays that visually collapse together
- Give active/selected states a stronger contrast jump than resting states
- Tighten the accent palette so glow/tint colors do not soften hierarchy

**Code areas to revisit during that pass:**
- `src/styles/global.css` global background and surface values
- Shared card/frosted surface definitions
- Typography color/alpha values in dark mode
- Border and inner highlight treatment
- Carousel dark-mode background, caption strip, and inactive/active slide states

---

## 📝 Notes

- Last updated: 2026-02-06
- Keep migration incremental: extract one module at a time and verify behavior after each move.
