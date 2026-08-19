/**
 * Birthday Studio - Countdown Modal (Post-Publish & In-Editor Live Customizer)
 * Split-Pane Live Simulator with Responsive Mobile (9:16) and Desktop (16:9) Viewport Switching
 * & "⚡ Simulate 0s & Transition" action.
 */

import { CountdownService } from '../services/CountdownService.js';
import { CountdownStyleRegistry } from '../data/styles/CountdownStyleDefinitions.js';
import { CountdownPlayerView } from './CountdownPlayerView.js';
import { Accessibility } from '../utils/Accessibility.js';

export class CountdownModal {
  constructor(project, onSave = (() => {})) {
    this.project = project;
    this.onSave = onSave;

    const def = CountdownService.getDefaultCountdown(this.project?.birthdayDate);
    this.countdown = {
      ...def,
      ...(this.project?.countdown || {})
    };

    this.deviceMode = 'desktop';
    this.activePlayerView = null;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'countdownModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const timezones = CountdownService.getTimezonesList();
    const countdownStyles = CountdownStyleRegistry.getAllStyles();

    modal.innerHTML = `
      <div class="wizard-modal countdown-modal-container">
        <!-- Modal Fixed Header -->
        <div class="countdown-modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding:16px 24px; flex-shrink:0; background:var(--surface-elevated, #1a162c);">
          <div>
            <h3 style="font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:8px; margin:0;">
              <span>⏳</span> <span>Celebration Countdown Timer</span>
            </h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin:4px 0 0 0;">
              Gate recipient access until a precise moment in any global timezone. Automatically unlocks on zero.
            </p>
          </div>
          <button class="btn btn-ghost btn-icon" id="btnCloseCountdownModal" aria-label="Close Countdown Modal">✕</button>
        </div>

        <!-- Scrollable Modal Body (Split Layout: Left Controls / Right Simulator) -->
        <div class="countdown-modal-body countdown-split-layout">
          <!-- LEFT COLUMN: Form Controls -->
          <div class="countdown-settings-column" style="display:flex; flex-direction:column; gap:16px;">
            <!-- Enable / Disable Switch -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface); padding:14px 18px; border-radius:var(--radius-md); border:1px solid var(--border);">
              <div>
                <strong style="font-size:0.95rem;">Enable Countdown Timer</strong>
                <p style="color:var(--text-muted); font-size:0.78rem; margin-top:2px;">
                  When enabled, visitors will see this ticking countdown until the target date/time.
                </p>
              </div>
              <label class="switch-toggle" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="checkbox" id="chkModalCountdownEnabled" ${this.countdown.enabled ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;" />
                <span style="font-weight:700; font-size:0.85rem;">Active</span>
              </label>
            </div>

            <!-- Date & Time Inputs -->
            <div class="form-row">
              <div class="form-group">
                <label>Target Date</label>
                <input type="date" class="form-input" id="inpModalCountdownDate" value="${this.countdown.targetDate}" />
              </div>
              <div class="form-group">
                <label>Target Time (24h)</label>
                <input type="time" class="form-input" id="inpModalCountdownTime" value="${this.countdown.targetTime}" />
              </div>
            </div>

            <!-- Timezone Picker -->
            <div class="form-group">
              <label>Target Timezone</label>
              <select class="form-input" id="selModalCountdownTimezone">
                ${timezones.map(tz => `
                  <option value="${tz.id}" ${this.countdown.timezone === tz.id ? 'selected' : ''}>${tz.label}</option>
                `).join('')}
              </select>
            </div>

            <!-- Custom Headline Title & Subtitle -->
            <div class="form-group">
              <label>Countdown Headline Title</label>
              <input type="text" class="form-input" id="inpModalCountdownTitle" value="${this.countdown.title || `Celebrating ${this.project.recipient?.name || 'Someone Special'}!`}" placeholder="e.g. Something Special is Coming..." />
            </div>

            <div class="form-group">
              <label>Subtitle / Subtext</label>
              <input type="text" class="form-input" id="inpModalCountdownSubtitle" value="${this.countdown.subtitle || 'Counting down to celebration time!'}" placeholder="e.g. Counting down to celebration unlock!" />
            </div>

            <!-- 7 Countdown Styles Mini Picker -->
            <div>
              <label style="font-size:0.88rem; font-weight:700; display:block; margin-bottom:4px;">
                Choose Timer Style (7 Themes)
              </label>
              <div class="countdown-style-cards-grid" id="modalCountdownStylesGrid">
                ${countdownStyles.map(s => {
                  const isSelected = s.id === this.countdown.styleId;
                  return `
                    <div class="countdown-style-card-mini ${isSelected ? 'selected' : ''}" data-style-id="${s.id}">
                      <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:1.4rem;">${s.icon}</span>
                        <span style="font-size:0.65rem; color:var(--accent); font-weight:700;">${s.mood}</span>
                      </div>
                      <strong style="font-size:0.82rem; margin-top:2px;">${s.name}</strong>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Real-Time Live Simulator & 0s Test Trigger -->
          <div class="style-preview-column" style="position:static; display:flex; flex-direction:column; height:100%; min-height:480px;">
            <!-- Simulator Control Bar -->
            <div class="style-preview-control-bar">
              <div class="preview-live-badge">
                <span class="live-pulse-dot"></span>
                <span>Live Countdown Simulator</span>
              </div>

              <!-- Device Switcher (Mobile 9:16 / Desktop 16:9) -->
              <div class="preview-device-switch">
                <button class="btn-device-toggle ${this.deviceMode === 'mobile' ? 'active' : ''}" id="btnModalDeviceMobile" data-mode="mobile" title="Mobile Phone Frame (9:16)">
                  <span>📱</span> <span>Mobile</span>
                </button>
                <button class="btn-device-toggle ${this.deviceMode === 'desktop' ? 'active' : ''}" id="btnModalDeviceDesktop" data-mode="desktop" title="Desktop Widescreen Frame (16:9)">
                  <span>💻</span> <span>Desktop</span>
                </button>
              </div>

              <!-- Simulate Zero & Reset Actions -->
              <div style="display:flex; gap:6px;">
                <button class="btn btn-sm btn-simulate-zero" id="btnSimulateZeroAction" title="Simulate 3.. 2.. 1.. 0 with celebration unlock!">
                  <span>⚡</span> <span>Simulate 0s & Transition</span>
                </button>
                <button class="btn btn-ghost btn-sm btn-icon" id="btnResetSimulationAction" title="Reset to live real-time countdown">
                  🔄
                </button>
              </div>
            </div>

            <!-- Viewport Stage Frame -->
            <div class="live-preview-stage-container" id="modalCountdownStageWrapper">
              <div class="canvas-viewport-frame ${this.deviceMode === 'mobile' ? 'ratio-story' : 'ratio-widescreen'}" id="modalCountdownDeviceFrame">
                <div class="live-preview-viewport-content" id="modalCountdownViewportMount" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                  <!-- Active countdown live rendered here -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Fixed Action Footer -->
        <div class="countdown-modal-footer" style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding:16px 24px; flex-shrink:0; background:var(--surface-elevated, #1a162c);">
          <div style="font-size:0.85rem; color:var(--text-muted);">
            Status: <strong style="color:${this.countdown.enabled ? 'var(--accent)' : 'var(--text-muted)'};" id="modalCountdownStatusLabel">
              ${this.countdown.enabled ? '● Active' : '○ Disabled (Celebration opens immediately)'}
            </strong>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary" id="btnCancelCountdownModal">Cancel</button>
            <button class="btn btn-primary" id="btnSaveCountdownModal">
              <span>💾</span> <span>Apply & Save Countdown</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.mountLiveSimulator(modal);
    this.attachEvents(modal);

    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => {
      this.destroy();
      modal.remove();
    });

    return modal;
  }

  mountLiveSimulator(root) {
    const mount = root.querySelector('#modalCountdownViewportMount');
    if (!mount) return;

    if (this.activePlayerView) {
      this.activePlayerView.destroy();
    }

    this.activePlayerView = new CountdownPlayerView({
      project: this.project,
      countdown: this.countdown,
      viewMode: this.deviceMode,
      isSimulation: true,
      allowSkip: true,
      onComplete: () => {
        // In simulator, display brief celebratory banner then reload countdown
        const vp = root.querySelector('#countdownViewport');
        if (vp) {
          vp.innerHTML = `
            <div style="padding: 40px 20px; text-align:center;" class="animate-fade">
              <div style="font-size: 3.5rem; margin-bottom: 12px;">🎉✨</div>
              <h2 style="font-size:1.8rem; font-weight:900; color:var(--accent); margin-bottom:8px;">Celebration Unlocked!</h2>
              <p style="color:var(--text-muted); font-size:0.9rem;">
                Upon reaching zero, the celebration automatically launches seamlessly without page reload!
              </p>
              <button class="btn btn-primary btn-sm margin-top-md" id="btnSimulatorReplayCountdown">
                Replay Countdown Simulator 🔄
              </button>
            </div>
          `;
        }
      }
    });

    mount.innerHTML = '';
    mount.appendChild(this.activePlayerView.render());
  }

  attachEvents(root) {
    const syncValues = () => {
      this.countdown.enabled = root.querySelector('#chkModalCountdownEnabled')?.checked || false;
      this.countdown.targetDate = root.querySelector('#inpModalCountdownDate')?.value || this.countdown.targetDate;
      this.countdown.targetTime = root.querySelector('#inpModalCountdownTime')?.value || '00:00';
      this.countdown.timezone = root.querySelector('#selModalCountdownTimezone')?.value || 'UTC';
      this.countdown.title = root.querySelector('#inpModalCountdownTitle')?.value;
      this.countdown.subtitle = root.querySelector('#inpModalCountdownSubtitle')?.value;

      const statusLbl = root.querySelector('#modalCountdownStatusLabel');
      if (statusLbl) {
        statusLbl.textContent = this.countdown.enabled ? '● Active' : '○ Disabled (Celebration opens immediately)';
        statusLbl.style.color = this.countdown.enabled ? 'var(--accent)' : 'var(--text-muted)';
      }

      this.mountLiveSimulator(root);
    };

    root.addEventListener('input', (e) => {
      if (e.target.id && e.target.id.startsWith('inpModalCountdown')) {
        syncValues();
      }
    });

    root.addEventListener('change', (e) => {
      if (e.target.id === 'chkModalCountdownEnabled' || e.target.id === 'selModalCountdownTimezone') {
        syncValues();
      }
    });

    root.addEventListener('click', async (e) => {
      // 1. Style Selection in Mini Grid
      const styleCard = e.target.closest('.countdown-style-card-mini');
      if (styleCard) {
        const styleId = styleCard.dataset.styleId;
        this.countdown.styleId = styleId;
        root.querySelectorAll('.countdown-style-card-mini').forEach(c => c.classList.toggle('selected', c === styleCard));
        this.mountLiveSimulator(root);
        return;
      }

      // 2. Device Mode Toggle (Mobile / Desktop)
      const btnDev = e.target.closest('.btn-device-toggle');
      if (btnDev) {
        this.deviceMode = btnDev.dataset.mode || 'desktop';
        root.querySelectorAll('.btn-device-toggle').forEach(b => {
          b.classList.toggle('active', b.dataset.mode === this.deviceMode);
        });
        const frame = root.querySelector('#modalCountdownDeviceFrame');
        if (frame) {
          frame.className = `canvas-viewport-frame ${this.deviceMode === 'mobile' ? 'ratio-story' : 'ratio-widescreen'}`;
        }
        this.mountLiveSimulator(root);
        return;
      }

      // 3. Simulate Zero & Transition
      if (e.target.closest('#btnSimulateZeroAction')) {
        if (this.activePlayerView) {
          const cntViewport = root.querySelector('#countdownViewport');
          if (cntViewport) this.activePlayerView.simulateZero(cntViewport);
        }
        return;
      }

      // 4. Reset Simulation
      if (e.target.closest('#btnResetSimulationAction') || e.target.closest('#btnSimulatorReplayCountdown')) {
        this.mountLiveSimulator(root);
        return;
      }

      // 5. Close / Cancel
      if (e.target.closest('#btnCloseCountdownModal') || e.target.closest('#btnCancelCountdownModal')) {
        this.destroy();
        root.remove();
        return;
      }

      // 6. Save Countdown
      if (e.target.closest('#btnSaveCountdownModal')) {
        syncValues();
        this.destroy();
        root.remove();
        await this.onSave(this.countdown);
        return;
      }
    });
  }

  destroy() {
    if (this.activePlayerView) {
      this.activePlayerView.destroy();
      this.activePlayerView = null;
    }
  }
}
