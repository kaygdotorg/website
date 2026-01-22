# Roadmap

Future improvements and technical debt items for the personal-page codebase.

---

## 🔧 Code Quality

### Extract BaseLayout Scripts
**Priority:** Low | **Effort:** High | **Risk:** Medium

The `BaseLayout.astro` file is currently ~1247 lines with inline JavaScript handling:
- Theme toggle & system preference detection
- Scroll-aware navigation show/hide
- Mobile menu & keyboard shortcuts
- Image zoom gallery with swipe gestures
- Pagefind search integration

**Proposed solution:**
Extract into separate TypeScript modules:
```
src/scripts/
├── theme.ts        # Theme toggle, localStorage, system preference
├── navigation.ts   # Scroll detection, mobile menu, shortcuts
├── image-zoom.ts   # Gallery zoom, navigation, swipe gestures  
├── search.ts       # Pagefind integration
```

**Benefits:**
- BaseLayout shrinks to ~400 lines
- Scripts are cacheable separately
- Easier to test and debug
- Better code organization

---

## 📝 Notes

- Last updated: 2026-01-22
- Related commit: `refactor: consolidate duplicate pages into reusable components`
