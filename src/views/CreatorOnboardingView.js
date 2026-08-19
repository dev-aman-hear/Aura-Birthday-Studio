/**
 * Birthday Studio - Creator Onboarding View (Section 1)
 * 4-Step First-Time Creator Experience Wizard Modal
 */

import { OnboardingService } from '../services/OnboardingService.js';
import { Accessibility } from '../utils/Accessibility.js';

export class CreatorOnboardingView {
  constructor(onFinish = (() => {})) {
    this.onFinish = onFinish;
    this.currentStep = 0;
    this.steps = [
      {
        icon: '🎂',
        title: 'Welcome to Aura Birthday Studio!',
        description: 'Turn your favorite memories into a dynamic visual celebration story for birthdays, weddings, anniversaries and milestones.'
      },
      {
        icon: '✍️',
        title: '1. Personalize & Pick a Style',
        description: 'Custom-tailor text, messages, fonts, color palettes and style themes to match your recipient’s unique personality.'
      },
      {
        icon: '📷',
        title: '2. Add Media & Story Scenes',
        description: 'Drag and drop photos and video memories into scene templates, and arrange your timeline sequence effortlessly.'
      },
      {
        icon: '🚀',
        title: '3. Publish & Share Instantly',
        description: 'Generate a temporary 7-day shareable link, custom QR code, or Web Share card with zero backend configuration needed!'
      }
    ];
  }

  render() {
    const modal = document.createElement('div');
    modal.className = 'wizard-overlay animate-fade';
    modal.id = 'creatorOnboardingModalRoot';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    this.updateModalContent(modal);
    Accessibility.trapFocus(modal);
    Accessibility.onEscape(modal, () => this.finishOnboarding(modal));

    return modal;
  }

  updateModalContent(modal) {
    const step = this.steps[this.currentStep];
    const isLast = this.currentStep === this.steps.length - 1;

    modal.innerHTML = `
      <div class="wizard-modal text-center" style="max-width:500px; padding:28px;">
        <div style="font-size:3.5rem; margin-bottom:8px;">${step.icon}</div>
        <h3 style="font-size:1.3rem; font-weight:800;">${step.title}</h3>
        <p style="color:var(--text-muted); font-size:0.88rem; margin:10px 0 24px 0; line-height:1.5;">
          ${step.description}
        </p>

        <div style="display:flex; justify-content:center; gap:6px; margin-bottom:24px;">
          ${this.steps.map((_, i) => `
            <div style="width:10px; height:10px; border-radius:50%; background:${i === this.currentStep ? 'var(--accent)' : 'var(--border)'};"></div>
          `).join('')}
        </div>

        <div style="display:flex; justify-space-between; align-items:center;">
          <button class="btn btn-ghost btn-sm" id="btnSkipOnboarding">Skip Intro</button>
          <button class="btn btn-primary" id="btnNextOnboarding" style="min-height:44px; font-weight:800;">
            ${isLast ? '🚀 Get Started' : 'Next →'}
          </button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'btnSkipOnboarding') {
        this.finishOnboarding(modal);
      }
      if (e.target.id === 'btnNextOnboarding') {
        if (isLast) {
          this.finishOnboarding(modal);
        } else {
          this.currentStep++;
          this.updateModalContent(modal);
        }
      }
    });
  }

  finishOnboarding(modal) {
    OnboardingService.markCompleted();
    modal.remove();
    this.onFinish();
  }
}
