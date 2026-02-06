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

## 📝 Notes

- Last updated: 2026-02-06
- Keep migration incremental: extract one module at a time and verify behavior after each move.
