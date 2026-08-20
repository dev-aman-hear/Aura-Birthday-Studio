/**
 * Birthday Studio - Recipient Loading View Component (Section 7)
 * Minimal Smooth Recipient Loading Transition
 */

export class RecipientLoadingView {
  constructor(message = 'Loading your celebration...') {
    this.message = message;
  }

  render() {
    const root = document.createElement('div');
    root.className = 'recipient-loading-screen animate-fade';
    root.style.cssText = 'min-height:100vh; width:100vw; position:fixed; inset:0; display:flex; flex-direction:column; justify-content:center; align-items:center; background:radial-gradient(circle at 50% 50%, #15102a 0%, #080710 100%); color:#ffffff; z-index:99999; font-family:var(--font-main, sans-serif);';

    root.innerHTML = `
      <style>
        @keyframes celebrationBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes ringSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <div style="position:relative; width:80px; height:80px; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <div style="position:absolute; inset:0; border-radius:50%; border:3px solid rgba(127, 90, 240, 0.2); border-top-color:#7f5af0; animation:ringSpin 1s linear infinite;"></div>
        <div style="font-size:2.4rem; animation:celebrationBounce 1.5s ease-in-out infinite;">🎂</div>
      </div>
      <div style="font-weight:800; font-size:1.15rem; color:#f6c90e; letter-spacing:0.5px; text-shadow:0 0 16px rgba(246,201,14,0.3);">${this.message}</div>
      <div style="font-size:0.8rem; color:#94a1b2; margin-top:6px;">Preparing magical celebration memories...</div>
    `;

    return root;
  }
}


