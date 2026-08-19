/**
 * Birthday Studio - Compact Timing & Animation Panel
 * Lightweight timing drawer for layer entrance, delay, duration, and easing
 */

export class TimingPanelView {
  constructor(element, scene, onUpdate = (() => {}), onClose = (() => {})) {
    this.element = element;
    this.scene = scene;
    this.onUpdate = onUpdate;
    this.onClose = onClose;
  }

  render() {
    const panel = document.createElement('div');
    panel.className = 'wizard-overlay animate-fade';
    panel.id = 'timingPanelModalRoot';

    panel.innerHTML = `
      <div class="wizard-modal" style="max-width:440px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:14px;">
          <h3 style="font-size:1.1rem; font-weight:800; display:flex; align-items:center; gap:6px;">
            <span>⏱️</span> <span>Element Timing & Animation</span>
          </h3>
          <button class="btn btn-ghost btn-icon" id="btnCloseTimingPanel">✕</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label>Entrance Animation Effect</label>
            <select class="form-input" id="inpTimingAnim">
              <option value="fadeIn" ${this.element.animation === 'fadeIn' ? 'selected' : ''}>Fade In</option>
              <option value="pop" ${this.element.animation === 'pop' ? 'selected' : ''}>Pop Scale (Bouncy)</option>
              <option value="slide_up" ${this.element.animation === 'slide_up' ? 'selected' : ''}>Slide Up</option>
              <option value="blur" ${this.element.animation === 'blur' ? 'selected' : ''}>Blur Reveal</option>
              <option value="glow" ${this.element.animation === 'glow' ? 'selected' : ''}>Pulsating Glow</option>
              <option value="none" ${this.element.animation === 'none' ? 'selected' : ''}>None (Instant)</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Delay Before Start: <span id="lblTimingDelay">${this.element.delay || 0}s</span></label>
              <input type="range" id="inpTimingDelay" min="0" max="4" step="0.2" value="${this.element.delay || 0}" />
            </div>
            <div class="form-group">
              <label>Animation Duration: <span id="lblTimingDuration">${this.element.animDuration || 0.8}s</span></label>
              <input type="range" id="inpTimingDuration" min="0.2" max="3" step="0.1" value="${this.element.animDuration || 0.8}" />
            </div>
          </div>

          <div class="form-group">
            <label>Easing Curve</label>
            <select class="form-input" id="inpTimingEasing">
              <option value="cubic-bezier(0.34, 1.56, 0.64, 1)" ${this.element.easing?.includes('1.56') ? 'selected' : ''}>Bouncy Spring</option>
              <option value="cubic-bezier(0.4, 0, 0.2, 1)" ${this.element.easing?.includes('0.4') ? 'selected' : ''}>Smooth Ease In Out</option>
              <option value="linear" ${this.element.easing === 'linear' ? 'selected' : ''}>Linear Constant</option>
            </select>
          </div>

          <div style="margin-top:10px; display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" id="btnSaveTimingPanel">Done</button>
          </div>
        </div>
      </div>
    `;

    panel.addEventListener('input', (e) => {
      if (e.target.id === 'inpTimingDelay') {
        this.element.delay = parseFloat(e.target.value);
        const lbl = panel.querySelector('#lblTimingDelay');
        if (lbl) lbl.textContent = `${this.element.delay}s`;
        this.onUpdate();
      }
      if (e.target.id === 'inpTimingDuration') {
        this.element.animDuration = parseFloat(e.target.value);
        const lbl = panel.querySelector('#lblTimingDuration');
        if (lbl) lbl.textContent = `${this.element.animDuration}s`;
        this.onUpdate();
      }
    });

    panel.addEventListener('change', (e) => {
      if (e.target.id === 'inpTimingAnim') {
        this.element.animation = e.target.value;
        this.onUpdate();
      }
      if (e.target.id === 'inpTimingEasing') {
        this.element.easing = e.target.value;
        this.onUpdate();
      }
    });

    panel.addEventListener('click', (e) => {
      if (e.target === panel || e.target.closest('#btnCloseTimingPanel') || e.target.closest('#btnSaveTimingPanel')) {
        panel.remove();
        this.onClose();
      }
    });

    return panel;
  }
}
