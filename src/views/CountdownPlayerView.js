/**
 * Birthday Studio - Countdown Player View (Universal Timezone-Aware Countdown Engine)
 * Renders real-time live ticking countdown in chosen style and triggers celebration on zero.
 * Supports Desktop (Widescreen) and Mobile (Story Portrait) view modes with ExpressiveDateDisplay.
 */

import { CountdownService } from '../services/CountdownService.js';
import { CountdownStyleRegistry } from '../data/styles/CountdownStyleDefinitions.js';
import { ConfettiEngine } from '../utils/Confetti.js';
import { ExpressiveDateDisplay } from '../components/ExpressiveDateDisplay.js';

export class CountdownPlayerView {
  constructor(options = {}) {
    this.project = options.project || {};
    this.countdown = options.countdown || this.project.countdown || CountdownService.getDefaultCountdown(this.project.birthdayDate);
    this.viewMode = options.viewMode || options.deviceMode || 'desktop';
    this.onComplete = options.onComplete || (() => {});
    this.isSimulation = options.isSimulation || false;
    this.allowSkip = options.allowSkip !== undefined ? options.allowSkip : false;

    this.timerInterval = null;
    this.isCompleted = false;
    this.simulatedSecondsLeft = null;
  }

  render() {
    const root = document.createElement('div');
    root.className = `countdown-player-root view-mode-${this.viewMode} animate-fade`;
    root.style.width = '100%';
    root.style.height = '100%';

    const style = CountdownStyleRegistry.getStyleById(this.countdown.styleId);
    const targetDate = this.countdown.targetDate || this.project.birthdayDate || new Date().toISOString().split('T')[0];
    const targetTime = this.countdown.targetTime || '00:00';
    const timezone = this.countdown.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const title = this.countdown.title || `Celebrating ${this.project.recipient?.name || 'Someone Special'}!`;
    const subtitle = this.countdown.subtitle || 'Counting down to celebration unlock time.';

    const remaining = CountdownService.calculateRemaining(targetDate, targetTime, timezone);

    const expressiveDateHtml = ExpressiveDateDisplay.render({
      date: targetDate,
      theme: style.id,
      viewMode: this.viewMode,
      showWeekday: true,
      showYear: true
    });

    root.innerHTML = `
      <div class="countdown-player-viewport ${style.layoutClass} ${this.viewMode === 'mobile' ? 'mode-mobile' : 'mode-desktop'}" id="countdownViewport">
        <canvas class="confetti-canvas" id="countdownConfettiCanvas" style="position:absolute; inset:0; pointer-events:none; z-index:99;"></canvas>

        <!-- Header Area -->
        <div class="countdown-header-area">
          <div style="font-size: ${this.viewMode === 'mobile' ? '1.8rem' : '2.4rem'}; margin-bottom: 6px;">⏳</div>
          <h2 class="countdown-main-title" id="cntMainTitle">${title}</h2>
          <p class="countdown-sub-title" id="cntSubTitle">${subtitle}</p>
          
          <!-- Universal Theme-Aware Expressive Date Display -->
          ${expressiveDateHtml}
        </div>

        <!-- 4-Unit Digits Grid -->
        <div class="countdown-units-grid" id="cntUnitsGrid">
          <div class="countdown-unit-box">
            <div class="countdown-digit-card" id="cntDays">
              ${CountdownService.padZero(remaining.days)}
            </div>
            <span class="countdown-unit-label">DAYS</span>
          </div>

          <div class="countdown-unit-box">
            <div class="countdown-digit-card" id="cntHours">
              ${CountdownService.padZero(remaining.hours)}
            </div>
            <span class="countdown-unit-label">HOURS</span>
          </div>

          <div class="countdown-unit-box">
            <div class="countdown-digit-card" id="cntMinutes">
              ${CountdownService.padZero(remaining.minutes)}
            </div>
            <span class="countdown-unit-label">MINS</span>
          </div>

          <div class="countdown-unit-box">
            <div class="countdown-digit-card" id="cntSeconds">
              ${CountdownService.padZero(remaining.seconds)}
            </div>
            <span class="countdown-unit-label">SECS</span>
          </div>
        </div>

        <!-- Footer Area -->
        <div class="countdown-footer-area">
          <div class="countdown-live-indicator">
            <span class="live-pulse-dot"></span>
            <span>Live Timezone Synced • Automatic Unlock on Zero</span>
          </div>

          ${this.allowSkip ? `
            <button class="btn btn-ghost btn-sm" id="btnCountdownSkipNow" style="margin-top: 8px; color: var(--text-muted); font-size: 0.78rem;">
              Preview Experience Now →
            </button>
          ` : ''}
        </div>
      </div>
    `;

    this.startTicker(root);
    this.attachEvents(root);

    return root;
  }

  startTicker(root) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.isCompleted) return;

      if (this.simulatedSecondsLeft !== null) {
        if (this.simulatedSecondsLeft > 0) {
          this.simulatedSecondsLeft -= 1;
          this.updateDisplayValues(root, {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: this.simulatedSecondsLeft,
            isExpired: this.simulatedSecondsLeft <= 0
          });
          if (this.simulatedSecondsLeft <= 0) {
            this.handleCountdownReached(root);
          }
        }
        return;
      }

      const targetDate = this.countdown.targetDate || this.project.birthdayDate;
      const targetTime = this.countdown.targetTime || '00:00';
      const timezone = this.countdown.timezone || 'UTC';

      const remaining = CountdownService.calculateRemaining(targetDate, targetTime, timezone);
      this.updateDisplayValues(root, remaining);

      if (remaining.isExpired) {
        this.handleCountdownReached(root);
      }
    }, 1000);
  }

  updateDisplayValues(root, remaining) {
    const elDays = root.querySelector('#cntDays');
    const elHours = root.querySelector('#cntHours');
    const elMins = root.querySelector('#cntMinutes');
    const elSecs = root.querySelector('#cntSeconds');

    if (elDays) elDays.textContent = CountdownService.padZero(remaining.days);
    if (elHours) elHours.textContent = CountdownService.padZero(remaining.hours);
    if (elMins) elMins.textContent = CountdownService.padZero(remaining.minutes);
    if (elSecs) elSecs.textContent = CountdownService.padZero(remaining.seconds);
  }

  handleCountdownReached(root) {
    if (this.isCompleted) return;
    this.isCompleted = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const canvas = root.querySelector('#countdownConfettiCanvas');
    if (canvas) {
      ConfettiEngine.launch(canvas);
    }

    const titleElem = root.querySelector('#cntMainTitle');
    if (titleElem) {
      titleElem.textContent = '🎉 Celebration Time!';
    }

    setTimeout(() => {
      this.onComplete();
    }, 1200);
  }

  /**
   * Simulation mode: Fast countdown to zero
   */
  simulateZero(root) {
    this.isCompleted = false;
    this.simulatedSecondsLeft = 3;
    this.updateDisplayValues(root, { days: 0, hours: 0, minutes: 0, seconds: 3 });
  }

  attachEvents(root) {
    root.addEventListener('click', (e) => {
      if (e.target.closest('#btnCountdownSkipNow')) {
        this.destroy();
        this.onComplete();
      }
    });
  }

  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
