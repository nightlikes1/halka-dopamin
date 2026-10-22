// Main Application Coordinator for Halka - Kişisel Hayat İşletim Sistemi

import { storage } from './storage.js';
import { sound } from './audio.js';
import { ChainRingRenderer } from './ring.js';
import { generateDailyBriefing } from './briefing.js';
import { WidgetManager, WIDGET_CATALOG } from './widgets.js';
import {
  animateWidgetEntrance,
  animateWidgetExit,
  animateModalOpen,
  animateModalClose,
  animateCatalogCards,
  animateRingPulse
} from './motion.js';

class HalkaApp {
  constructor() {
    this.storage = storage;
    this.sound = sound;
    this.ringRenderer = null;
    this.widgetManager = null;
    this.orbitRadius = 380; // Distance from center to widget center on desktop
    this.focusedWidgetId = null;
    this.init();
  }

  init() {
    // 1. Initialize Ring Renderer
    const ringSvg = document.getElementById('chain-ring-svg');
    this.ringRenderer = new ChainRingRenderer(ringSvg, {
      radius: 200,
      center: { x: 250, y: 250 }
    });

    // 2. Initialize Widget Manager
    this.widgetManager = new WidgetManager(
      this.storage,
      this.sound,
      (change) => this.handleWidgetStateChange(change)
    );

    // 3. Apply stored theme
    const profile = this.storage.getProfile();
    this.applyTheme(profile.theme || 'cyber-cyan');
    this.applyViewMode((profile.viewMode === 'grid') ? 'grid' : 'cockpit');

    // 4. Render initial elements
    this.renderCentralBriefing();
    this.renderWidgets();
    this.setupEventListeners();
    this.startClockTicker();

    // 5. Initial layout calculation & resize listener
    window.addEventListener('resize', () => this.updateLayout());
    setTimeout(() => this.updateLayout(), 150);
  }

  // --- THEME & VIEW MODE ---
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.storage.updateProfile({ theme });
    if (this.ringRenderer) {
      this.ringRenderer.setTheme(theme);
    }
    // Update theme selector buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  applyViewMode(mode) {
    const effectiveMode = (mode === 'grid') ? 'grid' : 'cockpit';
    this.storage.updateProfile({ viewMode: effectiveMode });

    const mainCanvas = document.getElementById('halka-main-canvas');
    if (mainCanvas) {
      mainCanvas.classList.toggle('mode-grid', effectiveMode === 'grid');
      mainCanvas.classList.toggle('mode-cockpit', effectiveMode !== 'grid');
    }

    const viewBtn = document.getElementById('btn-toggle-view');
    if (viewBtn) {
      viewBtn.innerHTML = effectiveMode === 'grid' 
        ? `<span class="icon">🛸</span> Kokpit Modu` 
        : `<span class="icon">⊞</span> Panel Modu`;
      viewBtn.title = effectiveMode === 'grid' 
        ? 'Kokpit Moduna Geç (Ortada Halka, Yanlarda Kanatlar)' 
        : 'Panel / Izgara Moduna Geç (Tüm Eklentiler Birlikte)';
    }

    this.renderWidgets();
    this.updateLayout();
  }

  // --- CENTRAL CORE & BRIEFING ---
  renderCentralBriefing() {
    const briefing = generateDailyBriefing(this.storage);
    const profile = this.storage.getProfile();

    const greetingEl = document.getElementById('core-greeting');
    const dateEl = document.getElementById('core-date');
    const statusTextEl = document.getElementById('core-status-text');
    const metricsContainer = document.getElementById('core-metrics');
    const activeCountBadge = document.getElementById('core-active-count');

    if (greetingEl) {
      greetingEl.innerHTML = `
        <span class="greeting-prefix">${briefing.greeting.split(',')[0]},</span>
        <button class="greeting-name-btn" id="btn-edit-name" title="İsmi Düzenle">
          ${escapeHtml(profile.name || 'Dostum')} ✎
        </button>
      `;
      // Bind inline name edit
      const editBtn = document.getElementById('btn-edit-name');
      if (editBtn) {
        editBtn.addEventListener('click', () => this.promptEditName());
      }
    }

    if (dateEl) {
      dateEl.textContent = briefing.dateStr;
    }

    if (statusTextEl) {
      statusTextEl.textContent = briefing.summaryText;
    }

    if (activeCountBadge) {
      activeCountBadge.textContent = `${briefing.activeCount} Halka Eklentisi`;
    }

    if (metricsContainer) {
      if (briefing.metrics.length > 0) {
        metricsContainer.innerHTML = briefing.metrics.map(m => `
          <div class="core-metric-pill" title="${m.label}">
            <span class="metric-icon">${m.icon}</span>
            <span class="metric-val">${m.value}</span>
          </div>
        `).join('');
      } else {
        metricsContainer.innerHTML = `
          <div class="core-metric-pill hint">
            <span class="metric-icon">✨</span>
            <span class="metric-val">Etrafına + ile eklenti ekle</span>
          </div>
        `;
      }
    }
  }

  startClockTicker() {
    const timeEl = document.getElementById('core-time-clock');
    const updateTime = () => {
      if (timeEl) {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        timeEl.innerHTML = `${h}:${m}<span class="time-sec">:${s}</span>`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  promptEditName() {
    const profile = this.storage.getProfile();
    const currentName = profile.name || '';
    const newName = prompt('Halka işletim sisteminde nasıl hitap edilsin?', currentName);
    if (newName !== null && newName.trim() !== '') {
      this.storage.updateProfile({ name: newName.trim() });
      this.sound.playSuccess();
      this.renderCentralBriefing();
    }
  }

  // --- RENDER WIDGETS ---
  // --- RENDER WIDGETS INTO CLEAN SYMMETRICAL WINGS OR UNIFIED GRID ---
  renderWidgets() {
    const isGrid = (this.storage.getProfile().viewMode === 'grid');
    const wingLeft = document.getElementById('widgets-wing-left');
    const wingRight = document.getElementById('widgets-wing-right');
    const gridContainer = document.getElementById('widgets-grid-container');
    const centerStage = document.getElementById('halka-center-stage');
    if (!wingLeft || !wingRight) return;

    const activeIds = this.storage.getActiveWidgetIds();
    wingLeft.innerHTML = '';
    wingRight.innerHTML = '';
    if (gridContainer) gridContainer.innerHTML = '';

    const existingBanner = centerStage ? centerStage.querySelector('.empty-orbit-banner') : null;
    if (existingBanner) existingBanner.remove();

    if (activeIds.length === 0) {
      if (centerStage) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-orbit-banner';
        emptyDiv.innerHTML = `
          <p>Halkanın etrafında henüz eklenti yok.</p>
          <button class="btn-action pulse" id="btn-empty-add">+ İlk Eklentini Ekle</button>
        `;
        centerStage.appendChild(emptyDiv);
        const btn = document.getElementById('btn-empty-add');
        if (btn) btn.addEventListener('click', () => this.openAddModal());
      }
      this.updateLayout();
      return;
    }

    const renderedWidgets = [];

    if (isGrid && gridContainer) {
      // Panel / Grid Modu: All widgets in a spacious responsive grid below the ring
      activeIds.forEach(id => {
        const html = this.widgetManager.renderWidgetHtml(id);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        const widgetEl = tempDiv.firstChild;
        if (widgetEl) {
          gridContainer.appendChild(widgetEl);
          this.widgetManager.bindWidgetEvents(widgetEl);
          renderedWidgets.push(widgetEl);
        }
      });
    } else {
      // Kokpit Modu: Split active widgets evenly: half to left wing, half to right wing (Zero overlapping!)
      const half = Math.ceil(activeIds.length / 2);
      const leftIds = activeIds.slice(0, half);
      const rightIds = activeIds.slice(half);

      leftIds.forEach(id => {
        const html = this.widgetManager.renderWidgetHtml(id);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        const widgetEl = tempDiv.firstChild;
        if (widgetEl) {
          wingLeft.appendChild(widgetEl);
          this.widgetManager.bindWidgetEvents(widgetEl);
          renderedWidgets.push(widgetEl);
        }
      });

      rightIds.forEach(id => {
        const html = this.widgetManager.renderWidgetHtml(id);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.trim();
        const widgetEl = tempDiv.firstChild;
        if (widgetEl) {
          wingRight.appendChild(widgetEl);
          this.widgetManager.bindWidgetEvents(widgetEl);
          renderedWidgets.push(widgetEl);
        }
      });
    }

    if (renderedWidgets.length > 0) {
      animateWidgetEntrance(renderedWidgets);
    }

    this.updateLayout();
  }

  // Update layout and SVG tethers connecting wings to central ring
  updateLayout() {
    const isGrid = (this.storage.getProfile().viewMode === 'grid');
    const wingLeft = document.getElementById('widgets-wing-left');
    const wingRight = document.getElementById('widgets-wing-right');
    if (!wingLeft || !wingRight) return;

    if (isGrid || this.focusedWidgetId || window.innerWidth < 1024) {
      if (this.ringRenderer) {
        this.ringRenderer.updateTethers([]);
      }
      return;
    }

    const allWidgetEls = [
      ...Array.from(wingLeft.querySelectorAll('.widget-card')),
      ...Array.from(wingRight.querySelectorAll('.widget-card'))
    ];

    if (this.ringRenderer) {
      setTimeout(() => {
        this.ringRenderer.updateTethers(allWidgetEls);
      }, 50);
    }
  }

  async handleWidgetStateChange(change) {
    if (change.type === 'focus') {
      this.enterFocusMode(change.widgetId);
    } else if (change.type === 'remove') {
      if (this.focusedWidgetId === change.widgetId) {
        this.exitFocusMode();
      }
      this.sound.playDelete();
      const cardEl = document.querySelector(`.widget-card[data-id="${change.widgetId}"]`);
      if (cardEl) {
        await animateWidgetExit(cardEl);
      }
      this.renderCentralBriefing();
      this.renderWidgets();
      if (this.ringRenderer) {
        this.ringRenderer.pulseChain();
      }
    } else {
      // State updated: refresh central briefing & metrics
      this.renderCentralBriefing();
    }
  }

  // --- FOCUS MODE: EXPAND RING & FOCUS ON EXTENSION ---
  enterFocusMode(widgetId) {
    const catalogItem = WIDGET_CATALOG.find(w => w.id === widgetId);
    if (!catalogItem) return;

    this.focusedWidgetId = widgetId;
    const ringWrapper = document.getElementById('central-ring-wrapper');
    const mainCanvas = document.getElementById('halka-main-canvas');
    const overviewPane = document.getElementById('core-overview-view');
    const focusedPane = document.getElementById('core-focused-view');
    const contentEl = document.getElementById('focused-widget-content');
    const badgeIcon = document.getElementById('focused-badge-icon');
    const badgeName = document.getElementById('focused-badge-name');

    // Hide connecting tethers during focus
    if (this.ringRenderer) {
      this.ringRenderer.updateTethers([]);
    }

    // Set accent color and expansion classes
    if (ringWrapper) {
      ringWrapper.style.setProperty('--focus-accent', catalogItem.accent);
      ringWrapper.classList.add('ring-focus-expanded');
    }

    if (mainCanvas) {
      mainCanvas.classList.add('focus-mode-active');
    }

    if (badgeIcon) badgeIcon.textContent = catalogItem.icon;
    if (badgeName) badgeName.textContent = catalogItem.name;

    // Render focused widget content
    if (contentEl) {
      this.widgetManager.renderFocusedWidget(widgetId, contentEl);
    }

    // Switch view panes with smooth fade
    if (overviewPane) overviewPane.classList.remove('active');
    if (focusedPane) focusedPane.classList.add('active');

    // Audio & tactile feedback
    this.sound.playFocusZoom();
    if (this.ringRenderer) {
      this.ringRenderer.pulseChain();
    }
  }

  exitFocusMode() {
    if (!this.focusedWidgetId) return;

    this.focusedWidgetId = null;
    const ringWrapper = document.getElementById('central-ring-wrapper');
    const mainCanvas = document.getElementById('halka-main-canvas');
    const overviewPane = document.getElementById('core-overview-view');
    const focusedPane = document.getElementById('core-focused-view');

    if (ringWrapper) {
      ringWrapper.classList.remove('ring-focus-expanded');
      ringWrapper.style.removeProperty('--focus-accent');
    }

    if (mainCanvas) {
      mainCanvas.classList.remove('focus-mode-active');
    }

    // Switch back to overview pane
    if (focusedPane) focusedPane.classList.remove('active');
    if (overviewPane) overviewPane.classList.add('active');

    this.sound.playFocusExit();
    this.renderCentralBriefing();
    this.updateLayout();
  }

  // --- MODAL: ADD EXTENSION CATALOG ---
  setupEventListeners() {
    // Open modal buttons
    document.querySelectorAll('.btn-open-catalog').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playClick();
        this.openAddModal();
      });
    });

    // Close modal
    const modal = document.getElementById('catalog-modal');
    const closeBtn = document.getElementById('catalog-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.sound.playClick();
        this.closeAddModal();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeAddModal();
      });
    }

    // View mode toggle (Kokpit vs Panel)
    const toggleViewBtn = document.getElementById('btn-toggle-view');
    if (toggleViewBtn) {
      toggleViewBtn.addEventListener('click', () => {
        const cur = this.storage.getProfile().viewMode || 'cockpit';
        const next = cur === 'grid' ? 'cockpit' : 'grid';
        this.sound.playClick();
        this.applyViewMode(next);
      });
    }

    // Collapse / Expand all cards toggle (Sadeleştir / Genişlet)
    const toggleCollapseBtn = document.getElementById('btn-toggle-collapse');
    if (toggleCollapseBtn) {
      let isAllCollapsed = false;
      toggleCollapseBtn.addEventListener('click', () => {
        isAllCollapsed = !isAllCollapsed;
        this.sound.playClick();
        document.querySelectorAll('.widget-card').forEach(card => {
          card.classList.toggle('collapsed', isAllCollapsed);
        });
        toggleCollapseBtn.innerHTML = isAllCollapsed 
          ? `<span class="icon">↕</span> Genişlet` 
          : `<span class="icon">↕</span> Sadeleştir`;
      });
    }

    // Sound toggle
    const soundToggleBtn = document.getElementById('btn-toggle-sound');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        const enabled = this.sound.toggleSound();
        soundToggleBtn.classList.toggle('muted', !enabled);
        soundToggleBtn.innerHTML = enabled ? '🔊' : '🔇';
      });
    }

    // Theme selector buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        this.sound.playClick();
        this.applyTheme(theme);
      });
    });

    // Return from focus mode button
    const returnRingBtn = document.getElementById('btn-return-ring');
    if (returnRingBtn) {
      returnRingBtn.addEventListener('click', () => {
        this.exitFocusMode();
      });
    }

    // Escape key to exit focus mode or modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('catalog-modal');
        if (modal && modal.classList.contains('open')) {
          this.closeAddModal();
        } else if (this.focusedWidgetId) {
          this.exitFocusMode();
        }
      }
    });

    // Clicking main canvas outside the ring when in focus mode to exit
    const mainCanvas = document.getElementById('halka-main-canvas');
    if (mainCanvas) {
      mainCanvas.addEventListener('click', (e) => {
        if (this.focusedWidgetId && !e.target.closest('#central-ring-wrapper')) {
          this.exitFocusMode();
        }
      });
    }

    // Ring click pulse (when not in focus mode)
    const ringWrapper = document.getElementById('central-ring-wrapper');
    if (ringWrapper) {
      ringWrapper.addEventListener('click', (e) => {
        if (!this.focusedWidgetId && !e.target.closest('button') && !e.target.closest('input')) {
          this.sound.playChainPulse();
          animateRingPulse(ringWrapper);
          if (this.ringRenderer) {
            this.ringRenderer.pulseChain();
          }
        }
      });
    }

    // Dynamic wing scrolling: update connection tethers in real time
    const wingLeft = document.getElementById('widgets-wing-left');
    const wingRight = document.getElementById('widgets-wing-right');
    const handleWingScroll = () => {
      if (this.wingScrollRaf) cancelAnimationFrame(this.wingScrollRaf);
      this.wingScrollRaf = requestAnimationFrame(() => this.updateLayout());
    };
    if (wingLeft) wingLeft.addEventListener('scroll', handleWingScroll, { passive: true });
    if (wingRight) wingRight.addEventListener('scroll', handleWingScroll, { passive: true });
  }

  openAddModal() {
    const modal = document.getElementById('catalog-modal');
    const grid = document.getElementById('catalog-items-grid');
    if (!modal || !grid) return;

    const activeIds = this.storage.getActiveWidgetIds();

    grid.innerHTML = WIDGET_CATALOG.map(item => {
      const isAlreadyActive = activeIds.includes(item.id);
      return `
        <div class="catalog-card ${isAlreadyActive ? 'is-active' : ''}" data-catalog-id="${item.id}">
          <div class="catalog-card-icon" style="background: ${item.accent}20; color: ${item.accent}">
            ${item.icon}
          </div>
          <div class="catalog-card-info">
            <div class="catalog-card-title-row">
              <h4>${item.name}</h4>
              <span class="catalog-category-tag">${item.category}</span>
            </div>
            <p>${item.desc}</p>
          </div>
          <button class="catalog-card-action-btn ${isAlreadyActive ? 'btn-active-badge' : 'btn-add-badge'}">
            ${isAlreadyActive ? 'Halkada Aktif ✓' : '+ Halka\'ya Ekle'}
          </button>
        </div>
      `;
    }).join('');

    // Bind add clicks
    grid.querySelectorAll('.catalog-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.catalogId;
        const isAlreadyActive = this.storage.getActiveWidgetIds().includes(id);

        if (isAlreadyActive) {
          // If already active, ask if they want to remove it
          if (confirm(`"${card.querySelector('h4').textContent}" eklentisini halkadan kaldırmak istiyor musun?`)) {
            this.storage.removeWidget(id);
            this.sound.playDelete();
            this.renderWidgets();
            this.renderCentralBriefing();
            this.openAddModal(); // Refresh dialog
          }
        } else {
          this.storage.addWidget(id);
          this.sound.playSuccess();
          this.renderWidgets();
          this.renderCentralBriefing();
          if (this.ringRenderer) {
            this.ringRenderer.pulseChain();
          }
          this.closeAddModal();
        }
      });
    });

    const dialog = modal.querySelector('.modal-dialog');
    animateModalOpen(modal, dialog);
    const cards = Array.from(grid.querySelectorAll('.catalog-card'));
    animateCatalogCards(cards);
  }

  async closeAddModal() {
    const modal = document.getElementById('catalog-modal');
    const dialog = modal?.querySelector('.modal-dialog');
    if (modal && dialog) {
      await animateModalClose(modal, dialog);
    } else if (modal) {
      modal.classList.remove('open');
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

// Bootstrap once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.halkaApp = new HalkaApp();
});
