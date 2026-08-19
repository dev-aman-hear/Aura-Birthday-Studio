/**
 * Birthday Studio - Preset Preview View Modal (Section 2)
 * Visual Scene Sequence Inspector & Preset Handoff Modal
 * Supports mouse drag-to-scroll, touch swipe, wheel horizontal scroll, and directional arrows.
 */

import { Accessibility } from '../utils/Accessibility.js';

export class PresetPreviewView {
  constructor(options = {}) {
    this.preset = options.preset;
    this.onUsePreset = options.onUsePreset || (() => {});
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'presetPreviewModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    if (!this.preset) return modal;

    const defaultVar = this.preset.defaultVariant || (this.preset.availableVariants ? this.preset.availableVariants[0] : '3-scene');
    const scenes = this.preset.scenes ||
                   this.preset.sceneStructure ||
                   (this.preset.sceneBlueprints ? (this.preset.sceneBlueprints[defaultVar] || Object.values(this.preset.sceneBlueprints)[0]) : []);

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:820px; padding:24px; max-height:88vh; display:flex; flex-direction:column; overflow:hidden;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:2rem;">${this.preset.icon || '🎨'}</span>
            <div>
              <h3 style="font-size:1.25rem; font-weight:800; margin:0;">${this.preset.title}</h3>
              <span class="prompt-detected-badge" style="margin-top:2px; display:inline-block;">${(this.preset.occasion || 'birthday').toUpperCase()} • ${this.preset.category || 'Preset'}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnClosePresetPreview" aria-label="Close Preview Modal">✕</button>
        </div>

        <!-- Description -->
        <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.45; margin:0 0 16px 0;">
          ${this.preset.description}
        </p>

        <!-- Scene Sequence Header with Left/Right Quick-Scroll Buttons -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <h4 style="font-size:0.92rem; font-weight:800; margin:0;">Story Scene Sequence</h4>
            <span style="background:rgba(255,215,0,0.15); color:#ffd700; border:1px solid rgba(255,215,0,0.3); font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:10px;">
              ${scenes.length} Scenes
            </span>
          </div>

          <div style="display:flex; gap:6px;">
            <button class="btn btn-ghost btn-xs btn-icon" id="btnScrollSequenceLeft" title="Scroll Left (Drag / Swipe)">◀</button>
            <button class="btn btn-ghost btn-xs btn-icon" id="btnScrollSequenceRight" title="Scroll Right (Drag / Swipe)">▶</button>
          </div>
        </div>

        <!-- Interactive Drag-to-Scroll & Swipeable Scene Cards Strip -->
        <div class="preset-preview-sequence" id="presetPreviewSequence" style="display:flex; gap:12px; overflow-x:auto; padding-bottom:12px; margin-bottom:18px; flex:1; cursor:grab; user-select:none; -webkit-user-select:none; touch-action:pan-x;">
          ${scenes.map((s, i) => `
            <div class="preset-sequence-card" style="background:var(--surface-elevated); border:1px solid var(--border); border-radius:var(--radius-md, 8px); padding:14px; width:168px; min-width:168px; flex-shrink:0; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
              <div>
                <div style="font-size:0.75rem; color:var(--accent-gold, #ffd700); font-weight:800; letter-spacing:0.5px;">SCENE ${String(i + 1).padStart(2, '0')}</div>
                <div style="font-weight:700; font-size:0.88rem; margin-top:6px; color:var(--text, #fff); line-height:1.25;">${s.name || `Scene ${i + 1}`}</div>
              </div>
              <div style="font-size:0.72rem; color:var(--text-muted, #94a1b2); margin-top:10px; border-top:1px solid var(--border); padding-top:6px;">
                ${s.duration || 7}s • <span style="text-transform:capitalize;">${(s.template || 'scene').replace('special_', '')}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Footer Actions -->
        <div style="display:flex; gap:10px; justify-content:flex-end; border-top:1px solid var(--border); padding-top:16px;">
          <button class="btn btn-secondary" id="btnCancelPresetPreview">Close</button>
          <button class="btn btn-primary" id="btnConfirmUsePreset" style="min-height:44px; font-weight:800; padding:0 24px;">✨ Use This Preset</button>
        </div>
      </div>
    `;

    this.attachEvents(modal);

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }

  attachEvents(modal) {
    const sequence = modal.querySelector('#presetPreviewSequence');

    // 1. Navigation Arrow Buttons Click Scroll
    const btnLeft = modal.querySelector('#btnScrollSequenceLeft');
    const btnRight = modal.querySelector('#btnScrollSequenceRight');

    if (btnLeft && sequence) {
      btnLeft.addEventListener('click', () => {
        sequence.scrollBy({ left: -240, behavior: 'smooth' });
      });
    }
    if (btnRight && sequence) {
      btnRight.addEventListener('click', () => {
        sequence.scrollBy({ left: 240, behavior: 'smooth' });
      });
    }

    // 2. Mouse Drag-to-Scroll & Touch Swipe Implementation
    if (sequence) {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      sequence.addEventListener('mousedown', (e) => {
        isDown = true;
        sequence.classList.add('is-dragging');
        sequence.style.cursor = 'grabbing';
        startX = e.pageX - sequence.offsetLeft;
        scrollLeft = sequence.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        if (isDown) {
          isDown = false;
          sequence.classList.remove('is-dragging');
          sequence.style.cursor = 'grab';
        }
      });

      sequence.addEventListener('mouseleave', () => {
        if (isDown) {
          isDown = false;
          sequence.classList.remove('is-dragging');
          sequence.style.cursor = 'grab';
        }
      });

      sequence.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sequence.offsetLeft;
        const walk = (x - startX) * 1.5;
        sequence.scrollLeft = scrollLeft - walk;
      });

      // 3. Mouse Wheel to Horizontal Scroll
      sequence.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          sequence.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    // 4. Modal Close and Action Handlers
    modal.addEventListener('click', (e) => {
      if (e.target.closest('#btnClosePresetPreview') || e.target.closest('#btnCancelPresetPreview')) {
        modal.remove();
      }

      if (e.target.closest('#btnConfirmUsePreset')) {
        modal.remove();
        this.onUsePreset(this.preset);
      }
    });
  }
}
