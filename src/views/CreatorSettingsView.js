/**
 * Birthday Studio - Creator Settings View (Section 8)
 * Preferences Modal (Default Occasion, Default Style, Wish Wall, Reduced Motion & Cloud Database Configuration)
 */

import { CreatorSettingsService } from '../services/CreatorSettingsService.js';
import { supabaseService } from '../services/supabaseClient.js';
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
    const currentSupabaseUrl = supabaseService.getSupabaseUrl();
    const currentSupabaseKey = supabaseService.getSupabaseAnonKey();
    const isConfigured = supabaseService.isConfigured();

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:540px; max-height:90vh; overflow-y:auto; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
          <h3 style="font-size:1.2rem; font-weight:800;">⚙️ Creator Studio Settings</h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseSettings" aria-label="Close Settings">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:20px;">
          <!-- 1. GENERAL PREFERENCES -->
          <div style="font-weight:700; font-size:0.9rem; color:#c4b5fd; text-transform:uppercase; letter-spacing:0.5px;">🎨 Creation Preferences</div>

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

          <!-- 2. CLOUD DATABASE & REMOTE PUBLISHING (SUPABASE) -->
          <div style="border-top:1px solid var(--border); padding-top:16px; margin-top:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-weight:700; font-size:0.9rem; color:#7f5af0; text-transform:uppercase; letter-spacing:0.5px;">☁️ Cloud Database & Share Links</span>
              <span id="supabaseStatusBadge" style="font-size:0.75rem; padding:3px 8px; border-radius:12px; font-weight:700; ${isConfigured ? 'background:rgba(44,182,125,0.2); color:#2cb67d; border:1px solid #2cb67d;' : 'background:rgba(230,57,70,0.2); color:#ff7675; border:1px solid #e63946;'}">
                ${isConfigured ? '🟢 Connected' : '⚪ Not Configured'}
              </span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px; line-height:1.4;">
              Required for published links (<code style="color:#f6c90e;">#view/pub_xxx</code>) to work across other browsers, phones, and devices.
            </p>

            <div class="form-group" style="margin-bottom:10px;">
              <label style="font-size:0.8rem;">Supabase Project URL</label>
              <input type="text" class="form-input" id="inpSupabaseUrl" placeholder="https://your-project.supabase.co" value="${currentSupabaseUrl}" style="font-size:0.85rem;" />
            </div>

            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-size:0.8rem;">Supabase Public Anon Key</label>
              <input type="password" class="form-input" id="inpSupabaseKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${currentSupabaseKey}" style="font-size:0.85rem;" />
            </div>

            <div style="display:flex; gap:8px; align-items:center;">
              <button class="btn btn-secondary btn-sm" id="btnTestSupabase" type="button">🔌 Test Connection</button>
              <span id="lblSupabaseTestResult" style="font-size:0.78rem; color:var(--text-muted);"></span>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:14px;">
          <button class="btn btn-ghost btn-sm" id="btnResetSettings" style="color:var(--danger);">Reset Defaults</button>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary" id="btnCancelSettings">Cancel</button>
            <button class="btn btn-primary" id="btnSaveSettings">Save Preferences</button>
          </div>
        </div>
      </div>
    `;

    // Event handlers
    modal.addEventListener('click', async (e) => {
      if (e.target.closest('#btnCloseSettings') || e.target.closest('#btnCancelSettings')) {
        modal.remove();
        return;
      }

      if (e.target.closest('#btnTestSupabase')) {
        const btn = modal.querySelector('#btnTestSupabase');
        const lbl = modal.querySelector('#lblSupabaseTestResult');
        const badge = modal.querySelector('#supabaseStatusBadge');
        const testUrl = modal.querySelector('#inpSupabaseUrl').value.trim();
        const testKey = modal.querySelector('#inpSupabaseKey').value.trim();

        if (btn) btn.disabled = true;
        if (lbl) {
          lbl.textContent = 'Testing connection...';
          lbl.style.color = '#c4b5fd';
        }

        try {
          const res = await supabaseService.testConnection(testUrl, testKey);
          if (res.success) {
            if (lbl) {
              lbl.textContent = '✅ Connected!';
              lbl.style.color = '#2cb67d';
            }
            if (badge) {
              badge.textContent = '🟢 Connected';
              badge.style.cssText = 'font-size:0.75rem; padding:3px 8px; border-radius:12px; font-weight:700; background:rgba(44,182,125,0.2); color:#2cb67d; border:1px solid #2cb67d;';
            }
            Toast.show('Supabase connection verified successfully!', 'success');
          } else {
            if (lbl) {
              lbl.textContent = `❌ ${res.message}`;
              lbl.style.color = '#ff7675';
            }
            Toast.show(res.message, 'error');
          }
        } catch (testErr) {
          if (lbl) {
            lbl.textContent = `❌ ${testErr.message}`;
            lbl.style.color = '#ff7675';
          }
        } finally {
          if (btn) btn.disabled = false;
        }
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
        const sbUrl = modal.querySelector('#inpSupabaseUrl').value.trim();
        const sbKey = modal.querySelector('#inpSupabaseKey').value.trim();
        supabaseService.setCredentials(sbUrl, sbKey);

        const updated = CreatorSettingsService.saveSettings({
          defaultOccasion: modal.querySelector('#setDefOccasion').value,
          defaultStyle: modal.querySelector('#setDefStyle').value,
          enableWishWall: modal.querySelector('#chkEnableWishWall').checked,
          reducedMotion: modal.querySelector('#chkReducedMotion').checked
        });

        Toast.show('Preferences and database configuration saved!', 'success');
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

