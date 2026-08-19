/**
 * Birthday Studio - Project Creation Wizard (Section 9)
 * 4-Step Setup Wizard
 */

import { OCCASIONS } from '../data/Occasions.js';
import { RELATIONSHIPS } from '../data/Relationships.js';
import { projectRepository } from '../services/ProjectRepository.js';

export class WizardView {
  constructor(onProjectCreated) {
    this.onProjectCreated = onProjectCreated;
    this.currentStep = 1;
    this.formData = {
      occasion: 'birthday',
      relationship: 'Friend',
      recipientName: 'Recipient',
      nickname: 'Bestie',
      creatorName: 'Sender',
      birthdayDate: new Date().toISOString().split('T')[0],
      birthdayTime: '18:00',
      age: '25',
      description: 'Wishing you a wonderful celebration filled with joy and laughter!',
      theme: 'purple_gold'
    };
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay';
    modal.id = 'wizardOverlay';

    modal.innerHTML = `
      <div class="wizard-modal">
        <div class="wizard-header">
          <div class="wizard-brand">
            <span class="wizard-logo">🎂</span>
            <h2>Aura Birthday Studio Wizard</h2>
          </div>
          <div class="wizard-steps-indicator">
            <span class="step-dot ${this.currentStep === 1 ? 'active' : ''}">1</span>
            <span class="step-dot ${this.currentStep === 2 ? 'active' : ''}">2</span>
            <span class="step-dot ${this.currentStep === 3 ? 'active' : ''}">3</span>
            <span class="step-dot ${this.currentStep === 4 ? 'active' : ''}">4</span>
          </div>
        </div>

        <div class="wizard-body" id="wizardBody">
          ${this.renderStepContent()}
        </div>

        <div class="wizard-footer">
          ${this.currentStep > 1 ? `<button class="btn btn-secondary" id="btnWizardPrev">Back</button>` : '<div></div>'}
          ${this.currentStep < 4 ? `
            <button class="btn btn-primary" id="btnWizardNext">Next Step →</button>
          ` : `
            <button class="btn btn-success" id="btnWizardLaunch">✨ Launch Scene Builder</button>
          `}
        </div>
      </div>
    `;

    this.attachEvents(modal);
    return modal;
  }

  renderStepContent() {
    if (this.currentStep === 1) {
      return `
        <div class="wizard-step-panel">
          <h3>Step 1: Choose Occasion & Relationship</h3>
          <p>Select what kind of celebration you are building and for whom.</p>

          <div class="form-group">
            <label>Occasion</label>
            <div class="grid-select-options">
              ${OCCASIONS.map(o => `
                <div class="select-card ${this.formData.occasion === o.id ? 'selected' : ''}" data-type="occasion" data-val="${o.id}">
                  <span class="card-icon">${o.icon}</span>
                  <span class="card-title">${o.label}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="form-group margin-top-md">
            <label>Relationship / Person Type</label>
            <select class="form-input" id="wizRelationship">
              ${RELATIONSHIPS.map(r => `
                <option value="${r.id}" ${this.formData.relationship === r.id ? 'selected' : ''}>${r.label}</option>
              `).join('')}
            </select>
          </div>
        </div>
      `;
    } else if (this.currentStep === 2) {
      return `
        <div class="wizard-step-panel">
          <h3>Step 2: Celebration Details</h3>
          <p>Enter details about the recipient and yourself.</p>

          <div class="form-row">
            <div class="form-group">
              <label>Recipient's Name *</label>
              <input type="text" class="form-input" id="wizRecipientName" value="${this.formData.recipientName}" required />
            </div>
            <div class="form-group">
              <label>Nickname</label>
              <input type="text" class="form-input" id="wizNickname" value="${this.formData.nickname}" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Your Name (Creator) *</label>
              <input type="text" class="form-input" id="wizCreatorName" value="${this.formData.creatorName}" required />
            </div>
            <div class="form-group">
              <label>Age (Optional)</label>
              <input type="number" class="form-input" id="wizAge" value="${this.formData.age}" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Date</label>
              <input type="date" class="form-input" id="wizDate" value="${this.formData.birthdayDate}" />
            </div>
            <div class="form-group">
              <label>Time</label>
              <input type="time" class="form-input" id="wizTime" value="${this.formData.birthdayTime}" />
            </div>
          </div>

          <div class="form-group">
            <label>Short Description / Personal Note</label>
            <textarea class="form-input" id="wizDescription" rows="2">${this.formData.description}</textarea>
          </div>
        </div>
      `;
    } else if (this.currentStep === 3) {
      return `
        <div class="wizard-step-panel">
          <h3>Step 3: Starter Assets & Presets</h3>
          <p>Starter high-definition celebration photos and sounds will be automatically loaded into your Asset Library.</p>

          <div class="starter-assets-preview">
            <div class="asset-preview-card">📸 4 Starter High-Res Photos</div>
            <div class="asset-preview-card">👑 2 Celebration Stickers</div>
            <div class="asset-preview-card">🎵 1 Upbeat Background Track</div>
            <div class="asset-preview-card">💬 Preset Occasion Copy</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="wizard-step-panel text-center">
          <div class="wizard-success-icon">🎉</div>
          <h3>Step 4: Ready to Build!</h3>
          <p>We are creating a starter project with 7 pre-configured scenes:</p>
          <ul class="wizard-scene-list">
            <li>✨ 1. Opening Hero</li>
            <li>🎁 2. Occasion Reveal</li>
            <li>⏳ 3. Memory Timeline</li>
            <li>🎬 4. Video Showcase</li>
            <li>💌 5. Personal Message</li>
            <li>🌟 6. Dynamic Wish Wall</li>
            <li>🎂 7. Final Wish & Replay</li>
          </ul>
        </div>
      `;
    }
  }

  attachEvents(modal) {
    modal.addEventListener('click', (e) => {
      const card = e.target.closest('.select-card');
      if (card) {
        const type = card.dataset.type;
        const val = card.dataset.val;
        if (type === 'occasion') {
          this.formData.occasion = val;
          modal.querySelectorAll('.select-card[data-type="occasion"]').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        }
      }

      if (e.target.id === 'btnWizardPrev') {
        this.currentStep--;
        this.updateModal(modal);
      }

      if (e.target.id === 'btnWizardNext') {
        this.saveCurrentStepInputs(modal);
        this.currentStep++;
        this.updateModal(modal);
      }

      if (e.target.id === 'btnWizardLaunch') {
        this.saveCurrentStepInputs(modal);
        const project = projectRepository.createDefaultProject(this.formData);
        projectRepository.saveProject(project).then(saved => {
          modal.remove();
          if (this.onProjectCreated) this.onProjectCreated(saved);
        });
      }
    });
  }

  saveCurrentStepInputs(modal) {
    const rel = modal.querySelector('#wizRelationship');
    if (rel) this.formData.relationship = rel.value;

    const rName = modal.querySelector('#wizRecipientName');
    if (rName) this.formData.recipientName = rName.value;

    const nick = modal.querySelector('#wizNickname');
    if (nick) this.formData.nickname = nick.value;

    const cName = modal.querySelector('#wizCreatorName');
    if (cName) this.formData.creatorName = cName.value;

    const age = modal.querySelector('#wizAge');
    if (age) this.formData.age = age.value;

    const bDate = modal.querySelector('#wizDate');
    if (bDate) this.formData.birthdayDate = bDate.value;

    const bTime = modal.querySelector('#wizTime');
    if (bTime) this.formData.birthdayTime = bTime.value;

    const desc = modal.querySelector('#wizDescription');
    if (desc) this.formData.description = desc.value;
  }

  updateModal(modal) {
    const newBody = modal.querySelector('#wizardBody');
    if (newBody) newBody.innerHTML = this.renderStepContent();

    const dots = modal.querySelectorAll('.step-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx + 1 === this.currentStep);
    });

    const footer = modal.querySelector('.wizard-footer');
    if (footer) {
      footer.innerHTML = `
        ${this.currentStep > 1 ? `<button class="btn btn-secondary" id="btnWizardPrev">Back</button>` : '<div></div>'}
        ${this.currentStep < 4 ? `
          <button class="btn btn-primary" id="btnWizardNext">Next Step →</button>
        ` : `
          <button class="btn btn-success" id="btnWizardLaunch">✨ Launch Scene Builder</button>
        `}
      `;
    }
  }
}
