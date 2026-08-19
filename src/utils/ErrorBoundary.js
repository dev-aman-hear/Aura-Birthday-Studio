/**
 * Birthday Studio - Global Error Boundary Utility (Section 16)
 * Controlled UI Execution Wrapper preventing White Screen Failures
 */

import { ErrorRecoveryService } from '../services/ErrorRecoveryService.js';

export class ErrorBoundary {
  static wrap(fn, context = 'Component') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (err) {
        ErrorRecoveryService.handleError(err, context);
        const fallback = document.createElement('div');
        fallback.className = 'error-boundary-fallback p-lg text-center';
        fallback.style.padding = '32px';
        fallback.style.background = 'var(--surface-elevated)';
        fallback.style.border = '1px solid var(--danger)';
        fallback.style.borderRadius = 'var(--radius-md)';
        fallback.innerHTML = `
          <h3 style="color:var(--danger); font-size:1.2rem;">⚠️ UI Component Failure</h3>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-top:6px;">An unexpected rendering error occurred during ${context}.</p>
          <button class="btn btn-primary margin-top-md" onclick="window.location.reload()">🔄 Reload Application</button>
        `;
        return fallback;
      }
    };
  }
}
