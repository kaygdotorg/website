# Performance audit, October 2026

Production output was inspected across the homepage, photography, writing list,
and article pages. Payload sizes below describe generated files, not a browser
speed score or measured frame rate.

## Delivery changes

- Keep DaisyUI themes and resets, but exclude unused widget styles. The site
  renders custom components. Shared CSS fell from 322,538 to about 128,000 bytes
  (43,904 to about 24,000 bytes with gzip).
- Register only used font weights and italic faces. All five existing families
  remain available. Font output fell from 25 files / 976,888 bytes to 17 files /
  555,872 bytes. Only body 400 and UI 600 are explicitly preloaded.
- Generate small responsive WebP writing-list covers. Desktop 2x candidates
  total about 45 KB of local images rather than referencing 5.54 MB of covers.
  Images remain lazy; these totals do not imply every image loads immediately.
- Give local Markdown body images responsive candidates from 480 to 1920px.
  Keep `data-original-src` pointing to the copied full-resolution asset. Zoom
  continues to load the original only on interaction.
- Fetch the image manifest only when a hover preview or unresolved zoom source
  needs it. Cancel stale hover UI and clear detached gallery references.

## Runtime changes

Homepage deck events are delegated to the hand and disposed before navigation.
Pointer capture starts after horizontal intent, preserving ordinary clicks and
vertical scrolling. Navigation observers and comment fallback timers also clean
up. Shared frosted cards and photo prints no longer reserve permanent transform
layers, and homepage transitions target specific properties.

## Remaining costs

The deployment contains about 139 MB of original videos. Those files are kept
for explicit playback and direct links; deployment size is not page-load size.
Video transcoding or separate original storage should be measured independently.

Photography currently uses demo CDN previews. For local uploads, supply a
prebuilt `thumb`, or add collection `image()` metadata and imported assets before
relying on Astro optimization. A public-path string alone cannot be resized by
Astro's static image service. Never advertise fake responsive widths for it.

The grain background now drifts at 0.5 speed with about 30 draws per second,
retaining its 1MP backing-canvas cap. It freezes when the tab is hidden or
reduced motion is requested, and resumes without jumping after navigation.
Paper's native full-refresh-rate loop remains disabled.

Glass blur and the grain background remain rendering costs. Device profiling
is still needed to establish frame-time and input-latency improvements; this
audit does not claim an FPS or INP result.
