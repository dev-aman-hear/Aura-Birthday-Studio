/**
 * Birthday Studio - Creator Settings View (Section 8)
 * Local Preferences Modal (Default Occasion, Default Style, Wish Wall & Reduced Motion)
 */

import { CreatorSettingsService } from '../services/CreatorSettingsService.js';
import { Accessibility } from '../utils/Accessibility.js';
import { Toast } from '../utils/Toast.js';

export class CreatorSettingsView {
  constructor(onSave = (() => {})) {
    this.onSave = onSave;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'creatorSettingsModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const settings = CreatorSettingsService.getSettings();

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:500px; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.2rem; font-weight:800;">⚙️ Creator Studio Settings</h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseSettings" aria-label="Close Settings">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; margin-bottom:20px;">
          <div class="form-group">
            <label>Default Occasion for New Projects</label>
            <select class="form-input" id="setDefOccasion">
              <option value="birthday" ${settings.defaultOccasion === 'birthday' ? 'selected' : ''}>Birthday</option>
              <option value="wedding" ${settings.defaultOccasion === 'wedding' ? 'selected' : ''}>Wedding</option>
              <option value="anniversary" ${settings.defaultOccasion === 'anniversary' ? 'selected' : ''}>Anniversary</option>
              <option value="graduation" ${settings.defaultOccasion === 'graduation' ? 'selected' : ''}>Graduation</option>
              <option value="congratulations" ${settings.defaultOccasion === 'congratulations' ? 'selected' : ''}>Congratulations</option>
              <option value="babyShower" ${settings.defaultOccasion === 'babyShower' ? 'selected' : ''}>Baby Shower</option>
            </select>
          </div>

          <div class="form-group">
            <label>Default Visual Style Theme</label>
            <select class="form-input" id="setDefStyle">
              <option value="style_birthday" ${settings.defaultStyle === 'style_birthday' || settings.defaultStyle === 'party' ? 'selected' : ''}>🎂 Birthday Party</option>
              <option value="style_elegant" ${settings.defaultStyle === 'style_elegant' || settings.defaultStyle === 'elegant' ? 'selected' : ''}>✨ Elegant</option>
              <option value="style_romantic" ${settings.defaultStyle === 'style_romantic' || settings.defaultStyle === 'romantic' ? 'selected' : ''}>💖 Romantic</option>
              <option value="style_soft_cute" ${settings.defaultStyle === 'style_soft_cute' ? 'selected' : ''}>🌸 Soft & Cute</option>
              <option value="style_minimal" ${settings.defaultStyle === 'style_minimal' ? 'selected' : ''}>⚪ Minimal Clean</option>
              <option value="style_cinematic" ${settings.defaultStyle === 'style_cinematic' || settings.defaultStyle === 'cinematic' ? 'selected' : ''}>🎬 Cinematic</option>
              <option value="style_luxury" ${settings.defaultStyle === 'style_luxury' ? 'selected' : ''}>👑 Luxury Gold</option>
              <option value="style_colorful" ${settings.defaultStyle === 'style_colorful' ? 'selected' : ''}>🌈 Vibrant Colorful</option>
              <option value="style_dark" ${settings.defaultStyle === 'style_dark' ? 'selected' : ''}>🌙 Midnight Dark</option>
              <option value="style_playful" ${settings.defaultStyle === 'style_playful' ? 'selected' : ''}>🎈 Playful Pop</option>
            </select>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-elevated); padding:10px 14px; border-radius:var(--radius-md); border:1px solid var(--border);">
            <label for="chkEnableWishWall" style="font-weight:600; font-size:0.88rem; cursor:pointer;">Enable Wish Wall by Default</label>
            <input type="checkbox" id="chkEnableWishWall" ${settings.enableWishWall ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-elevated); padding:10px 14px; border-radius:var(--radius-md); border:1px solid var(--border);">
            <label for="chkReducedMotion" style="font-weight:600; font-size:0.88rem; cursor:pointer;">Force Reduced Motion</label>
            <input type="checkbox" id="chkReducedMotion" ${settings.reducedMotion ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-ghost btn-sm" id="btnResetSettings" style="color:var(--danger);">Reset Defaults</button>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary" id="btnCancelSettings">Cancel</button>
            <button class="btn btn-primary" id="btnSaveSettings">Save Preferences</button>
          </div>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target.closest('#btnCloseSettings') || e.target.closest('#btnCancelSettings')) {
        modal.remove();
        return;
      }

      if (e.target.closest('#btnResetSettings')) {
        CreatorSettingsService.resetToDefault();
        Toast.show('Settings reset to default', 'info');
        modal.remove();
        this.onSave();
        return;
      }

      if (e.target.closest('#btnSaveSettings')) {
        const updated = CreatorSettingsService.saveSettings({
          defaultOccasion: modal.querySelector('#setDefOccasion').value,
          defaultStyle: modal.querySelector('#setDefStyle').value,
          enableWishWall: modal.querySelector('#chkEnableWishWall').checked,
          reducedMotion: modal.querySelector('#chkReducedMotion').checked
        });
        Toast.show('Preferences saved successfully!', 'success');
        modal.remove();
        this.onSave(updated);
        return;
      }
    });

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => modal.remove());

    return modal;
  }
}
