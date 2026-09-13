/**
 * =============================================================================
 * LOCAL GRAPH VISUALIZATION
 * =============================================================================
 *
 * Canvas-based force-directed graph visualization for showing connections
 * between content pages. Features:
 * - Subtle ambient motion (living network effect)
 * - Zoom toggle on canvas click
 * - Fullscreen mode
 * - Labels on hover or when zoomed
 * - Collection-based muted coloring
 */

(function () {
  "use strict";

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  const CONFIG = {
    // Node styling
    nodeRadius: 5,
    currentNodeRadius: 8,
    nodeStrokeWidth: 1.5,

    // Link styling
    linkWidth: 1,
    linkOpacity: 0.25,

    // Force simulation
    centerForce: 0.08,
    chargeStrength: -80,
    linkDistance: 50,
    collisionRadius: 18,

    // Animation
    alphaDecay: 0.015,
    velocityDecay: 0.5,

    // Ambient motion - subtle random drift
    ambientForce: 0.015,
    ambientFrequency: 0.0008,

    // Zoom settings
    zoomScale: 1.8,
    zoomTransitionMs: 400,

    // Muted colors by collection (softer, less saturated)
    colors: {
      blog: "#c084a8", // Muted rose
      notes: "#9b8abf", // Muted purple
      talks: "#7c9fc9", // Muted blue
      uses: "#6faa96", // Muted green
      now: "#c9a86c", // Muted amber
      changelog: "#8b8fc9", // Muted indigo
      about: "#8a9299", // Muted slate
      homelab: "#c98a8a", // Muted red
      default: "#8a9299", // Gray
    },

    // Text styling
    fontSize: 10,
    fontFamily: "SN Pro, system-ui, sans-serif",

    // Hover
    hoverScale: 1.4,

    // Dragging
    dragThreshold: 4,
  };

  // =============================================================================
  // GRAPH CLASS
  // =============================================================================

  class LocalGraph {
    constructor(container) {
      this.container = container;
      this.canvas = container.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");

      // Parse data from container attributes
      this.currentPath = container.dataset.current || "";
      this.graphData = JSON.parse(container.dataset.graph || '{"nodes":[],"links":[]}');

      // State
      this.nodes = [];
      this.links = [];
      this.hoveredNode = null;
      this.lightboxHoveredNode = null;
      this.dpr = window.devicePixelRatio || 1;

      // Lightbox state
      this.isExpanded = false;
      this.lightbox = null;
      this.lightboxCanvas = null;
      this.lightboxCtx = null;

      // Dragging state
      this.isDragging = false;
      this.draggedNode = null;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.didDrag = false;

      // Ambient motion state
      this.time = Math.random() * 1000; // Random start offset
      this.isAnimating = false;
      this.isDestroyed = false;
      this.animationFrameId = null;
      this.isDocumentVisible = !document.hidden;
      // IntersectionObserver updates this after the first layout pass. Keeping
      // the initial value true lets the graph render once before that callback.
      this.isInViewport = true;
      this.visibilityObserver = null;

      // Bind methods
      this.render = this.render.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleMouseLeave = this.handleMouseLeave.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.handleWheel = this.handleWheel.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.animate = this.animate.bind(this);
      this.handleLightboxClick = this.handleLightboxClick.bind(this);
      this.handleLightboxMouseMove = this.handleLightboxMouseMove.bind(this);
      this.handleLightboxMouseDown = this.handleLightboxMouseDown.bind(this);
      this.handleLightboxMouseUp = this.handleLightboxMouseUp.bind(this);
      this.handleLightboxMouseLeave = this.handleLightboxMouseLeave.bind(this);
      this.handleLightboxWheel = this.handleLightboxWheel.bind(this);
      this.handleLightboxTouchMove = this.handleLightboxTouchMove.bind(this);
      this.handleLightboxOverlayClick = this.handleLightboxOverlayClick.bind(this);

      this.lightboxCloseTimeout = null;
      this.lightboxOpenFrameId = null;
      this.previousBodyOverflow = "";
      this.bodyOverflowLocked = false;

      this.init();
    }

    init() {
      if (this.graphData.nodes.length === 0) return;

      this.setupCanvas();
      this.setupData();
      this.setupSimulation();
      this.setupEvents();
      this.createExpandButton();
      this.setupVisibilityObserver();
      this.startAmbientMotion();
    }

    setupCanvas() {
      const rect = this.container.getBoundingClientRect();
      const width = rect.width;
      const height = Math.min(300, Math.max(200, width * 0.5));

      // Set canvas size with DPR for sharp rendering
      this.canvas.width = width * this.dpr;
      this.canvas.height = height * this.dpr;
      this.canvas.style.width = width + "px";
      this.canvas.style.height = height + "px";

      this.ctx.scale(this.dpr, this.dpr);

      this.width = width;
      this.height = height;
    }

    setupData() {
      // Create node map for quick lookup
      const nodeMap = new Map();

      this.nodes = this.graphData.nodes.map((node, i) => {
        const n = {
          ...node,
          x: this.width / 2 + (Math.random() - 0.5) * 80,
          y: this.height / 2 + (Math.random() - 0.5) * 60,
          vx: 0,
          vy: 0,
          isCurrent: node.id === this.currentPath,
          color: CONFIG.colors[node.collection] || CONFIG.colors.default,
          // Unique offset for ambient motion (creates varied movement patterns)
          noiseOffset: Math.random() * Math.PI * 2 * i,
        };
        nodeMap.set(node.id, n);
        return n;
      });

      // Create links with node references
      this.links = this.graphData.links
        .map((link) => ({
          source: nodeMap.get(link.source),
          target: nodeMap.get(link.target),
        }))
        .filter((link) => link.source && link.target);
    }

    setupSimulation() {
      // Run initial force simulation to settle positions
      this.simulationAlpha = 1;
      this.runInitialSimulation();
    }

    runInitialSimulation() {
      // Run simulation for a fixed number of iterations to settle
      for (let i = 0; i < 100; i++) {
        this.simulationAlpha *= 1 - CONFIG.alphaDecay;
        this.applyForces(this.simulationAlpha);
        
        for (const node of this.nodes) {
          node.vx *= CONFIG.velocityDecay;
          node.vy *= CONFIG.velocityDecay;
          node.x += node.vx;
          node.y += node.vy;
          this.constrainNode(node);
        }
      }
      this.render();
    }

    constrainNode(node) {
      const r = node.isCurrent ? CONFIG.currentNodeRadius : CONFIG.nodeRadius;
      const margin = r + 10;
      node.x = Math.max(margin, Math.min(this.width - margin, node.x));
      node.y = Math.max(margin, Math.min(this.height - margin, node.y));
    }

    createExpandButton() {
      const btn = document.createElement("button");
      btn.className = "graph-expand-btn";
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>`;
      btn.title = "Expand graph";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openLightbox();
      });
      this.container.appendChild(btn);
      this.expandBtn = btn;
    }

    openLightbox() {
      if (this.isDestroyed || this.isExpanded) return;
      this.isExpanded = true;
      this.previousBodyOverflow = document.body.style.overflow;
      this.bodyOverflowLocked = true;

      // Create lightbox overlay
      const lightbox = document.createElement("div");
      this.lightbox = lightbox;
      this.lightbox.className = "graph-lightbox";
      
      // Create close button
      const closeBtn = document.createElement("button");
      closeBtn.className = "graph-lightbox-close";
      closeBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>`;
      closeBtn.addEventListener("click", () => this.closeLightbox());
      this.lightboxCloseButton = closeBtn;
      
      // Create canvas for lightbox
      this.lightboxCanvas = document.createElement("canvas");
      this.lightboxCanvas.className = "graph-lightbox-canvas";
      
      this.lightbox.appendChild(closeBtn);
      this.lightbox.appendChild(this.lightboxCanvas);
      document.body.appendChild(this.lightbox);
      document.body.style.overflow = "hidden";

      // Setup lightbox canvas
      this.setupLightboxCanvas();
      this.lightboxCtx = this.lightboxCanvas.getContext("2d");

      // Add event listeners
      this.lightboxCanvas.addEventListener("mousemove", this.handleLightboxMouseMove);
      this.lightboxCanvas.addEventListener("mousedown", this.handleLightboxMouseDown);
      this.lightboxCanvas.addEventListener("mouseup", this.handleLightboxMouseUp);
      this.lightboxCanvas.addEventListener("mouseleave", this.handleLightboxMouseLeave);
      this.lightboxCanvas.addEventListener("wheel", this.handleLightboxWheel, { passive: false });
      this.lightboxCanvas.addEventListener("click", this.handleLightboxClick);
      this.lightbox.addEventListener("click", this.handleLightboxOverlayClick);
      
      // Touch events for mobile
      this.lightboxCanvas.addEventListener("touchmove", this.handleLightboxTouchMove, { passive: false });

      // Animate in
      this.lightboxOpenFrameId = window.requestAnimationFrame(() => {
        this.lightboxOpenFrameId = null;
        if (this.lightbox === lightbox) {
          lightbox.classList.add("active");
        }
      });

      // The original graph may be offscreen while its lightbox is open. The
      // lightbox itself keeps the animation alive until it is closed.
      this.updateAnimationState();
    }

    setupLightboxCanvas() {
      const padding = 60;
      const maxWidth = window.innerWidth - padding * 2;
      const maxHeight = window.innerHeight - padding * 2;
      
      // Use larger size for lightbox
      const width = Math.min(maxWidth, 900);
      const height = Math.min(maxHeight, 600);

      this.lightboxCanvas.width = width * this.dpr;
      this.lightboxCanvas.height = height * this.dpr;
      this.lightboxCanvas.style.width = width + "px";
      this.lightboxCanvas.style.height = height + "px";

      this.lightboxWidth = width;
      this.lightboxHeight = height;
    }

    closeLightbox() {
      if (!this.isExpanded || !this.lightbox) return;
      if (this.lightboxCloseTimeout !== null) return;
      
      const lightbox = this.lightbox;
      if (this.lightboxOpenFrameId !== null) {
        window.cancelAnimationFrame(this.lightboxOpenFrameId);
        this.lightboxOpenFrameId = null;
      }
      lightbox.classList.remove("active");
      
      this.lightboxCloseTimeout = window.setTimeout(() => {
        this.lightboxCloseTimeout = null;
        if (this.lightbox === lightbox) {
          lightbox.remove();
          this.lightbox = null;
          this.lightboxCanvas = null;
          this.lightboxCtx = null;
          this.lightboxCloseButton = null;
        }
        this.isExpanded = false;
        if (this.bodyOverflowLocked) {
          document.body.style.overflow = this.previousBodyOverflow;
          this.bodyOverflowLocked = false;
        }
        this.updateAnimationState();
      }, 200);
    }

    startAmbientMotion() {
      this.updateAnimationState();
    }

    setupVisibilityObserver() {
      if (typeof window.IntersectionObserver !== "function") return;

      this.visibilityObserver = new window.IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry || this.isDestroyed) return;

        // Some test/browser shims omit intersectionRatio. isIntersecting is
        // the authoritative signal in that case.
        this.isInViewport = entry.isIntersecting !== false &&
          (entry.intersectionRatio === undefined || entry.intersectionRatio > 0);
        this.updateAnimationState();
      });
      this.visibilityObserver.observe(this.container);
    }

    shouldAnimate() {
      return !this.isDestroyed &&
        this.isDocumentVisible &&
        (this.isInViewport || this.isExpanded);
    }

    updateAnimationState() {
      if (this.shouldAnimate()) {
        this.resumeAnimation();
      } else {
        this.pauseAnimation();
      }
    }

    setDocumentVisibility(isVisible) {
      this.isDocumentVisible = isVisible;
      this.updateAnimationState();
    }

    resumeAnimation() {
      if (this.isDestroyed || this.animationFrameId !== null) return;

      this.isAnimating = true;
      this.animationFrameId = window.requestAnimationFrame(this.animate);
    }

    pauseAnimation() {
      this.isAnimating = false;
      if (this.animationFrameId !== null) {
        window.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    animate() {
      this.animationFrameId = null;
      if (!this.isAnimating || !this.shouldAnimate()) return;

      this.time += 1;

      // Apply physics to each node
      for (const node of this.nodes) {
        // Skip dragged node
        if (node === this.draggedNode) continue;

        // Apply velocity (from scatter or other forces)
        if (Math.abs(node.vx) > 0.01 || Math.abs(node.vy) > 0.01) {
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.92; // Friction
          node.vy *= 0.92;
        }

        // Apply subtle ambient motion (perlin-like noise)
        const noiseX = Math.sin(this.time * CONFIG.ambientFrequency + node.noiseOffset) * 
                       Math.cos(this.time * CONFIG.ambientFrequency * 0.7 + node.noiseOffset * 1.3);
        const noiseY = Math.cos(this.time * CONFIG.ambientFrequency * 0.8 + node.noiseOffset * 0.9) * 
                       Math.sin(this.time * CONFIG.ambientFrequency * 1.1 + node.noiseOffset);

        node.x += noiseX * CONFIG.ambientForce;
        node.y += noiseY * CONFIG.ambientForce;
        this.constrainNode(node);
      }

      // Render to main canvas
      this.render();
      
      // Also render to lightbox if open
      if (this.isExpanded && this.lightboxCtx) {
        this.renderLightbox();
      }

      if (this.shouldAnimate()) {
        this.animationFrameId = window.requestAnimationFrame(this.animate);
      } else {
        this.isAnimating = false;
      }
    }

    applyForces(alpha) {
      const centerX = this.width / 2;
      const centerY = this.height / 2;

      // Center force
      for (const node of this.nodes) {
        node.vx += (centerX - node.x) * CONFIG.centerForce * alpha;
        node.vy += (centerY - node.y) * CONFIG.centerForce * alpha;
      }

      // Charge (repulsion) force
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i];
          const b = this.nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (CONFIG.chargeStrength * alpha) / (dist * dist);

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      // Link force (attraction)
      for (const link of this.links) {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = ((dist - CONFIG.linkDistance) * alpha * 0.1) / dist;

        const fx = dx * force;
        const fy = dy * force;

        link.source.vx += fx;
        link.source.vy += fy;
        link.target.vx -= fx;
        link.target.vy -= fy;
      }

      // Collision force
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const a = this.nodes[i];
          const b = this.nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = CONFIG.collisionRadius * 2;

          if (dist < minDist) {
            const force = ((minDist - dist) / dist) * 0.5;
            const fx = dx * force;
            const fy = dy * force;

            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }
      }
    }

    render() {
      const ctx = this.ctx;

      // Clear canvas
      ctx.clearRect(0, 0, this.width, this.height);

      // Draw links
      ctx.lineWidth = CONFIG.linkWidth;
      ctx.globalAlpha = CONFIG.linkOpacity;

      for (const link of this.links) {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);

        // Use gradient between source and target colors
        const gradient = ctx.createLinearGradient(
          link.source.x,
          link.source.y,
          link.target.x,
          link.target.y
        );
        gradient.addColorStop(0, link.source.color);
        gradient.addColorStop(1, link.target.color);
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Draw nodes
      for (const node of this.nodes) {
        const isHovered = node === this.hoveredNode && !this.isExpanded;
        let radius = node.isCurrent
          ? CONFIG.currentNodeRadius
          : isHovered
            ? CONFIG.nodeRadius * CONFIG.hoverScale
            : CONFIG.nodeRadius;

        // Node fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Node stroke for current
        if (node.isCurrent) {
          ctx.lineWidth = CONFIG.nodeStrokeWidth;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.stroke();
        }
      }

      // Draw labels only on hover (in main canvas)
      for (const node of this.nodes) {
        const isHovered = node === this.hoveredNode && !this.isExpanded;

        if (isHovered) {
          this.drawLabel(ctx, node);
        }
      }
    }

    renderLightbox() {
      if (!this.lightboxCtx) return;

      const ctx = this.lightboxCtx;
      const width = this.lightboxWidth;
      const height = this.lightboxHeight;
      
      // Scale factor to fit nodes in lightbox
      const scale = Math.min(width / this.width, height / this.height) * 0.85;
      const offsetX = (width - this.width * scale) / 2;
      const offsetY = (height - this.height * scale) / 2;

      // Clear canvas
      ctx.save();
      ctx.scale(this.dpr, this.dpr);
      ctx.clearRect(0, 0, width, height);

      // Apply transform
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Draw links
      ctx.lineWidth = CONFIG.linkWidth / scale;
      ctx.globalAlpha = CONFIG.linkOpacity * 1.5; // Slightly more visible in lightbox

      for (const link of this.links) {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);

        const gradient = ctx.createLinearGradient(
          link.source.x,
          link.source.y,
          link.target.x,
          link.target.y
        );
        gradient.addColorStop(0, link.source.color);
        gradient.addColorStop(1, link.target.color);
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Draw nodes (larger in lightbox)
      const nodeScale = 1.5;
      for (const node of this.nodes) {
        const isHovered = node === this.lightboxHoveredNode;
        let radius = node.isCurrent
          ? CONFIG.currentNodeRadius * nodeScale
          : isHovered
            ? CONFIG.nodeRadius * CONFIG.hoverScale * nodeScale
            : CONFIG.nodeRadius * nodeScale;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        if (node.isCurrent) {
          ctx.lineWidth = CONFIG.nodeStrokeWidth;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.stroke();
        }
      }

      // Draw labels only on hover in lightbox
      for (const node of this.nodes) {
        const isHovered = node === this.lightboxHoveredNode;
        if (isHovered) {
          this.drawLabel(ctx, node, nodeScale);
        }
      }

      ctx.restore();
    }

    drawLabel(ctx, node, nodeScale = 1) {
      const radius = (node.isCurrent ? CONFIG.currentNodeRadius : CONFIG.nodeRadius) * nodeScale;
      
      ctx.font = `${CONFIG.fontSize}px ${CONFIG.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      const label = node.title;
      const textY = node.y - radius - 6;

      // Text background
      const metrics = ctx.measureText(label);
      const padding = 4;
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.beginPath();
      ctx.roundRect(
        node.x - metrics.width / 2 - padding,
        textY - CONFIG.fontSize - padding + 2,
        metrics.width + padding * 2,
        CONFIG.fontSize + padding * 2,
        4
      );
      ctx.fill();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, node.x, textY);
    }

    setupEvents() {
      this.canvas.addEventListener("mousemove", this.handleMouseMove);
      this.canvas.addEventListener("mousedown", this.handleMouseDown);
      this.canvas.addEventListener("mouseup", this.handleMouseUp);
      this.canvas.addEventListener("mouseleave", this.handleMouseLeave);
      this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
      this.canvas.addEventListener("click", this.handleClick);
      
      // Touch events for mobile swipe scatter
      this.canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false });

      window.addEventListener("resize", this.handleResize);
      
      // ESC to close lightbox
      this.escHandler = (e) => {
        if (e.key === "Escape" && this.isExpanded) {
          this.closeLightbox();
        }
      };
      document.addEventListener("keydown", this.escHandler);
    }

    handleMouseLeave() {
      this.hoveredNode = null;
      if (this.isDragging) {
        this.isDragging = false;
        this.draggedNode = null;
      }
    }

    handleTouchMove(e) {
      e.preventDefault();
      this.scatterNodes(2);
    }

    scatterNodes(intensity = 2) {
      // Apply random velocity to all nodes
      for (const node of this.nodes) {
        node.vx += (Math.random() - 0.5) * intensity * 3;
        node.vy += (Math.random() - 0.5) * intensity * 3;
      }
    }

    handleWheel(e) {
      e.preventDefault();
      // Scatter nodes based on scroll intensity
      const intensity = Math.min(Math.abs(e.deltaY) + Math.abs(e.deltaX), 100) / 30;
      this.scatterNodes(intensity);
    }

    handleMouseDown(e) {
      this.didDrag = false;
      if (this.hoveredNode) {
        this.isDragging = true;
        this.draggedNode = this.hoveredNode;
        const rect = this.canvas.getBoundingClientRect();
        this.dragStartX = e.clientX - rect.left;
        this.dragStartY = e.clientY - rect.top;
        this.canvas.style.cursor = "grabbing";
      }
    }

    handleMouseUp(e) {
      if (this.isDragging) {
        this.isDragging = false;
        this.draggedNode = null;
        this.canvas.style.cursor = this.hoveredNode ? "pointer" : "default";
      }
    }

    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Handle dragging
      if (this.isDragging && this.draggedNode) {
        const distance = Math.hypot(x - this.dragStartX, y - this.dragStartY);
        this.didDrag = this.didDrag || distance >= CONFIG.dragThreshold;
        this.draggedNode.x = x;
        this.draggedNode.y = y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
        this.constrainNode(this.draggedNode);
        return;
      }

      // Find node under cursor
      let found = null;
      for (const node of this.nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = node.isCurrent ? CONFIG.currentNodeRadius : CONFIG.nodeRadius;

        if (dist <= radius * 1.8) {
          found = node;
          break;
        }
      }

      if (found !== this.hoveredNode) {
        this.hoveredNode = found;
        this.canvas.style.cursor = found ? "grab" : "default";
      }
    }

    handleClick(e) {
      // Browser click fires after mouseup. Consume the click generated by a
      // real drag so releasing a node never navigates to it.
      if (this.didDrag) {
        this.didDrag = false;
        return;
      }

      // Don't navigate if we just finished dragging
      if (this.isDragging) return;
      
      // If clicking on a node, navigate
      if (this.hoveredNode && !this.hoveredNode.isCurrent) {
        window.location.href = this.hoveredNode.id;
        return;
      }
      
      // If clicking on empty space, open lightbox
      if (!this.hoveredNode) {
        this.openLightbox();
      }
    }

    screenToGraphCoords(screenX, screenY) {
      // Transform screen coords to graph coords (reverse the lightbox transform)
      const scale = Math.min(this.lightboxWidth / this.width, this.lightboxHeight / this.height) * 0.85;
      const offsetX = (this.lightboxWidth - this.width * scale) / 2;
      const offsetY = (this.lightboxHeight - this.height * scale) / 2;
      
      return {
        x: (screenX - offsetX) / scale,
        y: (screenY - offsetY) / scale
      };
    }

    handleLightboxMouseMove(e) {
      if (!this.lightboxCanvas) return;
      
      const rect = this.lightboxCanvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { x, y } = this.screenToGraphCoords(screenX, screenY);

      // Handle dragging in lightbox
      if (this.isDragging && this.draggedNode) {
        const distance = Math.hypot(x - this.dragStartX, y - this.dragStartY);
        this.didDrag = this.didDrag || distance >= CONFIG.dragThreshold;
        this.draggedNode.x = x;
        this.draggedNode.y = y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
        this.constrainNode(this.draggedNode);
        return;
      }

      // Find node under cursor
      let found = null;
      for (const node of this.nodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = (node.isCurrent ? CONFIG.currentNodeRadius : CONFIG.nodeRadius) * 1.5;

        if (dist <= radius * 1.5) {
          found = node;
          break;
        }
      }

      if (found !== this.lightboxHoveredNode) {
        this.lightboxHoveredNode = found;
        this.lightboxCanvas.style.cursor = found ? "grab" : "default";
      }
    }

    handleLightboxMouseDown(e) {
      this.didDrag = false;
      if (this.lightboxHoveredNode) {
        this.isDragging = true;
        this.draggedNode = this.lightboxHoveredNode;
        const rect = this.lightboxCanvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const start = this.screenToGraphCoords(screenX, screenY);
        this.dragStartX = start.x;
        this.dragStartY = start.y;
        this.lightboxCanvas.style.cursor = "grabbing";
      }
    }

    handleLightboxMouseUp(e) {
      if (this.isDragging) {
        this.isDragging = false;
        this.draggedNode = null;
        this.lightboxCanvas.style.cursor = this.lightboxHoveredNode ? "grab" : "default";
      }
    }

    handleLightboxMouseLeave() {
      this.lightboxHoveredNode = null;
      if (this.isDragging) {
        this.isDragging = false;
        this.draggedNode = null;
      }
    }

    handleLightboxWheel(e) {
      e.preventDefault();
      const intensity = Math.min(Math.abs(e.deltaY) + Math.abs(e.deltaX), 100) / 30;
      this.scatterNodes(intensity);
    }

    handleLightboxTouchMove(e) {
      e.preventDefault();
      this.scatterNodes(3);
    }

    handleLightboxOverlayClick(e) {
      if (e.target === this.lightbox) this.closeLightbox();
    }

    handleLightboxClick(e) {
      // Consume the click that follows a drag, matching the main canvas.
      if (this.didDrag) {
        this.didDrag = false;
        return;
      }

      // Don't navigate if we just finished dragging
      if (this.isDragging) return;
      
      // If clicking on a node in lightbox, navigate
      if (this.lightboxHoveredNode && !this.lightboxHoveredNode.isCurrent) {
        window.location.href = this.lightboxHoveredNode.id;
      }
    }

    handleResize() {
      this.setupCanvas();
    }

    destroy() {
      if (this.isDestroyed) return;

      this.isDestroyed = true;
      this.pauseAnimation();

      this.canvas.removeEventListener("mousemove", this.handleMouseMove);
      this.canvas.removeEventListener("mousedown", this.handleMouseDown);
      this.canvas.removeEventListener("mouseup", this.handleMouseUp);
      this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
      this.canvas.removeEventListener("wheel", this.handleWheel);
      this.canvas.removeEventListener("click", this.handleClick);
      this.canvas.removeEventListener("touchmove", this.handleTouchMove);
      window.removeEventListener("resize", this.handleResize);
      document.removeEventListener("keydown", this.escHandler);

      if (this.visibilityObserver) {
        this.visibilityObserver.disconnect();
        this.visibilityObserver = null;
      }

      if (this.expandBtn) {
        this.expandBtn.remove();
        this.expandBtn = null;
      }

      if (this.lightboxOpenFrameId !== null) {
        window.cancelAnimationFrame(this.lightboxOpenFrameId);
        this.lightboxOpenFrameId = null;
      }

      if (this.lightboxCloseTimeout !== null) {
        window.clearTimeout(this.lightboxCloseTimeout);
        this.lightboxCloseTimeout = null;
      }

      if (this.lightbox) {
        this.lightbox.remove();
        this.lightbox = null;
      }
      this.lightboxCloseButton = null;
      this.lightboxCanvas = null;
      this.lightboxCtx = null;
      this.isExpanded = false;
      if (this.bodyOverflowLocked) {
        document.body.style.overflow = this.previousBodyOverflow;
        this.bodyOverflowLocked = false;
      }

      // Clear the back-reference so a future page-load can safely initialize
      // a container that survived a transition or was reused by the browser.
      if (this.container._graph === this) {
        this.container._graph = null;
      }
    }
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  // Astro can evaluate page scripts again after a view transition. Store one
  // controller on window so those evaluations reuse the existing listeners
  // and graph registry instead of creating another RAF/bootstrap tree.
  const CONTROLLER_KEY = "__localGraphController";
  const existingController = window[CONTROLLER_KEY];
  if (existingController && existingController.initGraphs) {
    existingController.initGraphs();
    return;
  }

  const controller = {
    graphs: new Set(),

    cleanupStaleGraphs() {
      for (const graph of this.graphs) {
        if (!document.documentElement.contains(graph.container)) {
          graph.destroy();
          this.graphs.delete(graph);
        }
      }
    },

    initGraphs() {
      this.cleanupStaleGraphs();

      // Initialize both main and sidebar graph containers. A container may
      // already hold a graph when another script evaluation reaches this page.
      const containers = document.querySelectorAll(".md-graph-container, .md-graph-container-sidebar");
      containers.forEach((container) => {
        if (container._graph && !container._graph.isDestroyed) {
          this.graphs.add(container._graph);
          return;
        }

        const graph = new LocalGraph(container);
        container._graph = graph;
        this.graphs.add(graph);
      });
    },

    destroyGraphs() {
      // Graphs belong to the outgoing document. Destroying them before Astro
      // swaps the DOM releases RAF callbacks, observers, and global handlers.
      for (const graph of this.graphs) {
        graph.destroy();
      }
      this.graphs.clear();
    },

    handleVisibilityChange() {
      const isVisible = !document.hidden;
      for (const graph of this.graphs) {
        graph.setDocumentVisibility(isVisible);
      }
    },
  };

  window[CONTROLLER_KEY] = controller;

  // Register this small global set once. The controller intentionally survives
  // page swaps while every LocalGraph instance is replaced with its document.
  document.addEventListener("astro:before-swap", () => controller.destroyGraphs());
  document.addEventListener("astro:page-load", () => controller.initGraphs());
  document.addEventListener("visibilitychange", () => controller.handleVisibilityChange());

  // Initialize on DOM ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => controller.initGraphs(), { once: true });
  } else {
    controller.initGraphs();
  }
})();
