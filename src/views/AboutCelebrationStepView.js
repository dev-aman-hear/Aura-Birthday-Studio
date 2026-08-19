/**
 * Birthday Studio - Step 0: About the Celebration View
 * Onboarding Question & Occasion Card Picker
 */

export class AboutCelebrationStepView {
  constructor(options = {}) {
    this.selectedOccasion = options.selectedOccasion || '';
    this.customOccasion = options.customOccasion || '';
    this.recipientName = options.recipientName || '';
    this.onUpdate = options.onUpdate || (() => {});
  }

  render() {
    const box = document.createElement('div');
    box.className = 'about-celebration-step-container animate-fade';
    box.id = 'aboutCelebrationStepRoot';

    const occasions = [
      { id: 'birthday', label: 'Birthday', icon: '🎂' },
      { id: 'wedding', label: 'Wedding', icon: '💍' },
      { id: 'anniversary', label: 'Anniversary', icon: '❤️' },
      { id: 'graduation', label: 'Graduation', icon: '🎓' },
      { id: 'congratulations', label: 'Congratulations', icon: '🎉' },
      { id: 'babyshower', label: 'Baby Shower', icon: '👶' },
      { id: 'other', label: 'Other', icon: '✨' }
    ];

    box.innerHTML = `
      <div style="text-align:center; margin-bottom:28px;">
        <h2 style="font-size:1.6rem; font-weight:900; margin-bottom:6px;">What are you creating?</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">Select an occasion to tailor your celebration experience.</p>
      </div>

      <div class="occasion-cards-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:14px; margin-bottom:24px;">
        ${occasions.map(occ => {
          const isSelected = this.selectedOccasion === occ.id;
          return `
            <div class="occasion-card ${isSelected ? 'selected' : ''}" data-occ-id="${occ.id}" style="background:var(--surface-elevated); border:${isSelected ? '2px solid var(--accent)' : '1px solid var(--border)'}; border-radius:var(--radius-lg); padding:18px; cursor:pointer; text-align:center; transition:all var(--transition-fast);">
              <div style="font-size:2.4rem; margin-bottom:8px;">${occ.icon}</div>
              <div style="font-weight:800; font-size:0.95rem;">${occ.label}</div>
            </div>
          `;
        }).join('')}
      </div>

      ${this.selectedOccasion === 'other' ? `
        <div class="form-group animate-fade" style="margin-bottom:20px;">
          <label style="font-weight:700; font-size:0.82rem;">Custom Occasion Name</label>
          <input type="text" class="form-input" id="inpCustomOccasion" placeholder="e.g., Retirement, Farewell, Promotion..." value="${this.customOccasion}" style="width:100%;" />
        </div>
      ` : ''}

      ${this.selectedOccasion ? `
        <div class="form-group animate-fade" style="margin-top:20px; background:var(--surface); border:1px solid var(--border); padding:20px; border-radius:var(--radius-lg);">
          <label style="font-weight:700; font-size:0.85rem; color:var(--accent-gold);">WHO IS THIS CELEBRATION FOR? (OPTIONAL)</label>
          <input type="text" class="form-input" id="inpRecipientName" placeholder="Enter recipient's name (Optional)..." value="${this.recipientName}" style="width:100%; font-size:0.95rem; margin-top:6px;" />
        </div>
      ` : ''}
    `;

    this.attachEvents(box);
    return box;
  }

  attachEvents(box) {
    box.addEventListener('click', (e) => {
      const card = e.target.closest('[data-occ-id]');
      if (card) {
        this.selectedOccasion = card.dataset.occId || card.getAttribute('data-occ-id');
        const newBox = this.render();
        box.replaceWith(newBox);
        this.notify();
      }
    });

    box.querySelector('#inpCustomOccasion')?.addEventListener('input', (e) => {
      this.customOccasion = e.target.value;
      this.notify();
    });

    box.querySelector('#inpRecipientName')?.addEventListener('input', (e) => {
      this.recipientName = e.target.value;
      this.notify();
    });
  }

  notify() {
    let finalOccasion = this.selectedOccasion;
    if (this.selectedOccasion === 'other') {
      finalOccasion = this.customOccasion.trim() || 'Other';
    }
    this.onUpdate({
      occasion: finalOccasion,
      selectedOccasion: this.selectedOccasion,
      customOccasion: this.customOccasion,
      recipientName: this.recipientName
    });
  }
}
