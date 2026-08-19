/**
 * Birthday Studio - Personalization Step View (Section 3, 4, 6)
 * Personalization Form + Live Personalization Preview Card + Local "Create it for me" Prompt Box
 */

import { PersonalizationService } from '../services/PersonalizationService.js';
import { CountdownService } from '../services/CountdownService.js';
import { CountdownStyleRegistry } from '../data/styles/CountdownStyleDefinitions.js';
import { Toast } from '../utils/Toast.js';

export class PersonalizationStepView {
  constructor(options = {}) {
    this.data = options.data || {};
    this.occasion = options.occasion || 'birthday';
    this.onUpdate = options.onUpdate || (() => {});
    this.debounceTimer = null;

    if (!this.data.countdown) {
      this.data.countdown = CountdownService.getDefaultCountdown(this.data.date);
    }
  }

  getOccasionGreeting(recipName, age) {
    const occ = (this.occasion || 'birthday').toLowerCase();
    const recip = recipName || 'Someone Special';
    const ageText = age ? ` (${age}th Milestone)` : '';

    if (occ === 'birthday') return `Happy Birthday, ${recip}! 🎉${ageText}`;
    if (occ === 'wedding') return `Happy Wedding Day, ${recip}! 💍`;
    if (occ === 'anniversary') return `Happy Anniversary, ${recip}! ❤️`;
    if (occ === 'graduation') return `Congratulations, ${recip}! 🎓`;
    if (occ === 'congratulations') return `Congratulations, ${recip}! 🎉`;
    if (occ === 'babyshower' || occ === 'baby_shower') return `Welcome Little One! 🍼`;

    const occTitle = this.occasion.charAt(0).toUpperCase() + this.occasion.slice(1);
    return `Happy ${occTitle}, ${recip}! ✨`;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'step-view-container animate-fade';

    const recipName = this.data.recipientName || 'Someone Special';
    const senderName = this.data.creatorName || 'A Friend';
    const customMsg = this.data.customMessage || 'Today is a beautiful day worth celebrating.';
    const countdown = this.data.countdown || CountdownService.getDefaultCountdown(this.data.date);
    const timezones = CountdownService.getTimezonesList();
    const countdownStyles = CountdownStyleRegistry.getAllStyles();

    container.innerHTML = `
      <!-- "Create it for me" Local Prompt Mode (Section 4) -->
      <div class="create-for-me-box">
        <h3 style="font-size:1.1rem; font-weight:800; display:flex; align-items:center; gap:6px;">
          ✨ Create it for me (Free Local AI Assistant)
        </h3>
        <p style="color:var(--text-muted); font-size:0.82rem; margin-top:2px;">
          Type natural instructions below and we will infer the recipient, age, style, and tone!
        </p>

        <div style="display:flex; gap:8px; margin-top:12px;">
          <input type="text" class="form-input" id="inpCreateForMe" placeholder="e.g. It's my best friend's celebration. I want something heartfelt and joyful." style="flex:1;" />
          <button class="btn btn-primary" id="btnRunCreateForMe">✨ Parse & Auto-Fill</button>
        </div>

        <div id="promptDetectedResults" style="margin-top:10px; display:none; flex-wrap:wrap; gap:6px;"></div>
      </div>

      <!-- Live Personalization Preview Card (Section 6) -->
      <div class="live-personalization-preview-card" style="background:linear-gradient(135deg, #3d1b6a 0%, #151326 100%); border:1px solid var(--accent); border-radius:var(--radius-lg); padding:20px; margin-bottom:24px; text-align:center;">
        <div style="font-size:0.75rem; color:var(--accent-gold); font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
          ✨ Live Greeting Preview
        </div>
        <h3 style="font-size:1.3rem; font-weight:800;" id="livePreviewHeading">
          ${this.getOccasionGreeting(recipName, this.data.age)}
        </h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-top:6px;" id="livePreviewSubtext">
          "${customMsg}"
        </p>
        <div style="font-size:0.78rem; color:var(--accent-pink); margin-top:8px; font-weight:700;" id="livePreviewSender">
          With love from ${senderName}
        </div>
      </div>

      <h2 style="font-size:1.4rem; font-weight:800; margin-bottom:4px;">1. Personalize Celebration</h2>
      <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:20px;">
        Everything is optional. Leave any field blank for smart occasion fallbacks.
      </p>

      <form id="stepPersonalizationForm">
        <div class="form-row">
          <div class="form-group">
            <label>Recipient Name</label>
            <input type="text" class="form-input" id="wizRecipientName" value="${this.data.recipientName || ''}" placeholder="e.g. Someone Special (Optional)" />
          </div>
          <div class="form-group">
            <label>Nickname</label>
            <input type="text" class="form-input" id="wizNickname" value="${this.data.nickname || ''}" placeholder="e.g. Bestie (Optional)" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Your Name (Sender)</label>
            <input type="text" class="form-input" id="wizCreatorName" value="${this.data.creatorName || ''}" placeholder="e.g. Your Name (Optional)" />
          </div>
          <div class="form-group">
            <label>Relationship</label>
            <select class="form-input" id="wizRelationship">
              <option value="Sister" ${this.data.relationship === 'Sister' ? 'selected' : ''}>Sister</option>
              <option value="Brother" ${this.data.relationship === 'Brother' ? 'selected' : ''}>Brother</option>
              <option value="Friend" ${this.data.relationship === 'Friend' ? 'selected' : ''}>Friend</option>
              <option value="Partner" ${this.data.relationship === 'Partner' ? 'selected' : ''}>Partner</option>
              <option value="Parent" ${this.data.relationship === 'Parent' ? 'selected' : ''}>Parent</option>
              <option value="Colleague" ${this.data.relationship === 'Colleague' ? 'selected' : ''}>Colleague</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Age / Milestone</label>
            <input type="number" class="form-input" id="wizAge" value="${this.data.age || ''}" placeholder="e.g. 24 (Optional)" min="1" max="120" />
          </div>
          <div class="form-group">
            <label>Occasion Date</label>
            <input type="date" class="form-input" id="wizDate" value="${this.data.date || new Date().toISOString().split('T')[0]}" />
          </div>
        </div>

        <div class="form-group">
          <label>Custom Celebration Message</label>
          <textarea class="form-input" id="wizCustomMessage" rows="3" placeholder="Write custom greeting message... (Optional)">${this.data.customMessage || ''}</textarea>
        </div>

        <!-- Countdown Timer Section (Section 1 Requirement) -->
        <div class="personalize-countdown-card" style="margin-top:24px; background:var(--surface-elevated); border:1px solid var(--border); border-radius:var(--radius-lg); padding:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:1.05rem; font-weight:800; display:flex; align-items:center; gap:6px;">
                <span>⏳</span> <span>Countdown Timer (Optional)</span>
              </div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-top:2px;">
                Gate celebration until a specific date/time. Automatically unlocks with celebration burst when timer hits zero.
              </p>
            </div>
            <label class="switch-toggle" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" id="wizCountdownEnabled" ${countdown.enabled ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;" />
              <span style="font-size:0.85rem; font-weight:700;">Enable</span>
            </label>
          </div>

          <div id="wizCountdownConfigFields" style="margin-top:16px; display:${countdown.enabled ? 'block' : 'none'}; border-top:1px solid rgba(255,255,255,0.08); padding-top:14px;">
            <div class="form-row">
              <div class="form-group">
                <label>Target Date</label>
                <input type="date" class="form-input" id="wizCountdownDate" value="${countdown.targetDate}" />
              </div>
              <div class="form-group">
                <label>Target Time</label>
                <input type="time" class="form-input" id="wizCountdownTime" value="${countdown.targetTime}" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Timezone</label>
                <select class="form-input" id="wizCountdownTimezone">
                  ${timezones.map(tz => `
                    <option value="${tz.id}" ${countdown.timezone === tz.id ? 'selected' : ''}>${tz.label}</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Countdown Style Theme</label>
                <select class="form-input" id="wizCountdownStyle">
                  ${countdownStyles.map(s => `
                    <option value="${s.id}" ${countdown.styleId === s.id ? 'selected' : ''}>${s.icon} ${s.name} (${s.mood})</option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
    `;

    this.attachEvents(container);
    return container;
  }

  attachEvents(container) {
    container.addEventListener('input', () => {
      this.collectValues(container);
      this.updateLivePreview(container);
    });

    container.addEventListener('change', (e) => {
      if (e.target.id === 'wizCountdownEnabled') {
        const configFields = container.querySelector('#wizCountdownConfigFields');
        if (configFields) {
          configFields.style.display = e.target.checked ? 'block' : 'none';
        }
      }
      this.collectValues(container);
    });

    const btnParse = container.querySelector('#btnRunCreateForMe');
    if (btnParse) {
      btnParse.addEventListener('click', () => {
        const promptInp = container.querySelector('#inpCreateForMe')?.value;
        if (!promptInp) {
          Toast.show('Please enter a natural text prompt first.', 'warning');
          return;
        }

        const parsed = PersonalizationService.parsePrompt(promptInp);
        if (parsed) {
          container.querySelector('#wizRecipientName').value = parsed.recipientName;
          container.querySelector('#wizCreatorName').value = parsed.creatorName;
          if (parsed.age) container.querySelector('#wizAge').value = parsed.age;
          if (parsed.relationship) container.querySelector('#wizRelationship').value = parsed.relationship;

          const resBox = container.querySelector('#promptDetectedResults');
          resBox.style.display = 'flex';
          resBox.innerHTML = `
            <span class="prompt-detected-badge">Occasion: ${parsed.occasion.toUpperCase()}</span>
            <span class="prompt-detected-badge">Recipient: ${parsed.recipientName}</span>
            <span class="prompt-detected-badge">Tone: ${parsed.tone}</span>
          `;

          Toast.show('Parsed prompt and auto-filled fields!', 'success');
          this.collectValues(container);
          this.updateLivePreview(container);
        }
      });
    }
  }

  updateLivePreview(container) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      const recip = container.querySelector('#wizRecipientName')?.value || 'Someone Special';
      const sender = container.querySelector('#wizCreatorName')?.value || 'A Friend';
      const age = container.querySelector('#wizAge')?.value;
      const msg = container.querySelector('#wizCustomMessage')?.value || 'Today is a beautiful day worth celebrating.';

      const headElem = container.querySelector('#livePreviewHeading');
      const subElem = container.querySelector('#livePreviewSubtext');
      const senderElem = container.querySelector('#livePreviewSender');

      if (headElem) headElem.textContent = this.getOccasionGreeting(recip, age);
      if (subElem) subElem.textContent = `"${msg}"`;
      if (senderElem) senderElem.textContent = `With love from ${sender}`;
    }, 150);
  }

  collectValues(container) {
    this.data.recipientName = container.querySelector('#wizRecipientName')?.value;
    this.data.nickname = container.querySelector('#wizNickname')?.value;
    this.data.creatorName = container.querySelector('#wizCreatorName')?.value;
    this.data.relationship = container.querySelector('#wizRelationship')?.value;
    this.data.age = container.querySelector('#wizAge')?.value;
    this.data.date = container.querySelector('#wizDate')?.value;
    this.data.customMessage = container.querySelector('#wizCustomMessage')?.value;

    const isCountdownEnabled = container.querySelector('#wizCountdownEnabled')?.checked || false;
    this.data.countdown = {
      enabled: isCountdownEnabled,
      targetDate: container.querySelector('#wizCountdownDate')?.value || this.data.date || new Date().toISOString().split('T')[0],
      targetTime: container.querySelector('#wizCountdownTime')?.value || '00:00',
      timezone: container.querySelector('#wizCountdownTimezone')?.value || 'UTC',
      styleId: container.querySelector('#wizCountdownStyle')?.value || 'countdown_minimal',
      title: `Celebrating ${this.data.recipientName || 'Someone Special'}!`,
      subtitle: 'Counting down to celebration time!'
    };

    this.onUpdate(this.data);
  }
}
