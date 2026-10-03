#!/usr/bin/env node

/**
 * Render the deterministic first frame used by GrainBackground.astro.
 *
 * The source is rendered in an offline Chromium WebGL context so these files
 * remain faithful to the live Paper GrainGradient shader. Run from the repo:
 *
 *   node scripts/generate-grain-previews.mjs
 *
 * Set CHROME_PATH when the cached Playwright headless shell is not available.
 * The script intentionally leaves the intermediate browser page in a temporary
 * directory only for the duration of the command and writes no extra assets.
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { stat } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(root, "public", "backgrounds");
mkdirSync(outputDir, { recursive: true });
const packageDir = join(root, "node_modules", "@paper-design", "shaders", "dist");
const playwrightCache = join(homedir(), ".cache", "ms-playwright");
const cachedShells = existsSync(playwrightCache)
  ? readdirSync(playwrightCache)
      .filter((name) => name.startsWith("chromium_headless_shell-"))
      .sort()
      .reverse()
      .flatMap((name) => [
        join(playwrightCache, name, "chrome-headless-shell-mac-arm64", "chrome-headless-shell"),
        join(playwrightCache, name, "chrome-headless-shell-mac-x64", "chrome-headless-shell"),
        join(playwrightCache, name, "chrome-headless-shell-linux64", "chrome-headless-shell"),
      ])
  : [];
const chromeCandidates = [
  process.env.CHROME_PATH,
  ...cachedShells,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser Nightly.app/Contents/MacOS/Brave Browser Nightly",
].filter(Boolean);
const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chromePath) {
  throw new Error(
    "Offline Chromium was not found. Set CHROME_PATH to a Chromium-based browser executable.",
  );
}

const renders = [
  {
    name: "grain-dark-wide",
    width: 960,
    height: 540,
    background: "#100e16",
    colors: ["#51334f", "#795035", "#29253f"],
  },
  {
    name: "grain-light-wide",
    width: 960,
    height: 540,
    background: "#faf7f2",
    colors: ["#e5d4e9", "#efd3af", "#f7e8dd"],
  },
  {
    name: "grain-dark-portrait",
    width: 360,
    height: 780,
    background: "#100e16",
    colors: ["#51334f", "#795035", "#29253f"],
  },
  {
    name: "grain-light-portrait",
    width: 360,
    height: 780,
    background: "#faf7f2",
    colors: ["#e5d4e9", "#efd3af", "#f7e8dd"],
  },
];

const moduleUrl = (file) => pathToFileURL(join(packageDir, file)).href;
const shaderMountUrl = moduleUrl("shader-mount.js");
const grainShaderUrl = moduleUrl("shaders/grain-gradient.js");
const colorUrl = moduleUrl("get-shader-color-from-string.js");
const noiseUrl = moduleUrl("get-shader-noise-texture.js");

const tempDir = mkdtempSync(join(tmpdir(), "website-grain-previews-"));

try {
  for (const render of renders) {
    const htmlPath = join(tempDir, `${render.name}.html`);
    const rawPath = join(tempDir, `${render.name}.png`);
    writeFileSync(htmlPath, createRenderPage(render));

    let dom;
    try {
      dom = execFileSync(
        chromePath,
        [
          "--headless",
          "--no-sandbox",
          "--disable-background-networking",
          "--disable-extensions",
          "--disable-sync",
          "--enable-unsafe-swiftshader",
          "--allow-file-access-from-files",
          "--hide-scrollbars",
          "--run-all-compositor-stages-before-draw",
          "--virtual-time-budget=10000",
          "--dump-dom",
          `--window-size=${render.width},${render.height}`,
          pathToFileURL(htmlPath).href,
        ],
        {
          encoding: "utf8",
          maxBuffer: 16 * 1024 * 1024,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    } catch (error) {
      if (error?.stderr) process.stderr.write(String(error.stderr));
      throw error;
    }
    if (!dom.includes('data-ready="true"')) {
      process.stderr.write(`Renderer DOM length=${dom.length} tail:\n${dom.slice(-1000)}\n`);
      throw new Error(`${render.name}: WebGL renderer did not signal a ready frame.`);
    }
    const frameMatch = dom.match(/<pre[^>]*id="grain-frame"[^>]*>([^<]+)<\/pre>/);
    if (!frameMatch) {
      throw new Error(`${render.name}: rendered canvas PNG was not returned by Chromium.`);
    }
    const dataUrl = frameMatch[1];
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    writeFileSync(rawPath, Buffer.from(base64, "base64"));

    const quality = render.width >= 900 ? 72 : 74;
    const outputPath = join(outputDir, `${render.name}.webp`);
    await sharp(rawPath)
      .webp({ quality, effort: 6, smartSubsample: true })
      .toFile(outputPath);

    // Keep one uncompressed frame for visual inspection outside the repo.
    if (render.name === "grain-dark-wide") {
      await sharp(rawPath).png().toFile("/tmp/website-grain-preview.png");
    }

    const metadata = await sharp(outputPath).metadata();
    const { size } = await stat(outputPath);
    console.log(`${render.name}: ${metadata.width}x${metadata.height}, ${size} bytes`);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

function createRenderPage(render) {
  const uniforms = JSON.stringify({
    background: render.background,
    colors: render.colors,
  });

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: ${render.background}; }
      #grain { width: 100vw; height: 100vh; }
      canvas { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="grain"></div>
    <script type="module">
      import { ShaderMount } from ${JSON.stringify(shaderMountUrl)};
      import { grainGradientFragmentShader, GrainGradientShapes } from ${JSON.stringify(grainShaderUrl)};
      import { getShaderColorFromString } from ${JSON.stringify(colorUrl)};
      import { getShaderNoiseTexture } from ${JSON.stringify(noiseUrl)};

      const settings = ${uniforms};
      const host = document.querySelector("#grain");
      const noise = getShaderNoiseTexture();
      if (noise) await noise.decode();

      const mount = new ShaderMount(host, grainGradientFragmentShader, {
        u_colorBack: getShaderColorFromString(settings.background),
        u_colors: settings.colors.map(getShaderColorFromString),
        u_colorsCount: 3,
        u_softness: 0.85,
        u_intensity: 0.2,
        u_noise: 0.08,
        u_shape: GrainGradientShapes.corners,
        ...(noise ? { u_noiseTexture: noise } : {}),
        u_fit: 1,
        u_scale: 1,
        u_rotation: 0,
        u_offsetX: 0,
        u_offsetY: 0,
        u_originX: 0.5,
        u_originY: 0.5,
        u_worldWidth: 0,
        u_worldHeight: 0,
      }, {
        alpha: false,
        antialias: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: true,
      }, 0, 12000, 1, 1048576);

      // ShaderMount sizes through ResizeObserver. Two animation frames allow
      // the observer to apply the final resolution before the exact frame draw.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      mount.setFrame(12000);
      document.documentElement.dataset.ready = "true";
      const frame = document.createElement("pre");
      frame.id = "grain-frame";
      frame.hidden = true;
      frame.textContent = mount.canvasElement.toDataURL("image/png");
      document.body.append(frame);
    </script>
  </body>
</html>`;
}
