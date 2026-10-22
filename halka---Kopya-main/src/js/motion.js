/**
 * Framer Motion Integration for Halka Life OS
 * Powered by 'motion' (Framer's core animation engine)
 */
import { animate, stagger } from 'motion';

/**
 * Animate widgets into view with spring-like physics and staggered reveals
 * @param {HTMLElement|HTMLElement[]} elements 
 */
export function animateWidgetEntrance(elements) {
  const targets = Array.isArray(elements) ? elements : [elements];
  if (!targets.length) return;

  // Staggered spring reveal
  animate(
    targets,
    {
      opacity: [0, 1],
      transform: ['translateY(20px) scale(0.96)', 'translateY(0px) scale(1)']
    },
    {
      duration: 0.45,
      delay: stagger(0.05),
      ease: [0.16, 1, 0.3, 1]
    }
  );
}

/**
 * Animate a widget removal with an exit transition
 * @param {HTMLElement} element 
 * @returns {Promise<void>}
 */
export async function animateWidgetExit(element) {
  if (!element) return;
  const animation = animate(
    element,
    {
      opacity: [1, 0],
      transform: ['scale(1)', 'scale(0.88) translateY(-12px)']
    },
    {
      duration: 0.24,
      ease: [0.4, 0, 0.2, 1]
    }
  );
  await animation.finished;
}

/**
 * Animate opening the catalog modal with spring bounce
 * @param {HTMLElement} modalEl 
 * @param {HTMLElement} dialogEl 
 */
export function animateModalOpen(modalEl, dialogEl) {
  if (!modalEl || !dialogEl) return;

  modalEl.classList.add('open');

  animate(
    modalEl,
    { opacity: [0, 1] },
    { duration: 0.25, ease: 'easeOut' }
  );

  animate(
    dialogEl,
    {
      opacity: [0, 1],
      transform: ['scale(0.92) translateY(24px)', 'scale(1) translateY(0px)']
    },
    {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1]
    }
  );
}

/**
 * Animate closing the catalog modal smoothly
 * @param {HTMLElement} modalEl 
 * @param {HTMLElement} dialogEl 
 * @returns {Promise<void>}
 */
export async function animateModalClose(modalEl, dialogEl) {
  if (!modalEl || !dialogEl) return;

  const animDialog = animate(
    dialogEl,
    {
      opacity: [1, 0],
      transform: ['scale(1) translateY(0px)', 'scale(0.95) translateY(14px)']
    },
    {
      duration: 0.2,
      ease: [0.4, 0, 1, 1]
    }
  );

  const animModal = animate(
    modalEl,
    { opacity: [1, 0] },
    { duration: 0.22, ease: 'easeOut' }
  );

  await Promise.all([animDialog.finished, animModal.finished]);
  modalEl.classList.remove('open');
}

/**
 * Animate catalog cards with staggered reveal
 * @param {HTMLElement[]} cards 
 */
export function animateCatalogCards(cards) {
  if (!cards || !cards.length) return;
  animate(
    cards,
    {
      opacity: [0, 1],
      transform: ['translateY(16px)', 'translateY(0px)']
    },
    {
      duration: 0.35,
      delay: stagger(0.04),
      ease: [0.16, 1, 0.3, 1]
    }
  );
}

/**
 * Elastic pulse animation on the central core ring
 * @param {HTMLElement} ringEl 
 */
export function animateRingPulse(ringEl) {
  if (!ringEl) return;
  animate(
    ringEl,
    {
      transform: [
        'scale(1)',
        'scale(1.04)',
        'scale(0.98)',
        'scale(1)'
      ]
    },
    {
      duration: 0.48,
      ease: [0.34, 1.56, 0.64, 1]
    }
  );
}
