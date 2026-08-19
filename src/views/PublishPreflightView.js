/**
 * Birthday Studio - Publish Pre-Flight Inspection View (Section 19)
 * Pre-Publish Checklist & Non-Blocking Warnings
 */

export class PublishPreflightView {
  constructor(project, onConfirmPublish = (() => {})) {
    this.project = project;
    this.onConfirmPublish = onConfirmPublish;
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';

    const recipientName = this.project?.recipient?.name;
    const sceneCount = (this.project?.scenes || []).length;
    const hasMedia = (this.project?.assetIds || []).length > 0;
    const hasFinale = (this.project?.scenes || []).some(s => s.template === 'final_wish');

    const checklist = [
      { label: 'Recipient Name Specified', pass: Boolean(recipientName && recipientName !== 'Someone Special'), warn: 'Using fallback "Someone Special"' },
      { label: 'Story Scenes (At least 2 scenes)', pass: sceneCount >= 2, warn: 'Single scene story' },
      { label: 'Media Memories Uploaded', pass: hasMedia, warn: 'Using beautiful local visual placeholders' },
      { label: 'Celebration Finale Scene Included', pass: hasFinale, warn: 'No grand finale closing scene' }
    ];

    modal.innerHTML = `
      <div class="wizard-modal" style="max-width:520px; padding:24px;">
        <div style="text-align:center; margin-bottom:16px;">
          <div style="font-size:2.5rem; margin-bottom:4px;">🚀</div>
          <h3 style="font-size:1.3rem; font-weight:800;">Celebration Pre-Flight Check</h3>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-top:2px;">Reviewing your celebration before generating the 7-day public link.</p>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">
          ${checklist.map(item => `
            <div style="background:var(--surface-elevated); padding:10px 14px; border-radius:var(--radius-md); border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
              <span>${item.pass ? '✅' : '⚠️'} ${item.label}</span>
              <span style="font-size:0.75rem; color:${item.pass ? 'var(--success)' : 'var(--warning)'}; font-weight:700;">
                ${item.pass ? 'Ready' : item.warn}
              </span>
            </div>
          `).join('')}
        </div>

        <div style="display:flex; gap:10px; justify-content:center;">
          <button class="btn btn-secondary" id="btnCancelPreflight">Cancel</button>
          <button class="btn btn-success" id="btnConfirmPublishAnyway">🚀 Publish Anyway</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target.closest('#btnCancelPreflight')) modal.remove();
      if (e.target.closest('#btnConfirmPublishAnyway')) {
        modal.remove();
        this.onConfirmPublish();
      }
    });

    return modal;
  }
}
