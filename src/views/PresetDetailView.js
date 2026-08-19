/**
 * Birthday Studio - Preset Detail View (Section 5 & 8)
 * Preset Detail Drawer with Variant Length Selector (1, 2, 3, 5 Scenes, Story Mode)
 */

export class PresetDetailView {
  constructor(preset, onSelectVariant) {
    this.preset = preset;
    this.onSelectVariant = onSelectVariant;
    this.selectedVariant = preset.defaultVariant || (preset.availableVariants ? preset.availableVariants[0] : '3-scene');
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'presetDetailRoot';

    const variantLabels = {
      '1-scene': '1 Scene (Quick Wish)',
      '2-scene': '2 Scenes (Greeting & Wish)',
      '3-scene': '3 Scenes (Full Celebration)',
      '5-scene': '5 Scenes (Extended Journey)',
      '8-scene': '8 Scenes (Full Cinematic Experience)',
      'story': 'Story Mode (Cinematic Experience)'
    };

    modal.innerHTML = `
      <div class="wizard-modal" style="padding:28px; max-width:540px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="display:flex; gap:12px; align-items:center;">
            <span style="font-size:2.8rem;">${this.preset.icon}</span>
            <div>
              <h2 style="font-size:1.4rem; font-weight:800;">${this.preset.title}</h2>
              <span class="preset-tag-pill" style="margin-top:2px; display:inline-block;">${(this.preset.occasion || '').toUpperCase()} • ${this.preset.category || 'Preset'}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnCloseDetail">✕</button>
        </div>

        <p style="color:var(--text-muted); font-size:0.9rem; margin-top:14px; line-height:1.5;">
          ${this.preset.description}
        </p>

        <div style="margin-top:20px;" class="form-group">
          <label for="experienceLengthSelect" style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:8px;">
            Choose Experience Length
          </label>

          <select class="form-input variant-dropdown-select" id="experienceLengthSelect">
            ${(this.preset.availableVariants || ['1-scene', '3-scene', '5-scene']).map(v => `
              <option value="${v}" ${this.selectedVariant === v ? 'selected' : ''}>
                ${variantLabels[v] || v}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="preset-tags-row margin-top-md">
          ${(this.preset.tags || []).map(t => `<span class="preset-tag-pill">✨ ${t}</span>`).join('')}
        </div>

        <div style="display:flex; gap:10px; margin-top:24px; justify-content:flex-end;">
          <button class="btn btn-secondary" id="btnCancelDetail">Cancel</button>
          <button class="btn btn-primary" id="btnConfirmPresetUse" style="min-height:44px;">
            ✨ Use This Preset
          </button>
        </div>
      </div>
    `;

    this.attachEvents(modal);
    return modal;
  }

  attachEvents(modal) {
    const select = modal.querySelector('#experienceLengthSelect');
    if (select) {
      select.addEventListener('change', (e) => {
        this.selectedVariant = e.target.value;
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'btnCancelDetail' || e.target.id === 'btnCloseDetail' || e.target.classList.contains('wizard-overlay')) {
        modal.remove();
        return;
      }

      // Confirm Use Preset
      if (e.target.id === 'btnConfirmPresetUse' || e.target.closest('#btnConfirmPresetUse')) {
        if (select) {
          this.selectedVariant = select.value;
        }
        modal.remove();
        if (this.onSelectVariant) {
          this.onSelectVariant(this.preset, this.selectedVariant);
        }
      }
    });
  }
}
