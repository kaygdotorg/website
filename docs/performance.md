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

Document-flow glass cards also suspend their backdrop blur beyond a 200px
viewport buffer. One IntersectionObserver restores the existing blur before
entry and disconnects during navigation. Fixed navigation and dialog glass are
excluded; no visible blur strength or card layout changes.

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

## Mobile browser viewport

The hero uses `100svh` and top/side cutout padding so collapsing Safari
controls do not reflow its content. Closed zoom and code overlays become
invisible after their exit fades, avoiding unused full-screen compositing.

The background uses an absolute document-height clipping surface
on touch WebKit with Safari 26.4 or newer. A root scroll timeline translates
the viewport-sized canvas by the scroll offset, avoiding a viewport-fixed
canvas while retaining the existing 30fps, approximately 1MP shader budget.
A body ResizeObserver and viewport resize listener update the scroll range;
there is no JavaScript scroll handler. A stable 128px paint buffer covers
obscured browser insets without resizing the shader with the toolbar.
Older Safari and other browsers retain the fixed implementation. Safari
26.4 introduced threaded scroll-driven animations, so older Safari does not
receive this path merely because it accepts the CSS syntax.

Verified against a production preview in the user's iPhone 18 Pro / iOS 27
simulator: the gradient appears behind the bottom controls and follows the
page while scrolling; page content appears beneath the status area after
scrolling. The initial top status strip still uses a solid colour. Removing
theme-color, using a root CSS gradient, and hiding fixed UI did not resolve
that initial strip in the simulator. This improves bottom coverage but does
not provide the requested full-screen background at the scroll origin.
The earlier edge fade has been removed rather than claimed as coverage.

WebKit [318137@main](https://github.com/WebKit/WebKit/commit/8b5cfad939f76e35a20fbc885759fb82914843d0)
explicitly introduces a system background over the leading obscured inset
on iOS 27 at the scroll origin. Its top extension scrolls with the document,
which explains the initial strip and subsequent reveal in the simulator.
Changing CSS viewport sizing cannot remove this native view. Do not spoof the
initial scroll position: that would displace content and interfere with
scroll restoration without granting control of Safari's status area.
