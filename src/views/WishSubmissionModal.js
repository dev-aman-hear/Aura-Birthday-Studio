/**
 * Birthday Studio - Redesigned Leave a Wish Modal
 * Cinematic Dark Glassmorphic Styling, Segmented Message Picker (Preset Grid / Custom Textarea),
 * Anonymity Toggle, Form Validation, Success State, and Complete Blocking Lifecycle Callbacks.
 */

import { MessageLibrary } from '../data/messages/MessageLibrary.js';
import { wishRepository } from '../services/WishRepository.js';

export class WishSubmissionModal {
  constructor(project = {}, onSubmitted = null, onClosed = null) {
    this.project = project;
    this.onSubmitted = onSubmitted || (() => {});
    this.onClosed = onClosed || (() => {});
    this.messageSource = 'preset'; // 'preset' | 'custom'
    this.authorName = '';
    this.isAnonymous = false;
    this.customText = '';
    this.isSubmitting = false;
    this.isSuccess = false;
    this.modalElement = null;

    // Load rich preset messages for occasion
    const occasion = (this.project?.occasion || 'birthday').toLowerCase().trim();
    this.presetMessages = MessageLibrary.getMessagesForOccasion(occasion, this.project?.relationship);
    
    // Ensure presets are available
    if (!this.presetMessages || this.presetMessages.length === 0) {
      this.presetMessages = MessageLibrary.getMessagesForOccasion('birthday');
    }

    // Select first preset by default
    this.selectedPresetId = this.presetMessages[0]?.id || 'birthday_preset_01';
    this.selectedPresetText = this.presetMessages[0]?.text || 'Happy Birthday! Have an amazing year ahead! 🎉';
  }

  render() {
    const overlay = document.createElement('div');
    overlay.className = 'wish-submission-overlay animate-fade';
    overlay.id = 'wishSubmissionOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Leave a Birthday Wish');

    this.modalElement = overlay;
    this.updateModalDOM(overlay);
    this.attachEvents(overlay);

    return overlay;
  }

  updateModalDOM(overlay) {
    const recipientName = this.project?.recipient?.name || 'Someone Special';
    const occasion = this.project?.occasion || 'Birthday';
    const allowCustom = this.project?.wishWall?.allowCustomMessages !== false;
    const allowAnon = this.project?.wishWall?.allowAnonymous !== false;

    if (this.isSuccess) {
      overlay.innerHTML = `
        <div class="wish-submission-card wish-success-view animate-pop">
          <div class="wish-success-badge">🎉</div>
          <h2 class="wish-success-title">Wish Sent with Love!</h2>
          <p class="wish-success-desc">
            Your heartfelt message has been added to <strong style="color:#ffffff;">${recipientName}</strong>'s celebration wall.
          </p>
          <div style="margin-top:24px;">
            <button type="button" class="wish-submit-btn" id="btnSuccessClose" style="min-width:180px;">
              Done ✨
            </button>
          </div>
        </div>
      `;
      return;
    }

    overlay.innerHTML = `
      <div class="wish-submission-card animate-pop" id="wishModalCard">
        <!-- Header -->
        <div class="wish-modal-header">
          <div>
            <div class="wish-modal-pill">💌 CELEBRATION WISH</div>
            <h2 class="wish-modal-title">Leave a ${occasion} Wish</h2>
            <p class="wish-modal-subtitle">Share your love and warm blessings with <strong style="color:#fff;">${recipientName}</strong></p>
          </div>
          <button class="wish-modal-close-btn" id="btnCloseWishModal" type="button" title="Close" aria-label="Close wish modal">
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <form class="wish-modal-form" id="wishSubmissionForm">
          <!-- 1. Your Name Input -->
          <div class="wish-form-group">
            <label class="wish-field-label" for="wishNameInp">
              <span>Your Name</span>
              <span class="wish-required-star">*</span>
            </label>
            <input
              type="text"
              class="wish-glass-input"
              id="wishNameInp"
              placeholder="Enter your name"
              value="${this.authorName}"
              ${this.isAnonymous ? 'disabled style="opacity:0.5;"' : 'required'}
              maxlength="60"
            />
          </div>

          <!-- Optional Anonymity Checkbox -->
          ${allowAnon ? `
            <div class="wish-form-group" style="margin-top:-6px; margin-bottom:18px;">
              <label class="wish-anon-toggle" id="lblWishAnon">
                <input type="checkbox" id="chkWishAnonymous" ${this.isAnonymous ? 'checked' : ''} />
                <span class="wish-anon-custom-box"></span>
                <span class="wish-anon-text">Send anonymously</span>
              </label>
            </div>
          ` : ''}

          <!-- 2. Segmented Mode Switcher -->
          <div class="wish-form-group">
            <label class="wish-field-label">Choose Message Type</label>
            <div class="wish-type-toggle-pills" id="wishTypeTogglePills">
              <button
                type="button"
                class="wish-type-pill ${this.messageSource === 'preset' ? 'active' : ''}"
                id="btnTogglePreset"
                data-type="preset"
              >
                <span>✨ Choose Preset</span>
              </button>
              ${allowCustom ? `
                <button
                  type="button"
                  class="wish-type-pill ${this.messageSource === 'custom' ? 'active' : ''}"
                  id="btnToggleCustom"
                  data-type="custom"
                >
                  <span>✍️ Write Custom</span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- 3. Dynamic Message Selection / Input -->
          <div class="wish-message-body-container">
            ${this.messageSource === 'preset' ? `
              <!-- Preset Grid Selection -->
              <div class="wish-preset-grid" id="wishPresetGrid">
                ${this.presetMessages.map((m) => {
                  const isSelected = m.id === this.selectedPresetId;
                  return `
                    <div
                      class="wish-preset-card ${isSelected ? 'selected' : ''}"
                      data-preset-id="${m.id}"
                      role="button"
                      tabindex="0"
                    >
                      <p class="wish-preset-text">${m.text}</p>
                      <div class="wish-preset-indicator">${isSelected ? '✓' : ''}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <!-- Custom Textarea Input -->
              <div class="wish-custom-container">
                <textarea
                  class="wish-glass-textarea"
                  id="txtCustomMsg"
                  rows="4"
                  placeholder="Write your heartfelt wish here..."
                  maxlength="300"
                  required
                >${this.customText}</textarea>
                <div class="wish-char-counter">
                  <span id="customCharCount">${this.customText.length}</span>/300 characters
                </div>
              </div>
            `}
          </div>

          <!-- 4. Submit Button -->
          <div class="wish-modal-footer">
            <button
              type="submit"
              class="wish-submit-btn"
              id="btnSubmitWish"
              ${this.isSubmitting ? 'disabled' : ''}
            >
              <span>${this.isSubmitting ? 'Sending with love... ✨' : 'Send Wish ❤️'}</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  closeModal() {
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.classList.add('dismissing');
      setTimeout(() => {
        this.modalElement.remove();
        this.onClosed();
      }, 250);
    } else {
      this.onClosed();
    }
  }

  attachEvents(overlay) {
    // 1. Click Actions
    overlay.addEventListener('click', (e) => {
      // Close Button
      if (e.target.closest('#btnCloseWishModal') || e.target.closest('#btnSuccessClose')) {
        this.closeModal();
        return;
      }

      // Click outside card (Backdrop dismiss)
      if (e.target === overlay) {
        this.closeModal();
        return;
      }

      // Toggle Preset Mode
      const btnPreset = e.target.closest('#btnTogglePreset');
      if (btnPreset && this.messageSource !== 'preset') {
        this.saveCurrentFormState(overlay);
        this.messageSource = 'preset';
        this.updateModalDOM(overlay);
        return;
      }

      // Toggle Custom Mode
      const btnCustom = e.target.closest('#btnToggleCustom');
      if (btnCustom && this.messageSource !== 'custom') {
        this.saveCurrentFormState(overlay);
        this.messageSource = 'custom';
        this.updateModalDOM(overlay);
        return;
      }

      // Click Preset Card
      const presetCard = e.target.closest('.wish-preset-card');
      if (presetCard) {
        const id = presetCard.dataset.presetId;
        const targetPreset = this.presetMessages.find(p => p.id === id);
        if (targetPreset) {
          this.selectedPresetId = targetPreset.id;
          this.selectedPresetText = targetPreset.text;
          
          // Update visual active card in grid
          const allCards = overlay.querySelectorAll('.wish-preset-card');
          allCards.forEach(c => {
            const isTarget = c.dataset.presetId === id;
            c.classList.toggle('selected', isTarget);
            const ind = c.querySelector('.wish-preset-indicator');
            if (ind) ind.textContent = isTarget ? '✓' : '';
          });
        }
      }
    });

    // 2. Anonymity Toggle Change
    overlay.addEventListener('change', (e) => {
      if (e.target.id === 'chkWishAnonymous') {
        this.isAnonymous = e.target.checked;
        const nameInp = overlay.querySelector('#wishNameInp');
        if (nameInp) {
          nameInp.disabled = this.isAnonymous;
          nameInp.style.opacity = this.isAnonymous ? '0.45' : '1';
          if (this.isAnonymous) {
            nameInp.removeAttribute('required');
            nameInp.placeholder = 'Anonymous Friend';
          } else {
            nameInp.setAttribute('required', 'true');
            nameInp.placeholder = 'Enter your name';
          }
        }
      }
    });

    // 3. Live Character Counter for Custom Textarea
    overlay.addEventListener('input', (e) => {
      if (e.target.id === 'txtCustomMsg') {
        this.customText = e.target.value;
        const countSpan = overlay.querySelector('#customCharCount');
        if (countSpan) countSpan.textContent = this.customText.length;
      }
      if (e.target.id === 'wishNameInp') {
        this.authorName = e.target.value;
      }
    });

    // 4. Keyboard ESC to close
    this.escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    };
    window.addEventListener('keydown', this.escHandler, { once: true });

    // 5. Form Submit Handler
    overlay.addEventListener('submit', async (e) => {
      if (e.target.id === 'wishSubmissionForm') {
        e.preventDefault();
        if (this.isSubmitting) return;

        this.saveCurrentFormState(overlay);

        const finalName = this.isAnonymous ? 'Anonymous' : (this.authorName.trim() || 'Friend');
        let finalMessage = '';
        let presetId = null;

        if (this.messageSource === 'preset') {
          finalMessage = this.selectedPresetText;
          presetId = this.selectedPresetId;
        } else {
          finalMessage = this.customText.trim();
        }

        if (!finalMessage) {
          return;
        }

        this.isSubmitting = true;
        const submitBtn = overlay.querySelector('#btnSubmitWish');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Sending with love... ✨</span>';
        }

        try {
          const newWish = await wishRepository.createWish({
            name: finalName,
            isAnonymous: this.isAnonymous,
            message: finalMessage,
            messageSource: this.messageSource,
            presetMessageId: presetId,
            occasion: this.project?.occasion || 'birthday'
          }, this.project);

          this.isSuccess = true;
          this.isSubmitting = false;
          this.updateModalDOM(overlay);

          // Notify caller of new wish
          if (this.onSubmitted) {
            this.onSubmitted(newWish);
          }

          // Automatically close success view after 1.8 seconds if user doesn't click Done
          setTimeout(() => {
            if (document.body.contains(overlay)) {
              this.closeModal();
            }
          }, 1800);
        } catch (err) {
          this.isSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Send Wish ❤️</span>';
          }
          console.error('[WishSubmissionModal] Submission error:', err);
          alert(err.message || 'Error submitting wish. Please try again.');
        }
      }
    });
  }

  saveCurrentFormState(overlay) {
    const nameInp = overlay.querySelector('#wishNameInp');
    if (nameInp && !this.isAnonymous) {
      this.authorName = nameInp.value;
    }
    const txt = overlay.querySelector('#txtCustomMsg');
    if (txt) {
      this.customText = txt.value;
    }
  }
}
