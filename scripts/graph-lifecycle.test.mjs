import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../public/scripts/graph.js", import.meta.url), "utf8");
const rafCallbacks = new Map();
const timerCallbacks = new Map();
const documentListeners = new Map();
const windowListeners = new Map();
let nextRafId = 1;
let nextTimerId = 1;

function addListener(map, type, listener) {
  const listeners = map.get(type) || [];
  listeners.push(listener);
  map.set(type, listeners);
}

function removeListener(map, type, listener) {
  const listeners = map.get(type) || [];
  map.set(type, listeners.filter((candidate) => candidate !== listener));
}

function getListeners(map, type) {
  return map.get(type) || [];
}

class EventTargetStub {
  constructor() {
    this.children = [];
    this.listeners = new Map();
    this.style = { overflow: "auto" };
    this.classList = { add() {}, remove() {} };
  }

  addEventListener(type, listener) {
    addListener(this.listeners, type, listener);
  }

  removeEventListener(type, listener) {
    removeListener(this.listeners, type, listener);
  }

  dispatch(type, event = {}) {
    for (const listener of [...getListeners(this.listeners, type)]) {
      listener({ target: this, ...event });
    }
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  remove() {
    this.removed = true;
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    }
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 500, height: 250 };
  }
}

const context2d = {
  scale() {},
  clearRect() {},
  beginPath() {},
  moveTo() {},
  lineTo() {},
  createLinearGradient() {
    return { addColorStop() {} };
  },
  stroke() {},
  arc() {},
  fill() {},
  measureText(text) {
    return { width: String(text).length * 5 };
  },
  roundRect() {},
  fillText() {},
  save() {},
  restore() {},
};

class CanvasStub extends EventTargetStub {
  getContext() {
    return context2d;
  }
}

class ElementStub extends EventTargetStub {
  querySelector(selector) {
    return selector === "canvas" ? this.canvas : null;
  }
}

function makeContainer() {
  const container = new ElementStub();
  container.canvas = new CanvasStub();
  container.dataset = {
    current: "/current",
    graph: JSON.stringify({
      nodes: [
        { id: "/current", title: "Current", collection: "blog" },
        { id: "/other", title: "Other", collection: "notes" },
      ],
      links: [{ source: "/current", target: "/other" }],
    }),
  };
  container.getBoundingClientRect = () => ({ width: 500, height: 250 });
  container.appendChild(container.canvas);
  return container;
}

let containers = [makeContainer()];
let intersectionCallback;

const document = {
  readyState: "complete",
  hidden: false,
  body: new EventTargetStub(),
  documentElement: {
    contains(node) {
      return containers.includes(node);
    },
  },
  querySelectorAll() {
    return containers;
  },
  createElement(tag) {
    return tag === "canvas" ? new CanvasStub() : new ElementStub();
  },
  addEventListener(type, listener) {
    addListener(documentListeners, type, listener);
  },
  removeEventListener(type, listener) {
    removeListener(documentListeners, type, listener);
  },
};

class IntersectionObserverStub {
  constructor(callback) {
    intersectionCallback = callback;
    this.disconnected = false;
  }

  observe() {}

  disconnect() {
    this.disconnected = true;
  }
}

const window = {
  devicePixelRatio: 1,
  innerWidth: 1200,
  innerHeight: 800,
  location: { href: "" },
  IntersectionObserver: IntersectionObserverStub,
  requestAnimationFrame(callback) {
    const id = nextRafId++;
    rafCallbacks.set(id, callback);
    return id;
  },
  cancelAnimationFrame(id) {
    rafCallbacks.delete(id);
  },
  setTimeout(callback) {
    const id = nextTimerId++;
    timerCallbacks.set(id, callback);
    return id;
  },
  clearTimeout(id) {
    timerCallbacks.delete(id);
  },
  addEventListener(type, listener) {
    addListener(windowListeners, type, listener);
  },
  removeEventListener(type, listener) {
    removeListener(windowListeners, type, listener);
  },
};

const context = vm.createContext({ window, document, console, Math, JSON, Set, Map });
vm.runInContext(source, context, { filename: "public/scripts/graph.js" });

const controller = window.__localGraphController;
assert.ok(controller);
assert.equal(controller.graphs.size, 1);
assert.deepEqual(
  ["astro:before-swap", "astro:page-load", "visibilitychange"].map(
    (type) => getListeners(documentListeners, type).length,
  ),
  [1, 1, 1],
);
assert.equal(rafCallbacks.size, 1);

const graph = [...controller.graphs][0];
const globalListenerCounts = ["astro:before-swap", "astro:page-load", "visibilitychange"].map(
  (type) => getListeners(documentListeners, type).length,
);

// Re-evaluating the page script reuses the controller and its listeners.
vm.runInContext(source, context, { filename: "public/scripts/graph-duplicate.js" });
assert.equal(window.__localGraphController, controller);
assert.deepEqual(
  ["astro:before-swap", "astro:page-load", "visibilitychange"].map(
    (type) => getListeners(documentListeners, type).length,
  ),
  globalListenerCounts,
);
assert.equal(controller.graphs.size, 1);

// Hidden documents and offscreen containers stop the pending RAF and resume it.
document.hidden = true;
getListeners(documentListeners, "visibilitychange")[0]();
assert.equal(graph.isAnimating, false);
assert.equal(rafCallbacks.size, 0);
document.hidden = false;
getListeners(documentListeners, "visibilitychange")[0]();
assert.equal(graph.isAnimating, true);
intersectionCallback([{ isIntersecting: false, intersectionRatio: 0 }]);
assert.equal(graph.isAnimating, false);
intersectionCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
assert.equal(graph.isAnimating, true);

// A click on empty canvas opens the lightbox; closing restores body state.
graph.canvas.dispatch("click");
assert.equal(graph.isExpanded, true);
assert.equal(document.body.style.overflow, "hidden");
// An expanded graph remains animated even when its inline canvas scrolls away.
// This keeps the lightbox responsive until it closes.
intersectionCallback([{ isIntersecting: false, intersectionRatio: 0 }]);
assert.equal(graph.isAnimating, true);
graph.closeLightbox();
assert.equal(timerCallbacks.size, 1);
const closeLightbox = [...timerCallbacks.values()][0];
closeLightbox();
assert.equal(graph.isExpanded, false);
assert.equal(document.body.style.overflow, "auto");

// A real drag consumes the browser click on the main canvas.
graph.hoveredNode = graph.nodes[1];
window.location.href = "";
graph.canvas.dispatch("mousedown", { clientX: 10, clientY: 10 });
graph.canvas.dispatch("mousemove", { clientX: 20, clientY: 20 });
graph.canvas.dispatch("mouseup", { clientX: 20, clientY: 20 });
graph.canvas.dispatch("click");
assert.equal(window.location.href, "");

// Movement below the threshold remains a regular click.
graph.canvas.dispatch("mousedown", { clientX: 10, clientY: 10 });
graph.canvas.dispatch("mousemove", { clientX: 12, clientY: 12 });
graph.canvas.dispatch("mouseup", { clientX: 12, clientY: 12 });
graph.canvas.dispatch("click");
assert.equal(window.location.href, "/other");

// The same suppression applies inside the lightbox.
graph.openLightbox();
graph.lightboxHoveredNode = graph.nodes[1];
window.location.href = "";
graph.lightboxCanvas.dispatch("mousedown", { clientX: 100, clientY: 100 });
graph.lightboxCanvas.dispatch("mousemove", { clientX: 110, clientY: 110 });
graph.lightboxCanvas.dispatch("mouseup", { clientX: 110, clientY: 110 });
graph.lightboxCanvas.dispatch("click");
assert.equal(window.location.href, "");

// Before-swap destroys all graph resources, including an open lightbox.
getListeners(documentListeners, "astro:before-swap")[0]();
assert.equal(controller.graphs.size, 0);
assert.equal(graph.isDestroyed, true);
assert.equal(graph.animationFrameId, null);
assert.equal(graph.visibilityObserver, null);
assert.equal(document.body.style.overflow, "auto");
assert.equal(rafCallbacks.size, 0);
assert.equal(containers[0]._graph, null);

// The existing page-load listener mounts the next page without duplication.
containers = [makeContainer()];
getListeners(documentListeners, "astro:page-load")[0]();
assert.equal(controller.graphs.size, 1);
assert.notEqual([...controller.graphs][0], graph);

console.log("graph lifecycle and drag checks passed");
