/**
 * Birthday Studio - Auth View Component (Section 6, 7, 8)
 * Welcome Landing Page & Login / Create Account View
 */

import { authRepository } from '../services/AuthRepository.js';
import { Toast } from '../utils/Toast.js';

export class AuthView {
  constructor(onSuccess) {
    this.onSuccess = onSuccess;
    this.activeMode = 'login'; // 'login' or 'register'
  }

  render() {
    const root = document.createElement('div');
    root.className = 'auth-page-container';
    root.id = 'authPageRoot';

    root.innerHTML = `
      <div class="auth-card-wrapper animate-fade">
        <div class="auth-brand-header text-center">
          <div class="auth-logo-icon">✨ 🎂 ✨</div>
          <h1 class="auth-app-title">Welcome to Birthday Studio</h1>
          <p class="auth-app-tagline">Turn moments into experiences.</p>
        </div>

        <div class="auth-tabs-toggle margin-top-md">
          <button class="btn ${this.activeMode === 'login' ? 'btn-primary' : 'btn-ghost'} btn-block" id="tabModeLogin">
            Log In
          </button>
          <button class="btn ${this.activeMode === 'register' ? 'btn-primary' : 'btn-ghost'} btn-block" id="tabModeRegister">
            Create Account
          </button>
        </div>

        <form class="auth-form-body margin-top-md" id="authForm">
          ${this.activeMode === 'register' ? `
            <div class="form-group">
              <label for="authDisplayName">Display Name</label>
              <input type="text" class="form-input" id="authDisplayName" placeholder="Enter your display name" required />
            </div>
          ` : ''}

          <div class="form-group">
            <label for="authUsername">Username *</label>
            <input type="text" class="form-input" id="authUsername" placeholder="Enter username" autocomplete="username" required />
          </div>

          <div class="form-group">
            <label for="authPassword">Password *</label>
            <input type="password" class="form-input" id="authPassword" placeholder="Enter password" autocomplete="current-password" required />
          </div>

          ${this.activeMode === 'register' ? `
            <div class="form-group">
              <label for="authConfirmPassword">Confirm Password *</label>
              <input type="password" class="form-input" id="authConfirmPassword" placeholder="Re-enter password" autocomplete="new-password" required />
            </div>
          ` : ''}

          <button type="submit" class="btn btn-primary btn-block margin-top-md" id="btnSubmitAuth" style="min-height:44px; font-size:1rem;">
            ${this.activeMode === 'login' ? 'Log In ➔' : 'Create Account ✨'}
          </button>
        </form>

        <div class="auth-footer-note text-center margin-top-md" style="font-size:0.78rem; color:var(--text-muted);">
          Free local creator account. All data stored securely in your browser.
        </div>
      </div>
    `;

    this.attachEvents(root);
    return root;
  }

  attachEvents(root) {
    root.addEventListener('click', (e) => {
      if (e.target.id === 'tabModeLogin') {
        this.activeMode = 'login';
        const newRoot = this.render();
        root.replaceWith(newRoot);
      }
      if (e.target.id === 'tabModeRegister') {
        this.activeMode = 'register';
        const newRoot = this.render();
        root.replaceWith(newRoot);
      }
    });

    const form = root.querySelector('#authForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameInp = root.querySelector('#authUsername')?.value;
        const passwordInp = root.querySelector('#authPassword')?.value;
        const displayNameInp = root.querySelector('#authDisplayName')?.value;
        const confirmPassInp = root.querySelector('#authConfirmPassword')?.value;

        if (this.activeMode === 'register') {
          if (passwordInp !== confirmPassInp) {
            Toast.show('Passwords do not match.', 'error');
            return;
          }

          try {
            const user = await authRepository.register(usernameInp, passwordInp, displayNameInp);
            Toast.show(`Welcome to Birthday Studio, ${user.displayName}! 🎉`, 'success');
            if (this.onSuccess) this.onSuccess(user);
          } catch (err) {
            Toast.show(err.message || 'Registration failed.', 'error');
          }
        } else {
          try {
            const user = await authRepository.login(usernameInp, passwordInp);
            Toast.show(`Welcome back, ${user.displayName}! ✨`, 'success');
            if (this.onSuccess) this.onSuccess(user);
          } catch (err) {
            Toast.show(err.message || 'Invalid credentials.', 'error');
          }
        }
      });
    }
  }
}
