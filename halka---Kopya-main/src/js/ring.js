// Chain Ring (Zincir Halka) SVG Renderer, Orbital Physics & Connection Lines

export class ChainRingRenderer {
  constructor(svgContainer, options = {}) {
    this.container = svgContainer;
    this.options = {
      linkCount: 32,
      radius: 230,
      center: { x: 260, y: 260 },
      theme: 'cyber-cyan',
      ...options
    };
    this.tetherSvg = document.getElementById('orbital-tethers');
    this.init();
  }

  init() {
    this.renderChain();
  }

  setTheme(theme) {
    this.options.theme = theme;
    this.renderChain();
  }

  setRadius(r) {
    this.options.radius = r;
    this.renderChain();
  }

  renderChain() {
    if (!this.container) return;
    const { linkCount, radius, center } = this.options;
    const { x: cx, y: cy } = center;

    // Build SVG definitions for metallic gradients & filters
    const svgContent = `
      <defs>
        <!-- Metallic Cyber Gradient for flat links -->
        <linearGradient id="linkGradFlat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--ring-metal-light, #c0e6ff)" />
          <stop offset="30%" stop-color="var(--ring-accent, #38bdf8)" />
          <stop offset="70%" stop-color="var(--ring-metal-dark, #0369a1)" />
          <stop offset="100%" stop-color="var(--ring-metal-deep, #082f49)" />
        </linearGradient>

        <!-- Metallic Gradient for interlinking perpendicular links -->
        <linearGradient id="linkGradEdge" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="var(--ring-metal-deep, #082f49)" />
          <stop offset="40%" stop-color="var(--ring-accent-alt, #0284c7)" />
          <stop offset="70%" stop-color="var(--ring-metal-light, #e0f2fe)" />
          <stop offset="100%" stop-color="var(--ring-metal-dark, #0c4a6e)" />
        </linearGradient>

        <!-- Chain Glow Filter -->
        <filter id="chainGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <!-- Subtle Link Shadow -->
        <filter id="linkShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.7)" />
        </filter>
      </defs>

      <!-- Background Ambient Energy Circle -->
      <circle cx="${cx}" cy="${cy}" r="${radius}" 
        fill="none" 
        stroke="var(--ring-glow-core, rgba(56, 189, 248, 0.2))" 
        stroke-width="12" 
        stroke-dasharray="6 8"
        class="ambient-energy-ring"
      />

      <circle cx="${cx}" cy="${cy}" r="${radius + 18}" 
        fill="none" 
        stroke="var(--ring-orbit-track, rgba(255, 255, 255, 0.04))" 
        stroke-width="1.5" 
        stroke-dasharray="4 14"
        class="outer-track-ring"
      />

      <circle cx="${cx}" cy="${cy}" r="${radius - 18}" 
        fill="none" 
        stroke="var(--ring-orbit-track, rgba(255, 255, 255, 0.04))" 
        stroke-width="1.5" 
        stroke-dasharray="2 10"
        class="inner-track-ring"
      />

      <!-- Chain Links Group -->
      <g id="chain-links-group" class="chain-links-rotator">
        ${this.generateLinksMarkup(linkCount, radius, cx, cy)}
      </g>
    `;

    this.container.innerHTML = svgContent;
  }

  generateLinksMarkup(N, R, cx, cy) {
    let markup = '';

    for (let i = 0; i < N; i++) {
      const angle = (2 * Math.PI * i) / N;
      const deg = (angle * 180) / Math.PI;
      const x = cx + R * Math.cos(angle);
      const y = cy + R * Math.sin(angle);
      const isFlat = i % 2 === 0;

      if (isFlat) {
        // Flat face-on chain link (outer ring with inner hole)
        markup += `
          <g transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${(deg + 90).toFixed(2)})" filter="url(#linkShadow)">
            <!-- Outer Link Loop -->
            <rect x="-19" y="-9" width="38" height="18" rx="9" ry="9" 
              fill="none" 
              stroke="url(#linkGradFlat)" 
              stroke-width="4.5" 
              class="chain-link flat-link" 
              data-index="${i}"
            />
            <!-- Metallic Specular Highlight Dot -->
            <rect x="-15" y="-7.5" width="30" height="2" rx="1" 
              fill="rgba(255, 255, 255, 0.6)" 
              opacity="0.8"
            />
            <!-- Link Core Rivet/Glow point -->
            <circle cx="0" cy="0" r="1.5" fill="var(--ring-accent, #38bdf8)" opacity="0.7" />
          </g>
        `;
      } else {
        // Interlocking edge-on chain link
        markup += `
          <g transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${(deg + 90).toFixed(2)})" filter="url(#linkShadow)">
            <!-- Passing through the adjacent links -->
            <rect x="-12" y="-10" width="24" height="20" rx="5" ry="5" 
              fill="none" 
              stroke="url(#linkGradEdge)" 
              stroke-width="5" 
              class="chain-link edge-link" 
              data-index="${i}"
            />
            <line x1="-8" y1="0" x2="8" y2="0" 
              stroke="rgba(0, 0, 0, 0.6)" 
              stroke-width="2.5" 
            />
          </g>
        `;
      }
    }

    return markup;
  }

  // Pulse animation through all links
  pulseChain() {
    const links = this.container.querySelectorAll('.chain-link');
    links.forEach((link, idx) => {
      setTimeout(() => {
        link.classList.add('link-pulse');
        setTimeout(() => link.classList.remove('link-pulse'), 400);
      }, idx * 18);
    });
  }

  // Update SVG tether connection lines between central ring and active widgets
  updateTethers(activeWidgets) {
    if (!this.tetherSvg) return;

    const ringContainer = document.getElementById('central-ring-wrapper');
    if (!ringContainer) return;

    const ringRect = ringContainer.getBoundingClientRect();
    const ringCenter = {
      x: ringRect.left + ringRect.width / 2,
      y: ringRect.top + ringRect.height / 2
    };

    const linesMarkup = activeWidgets.map(widgetEl => {
      const wRect = widgetEl.getBoundingClientRect();
      const wCenter = {
        x: wRect.left + wRect.width / 2,
        y: wRect.top + wRect.height / 2
      };

      // Calculate anchor on widget border closest to ring center
      const dx = wCenter.x - ringCenter.x;
      const dy = wCenter.y - ringCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return '';

      // Unit vector
      const ux = dx / dist;
      const uy = dy / dist;

      // Start at ring perimeter (approx 230px from ring center)
      const startX = ringCenter.x + ux * 210;
      const startY = ringCenter.y + uy * 210;

      // End at widget edge
      const endX = wCenter.x - ux * 60;
      const endY = wCenter.y - uy * 60;

      return `
        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" 
          stroke="var(--ring-tether-color, rgba(56, 189, 248, 0.25))" 
          stroke-width="2" 
          stroke-dasharray="5 7" 
          class="tether-line"
        />
        <circle cx="${endX}" cy="${endY}" r="3" fill="var(--ring-accent, #38bdf8)" class="tether-node" />
      `;
    }).join('');

    this.tetherSvg.innerHTML = linesMarkup;
  }
}
