/**
 * Birthday Studio - Preset Personalization View
 * Personalization screen collecting reusable template variables (Recipient, Sender, Occasion, Message, Photos)
 */

import { PresetService } from '../services/PresetService.js';
import { Toast } from '../utils/Toast.js';

export class PresetPersonalizationView {
  constructor(preset, variantKey, currentUser, onComplete) {
    this.preset = preset;
    this.variantKey = variantKey;
    this.currentUser = currentUser;
    this.onComplete = onComplete;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'presetPersonalizeRoot';

    modal.innerHTML = `
      <div class="wizard-modal" style="padding:28px; max-width:560px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h2 style="font-size:1.4rem; font-weight:800;">Make It Yours ✨</h2>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:2px;">
              Personalize template variables below. You can also customize scenes in the editor later.
            </p>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnClosePersonalize">✕</button>
        </div>

        <form id="personalizeForm" class="margin-top-md" style="display:flex; flex-direction:column; gap:14px;">
          <div class="form-row">
            <div class="form-group">
              <label>Recipient Name</label>
              <input type="text" class="form-input" id="pRecipientName" placeholder="e.g. Someone Special" value="${this.preset.fallbackContent?.recipientName || ''}" />
            </div>

            <div class="form-group">
              <label>Your Name (Sender)</label>
              <input type="text" class="form-input" id="pSenderName" placeholder="${this.currentUser?.displayName || 'e.g. Your Name'}" value="${this.currentUser?.displayName || this.preset.fallbackContent?.senderName || ''}" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Occasion / Title</label>
              <input type="text" class="form-input" id="pOccasion" placeholder="e.g. Celebration" value="${this.preset.fallbackContent?.occasion || this.preset.title || 'Birthday'}" />
            </div>

            <div class="form-group">
              <label>Birthday Date / Milestone</label>
              <input type="text" class="form-input" id="pAge" placeholder="e.g. 15 August 2026" value="${this.preset.fallbackContent?.birthdayDate || this.preset.fallbackContent?.date || ''}" />
            </div>
          </div>

          <div class="form-group">
            <label>Heartfelt Wish / Message</label>
            <textarea class="form-input" id="pMessage" rows="3" placeholder="Write custom greeting message...">${this.preset.fallbackContent?.message || ''}</textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Featured Photo 1 URL (Optional)</label>
              <input type="text" class="form-input" id="pPhoto1" placeholder="https://... image URL" value="${this.preset.fallbackContent?.photo1 || ''}" />
            </div>
            <div class="form-group">
              <label>Featured Photo 2 URL (Optional)</label>
              <input type="text" class="form-input" id="pPhoto2" placeholder="https://... image URL" value="${this.preset.fallbackContent?.photo2 || ''}" />
            </div>
          </div>

          <div style="display:flex; gap:10px; margin-top:16px; justify-content:flex-end;">
            <button type="button" class="btn btn-secondary" id="btnCancelPersonalize">Cancel</button>
            <button type="submit" class="btn btn-success" id="btnGenerateExperience" style="min-height:44px; font-size:1rem; font-weight:800;">
              🚀 Create Celebration
            </button>
          </div>
        </form>
      </div>
    `;

    this.attachEvents(modal);
    return modal;
  }

  attachEvents(modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'btnCancelPersonalize' || e.target.id === 'btnClosePersonalize' || e.target.classList.contains('wizard-overlay')) {
        modal.remove();
      }
    });

    const form = modal.querySelector('#personalizeForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputData = {
          recipientName: modal.querySelector('#pRecipientName')?.value,
          senderName: modal.querySelector('#pSenderName')?.value,
          creatorName: modal.querySelector('#pSenderName')?.value,
          occasion: modal.querySelector('#pOccasion')?.value,
          age: modal.querySelector('#pAge')?.value,
          message: modal.querySelector('#pMessage')?.value,
          customMessage: modal.querySelector('#pMessage')?.value,
          photo1: modal.querySelector('#pPhoto1')?.value,
          photo2: modal.querySelector('#pPhoto2')?.value
        };

        Toast.show('Generating celebration experience...', 'info');

        const createdProject = await PresetService.generateProjectFromPreset(
          this.preset,
          this.variantKey,
          inputData,
          this.currentUser?.id
        );

        modal.remove();
        Toast.show(`Celebration created from "${this.preset.title}"! 🎉`, 'success');

        if (this.onComplete) {
          this.onComplete(createdProject.id);
        }
      });
    }
  }
}

