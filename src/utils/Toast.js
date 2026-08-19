/**
 * Birthday Studio - Non-Blocking Toast & Modal Confirmation System
 * Replaces browser alert() and confirm() with modern toasts and popup confirmation modals
 */

export class Toast {
  static show(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000001; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} animate-fade`;
    toast.style.cssText = 'background: #1e1e2e; color: #fff; padding: 12px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 10px; pointer-events: auto;';

    const icon = type === 'success' ? '✅' :
                 type === 'error' ? '❌' :
                 type === 'warning' ? '⚠️' : 'ℹ️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  static confirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.id = 'globalConfirmModalRoot';
      modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.75) !important;
        backdrop-filter: blur(4px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
      `;

      modal.innerHTML = `
        <div style="
          max-width: 420px;
          width: 90%;
          padding: 24px;
          background: #1e1e2e;
          color: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
          pointer-events: auto;
          z-index: 1000000;
        ">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🗑️</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin: 0 0 8px 0; color: #ffffff;">${title}</h3>
          <p style="color: #a6adc8; font-size: 0.9rem; margin: 0 0 20px 0; line-height: 1.5;">${message}</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="btnConfirmCancel" style="
              flex: 1;
              padding: 10px 16px;
              background: rgba(255, 255, 255, 0.1);
              color: #ffffff;
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 600;
              cursor: pointer;
            ">Cancel</button>
            <button id="btnConfirmOk" style="
              flex: 1;
              padding: 10px 16px;
              background: #ff4757;
              color: #ffffff;
              border: none;
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 700;
              cursor: pointer;
            ">Confirm Delete</button>
          </div>
        </div>
      `;

      const cleanup = (result) => {
        modal.remove();
        resolve(result);
      };

      modal.addEventListener('click', (e) => {
        if (e.target.closest('#btnConfirmOk')) {
          cleanup(true);
        } else if (e.target.closest('#btnConfirmCancel') || e.target === modal) {
          cleanup(false);
        }
      });

      document.body.appendChild(modal);
    });
  }
}
