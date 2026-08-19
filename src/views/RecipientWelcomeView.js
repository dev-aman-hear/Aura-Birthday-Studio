/**
 * Birthday Studio - Recipient Welcome Screen View (Section 4)
 * Opening screen for published celebration links (100% snapshot data driven)
 */

export class RecipientWelcomeView {
  constructor(options = {}) {
    this.snapshot = options.snapshot || {};
    this.onBegin = options.onBegin || (() => {});
  }

  render() {
    const container = document.createElement('div');
    container.className = 'recipient-welcome-screen animate-fade';

    const recipientName = this.snapshot.recipient?.name || 'Someone Special';
    const creatorName = this.snapshot.creatorDisplayName || 'A Friend';
    const occasion = (this.snapshot.occasion || 'birthday').toLowerCase();

    let titleText = `Happy Birthday, ${recipientName}! 🎂`;
    if (occasion === 'wedding') titleText = `Happy Wedding, ${recipientName}! 💍`;
    else if (occasion === 'anniversary') titleText = `Happy Anniversary, ${recipientName}! ❤️`;
    else if (occasion === 'graduation') titleText = `Congratulations, ${recipientName}! 🎓`;
    else if (occasion === 'congratulations') titleText = `Congratulations, ${recipientName}! 🎉`;
    else if (occasion === 'babyshower' || occasion === 'baby_shower') titleText = `Welcome Baby & ${recipientName}! 🍼`;
    else titleText = `Happy ${this.snapshot.occasion || 'Celebration'}, ${recipientName}! ✨`;

    container.innerHTML = `
      <div class="welcome-card-content" style="max-width:540px; text-align:center; padding:40px 24px; background:rgba(20, 19, 34, 0.85); backdrop-filter:blur(16px); border:1px solid var(--border); border-radius:var(--radius-lg); box-shadow:var(--shadow-glow);">
        <div style="font-size:0.8rem; font-weight:800; color:var(--accent-gold); letter-spacing:1px; text-transform:uppercase; margin-bottom:12px;">
          ✨ A SPECIAL CELEBRATION ✨
        </div>

        <h1 style="font-size:2.2rem; font-weight:900; line-height:1.2; margin-bottom:12px;" id="welcomeRecipTitle">
          ${titleText}
        </h1>

        <p style="font-size:1rem; color:var(--text-muted); margin-bottom:24px;">
          A little celebration experience created especially for you by <strong style="color:var(--text);">${creatorName}</strong>.
        </p>

        <button class="btn btn-primary btn-lg" id="btnStartCelebration" style="min-height:50px; min-width:200px; font-size:1.05rem; font-weight:800;">
          Begin Celebration ✨
        </button>
      </div>
    `;

    container.querySelector('#btnStartCelebration')?.addEventListener('click', () => {
      this.onBegin();
    });

    return container;
  }
}
