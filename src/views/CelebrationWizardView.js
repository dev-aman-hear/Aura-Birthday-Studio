/**
 * Birthday Studio - Celebration Wizard Shell Container (Section 2)
 * Guided Step-by-Step Creation Container (Step 0: About, 1: Personalize, 2: Style, 3: Media)
 */

import { PresetRegistry } from '../data/presets/PresetRegistry.js';
import { CelebrationBuilderService } from '../services/CelebrationBuilderService.js';
import { StartFromBlankStepView } from './StartFromBlankStepView.js';
import { PersonalizationStepView } from './PersonalizationStepView.js';
import { StyleSelectionView } from './StyleSelectionView.js';
import { MediaSetupView } from './MediaSetupView.js';
import { CelebrationPreviewView } from './CelebrationPreviewView.js';
import { StyleRegistry } from '../data/styles/StyleRegistry.js';
import { projectRepository } from '../services/ProjectRepository.js';
import { Toast } from '../utils/Toast.js';

export class CelebrationWizardView {
  constructor(options = {}) {
    this.presetId = options.presetId || null;
    this.preset = this.presetId ? PresetRegistry.getPresetById(this.presetId) : null;
    this.variant = options.variant || (this.preset?.defaultVariant) || (this.preset?.availableVariants ? this.preset.availableVariants[this.preset.availableVariants.length - 1] : '8-scene');
    this.currentUser = options.currentUser || null;
    this.onFinish = options.onFinish || (() => {});
    this.isBlankMode = options.isBlankMode !== undefined ? options.isBlankMode : true;

    this.currentStep = this.isBlankMode ? 0 : 1; // 0: Start Blank Choice, 1: Personalize, 2: Style, 3: Media

    const initialOccasion = options.occasion || (this.preset ? this.preset.occasion : 'birthday');

    this.wizardData = {
      presetId: this.presetId || 'birthday_wisher',
      variant: this.variant,
      styleId: 'style_luxury',
      startMode: 'empty_canvas', // 'empty_canvas' | 'structure'
      selectedOccasion: initialOccasion,
      customOccasion: '',
      occasion: initialOccasion,
      uploadedAssetIds: [],
      personalization: {
        recipientName: '',
        nickname: '',
        creatorName: this.currentUser?.displayName || '',
        relationship: 'Friend',
        age: '',
        date: new Date().toISOString().split('T')[0],
        customMessage: ''
      }
    };
  }

  render() {
    const root = document.createElement('div');
    const isStyleStep = this.currentStep === 2;
    const isStartStep = this.currentStep === 0;
    root.className = `wizard-page-container ${(isStyleStep || isStartStep) ? 'wizard-step-style-mode' : ''}`;
    root.id = 'celebrationWizardRoot';

    root.innerHTML = `
      <header class="wizard-top-bar">
        <div class="wizard-brand-title">
          <span style="font-size:1.3rem;">🎂</span>
          <span style="font-weight:800; font-size:1.1rem; color:#ffffff;">Create Celebration</span>
        </div>

        <nav class="wizard-header-nav-steps" aria-label="Creation Progress">
          <span class="wiz-step-pill ${this.currentStep === 0 ? 'active' : 'completed'}">
            START
            ${this.currentStep === 0 ? '<span class="wiz-active-indicator-bar"></span>' : ''}
          </span>
          <span class="wiz-step-arrow">➔</span>
          <span class="wiz-step-pill ${this.currentStep === 1 ? 'active' : (this.currentStep > 1 ? 'completed' : '')}">
            PERSONALIZE
            ${this.currentStep === 1 ? '<span class="wiz-active-indicator-bar"></span>' : ''}
          </span>
          <span class="wiz-step-arrow">➔</span>
          <span class="wiz-step-pill ${this.currentStep === 2 ? 'active' : (this.currentStep > 2 ? 'completed' : '')}">
            STYLE
            ${this.currentStep === 2 ? '<span class="wiz-active-indicator-bar"></span>' : ''}
          </span>
          <span class="wiz-step-arrow">➔</span>
          <span class="wiz-step-pill ${this.currentStep === 3 ? 'active' : ''}">
            MEDIA
            ${this.currentStep === 3 ? '<span class="wiz-active-indicator-bar"></span>' : ''}
          </span>
        </nav>

        <button class="btn btn-ghost btn-sm btn-exit-wizard" id="btnCancelWizard">✕ Exit Wizard</button>
      </header>

      <main class="wizard-body-workspace ${(isStyleStep || isStartStep) ? 'wizard-workspace-wide' : ''}" id="wizardStepContent"></main>

      <footer class="wizard-footer-bar">
        <div class="wizard-footer-inner ${(isStyleStep || isStartStep) ? 'wide' : ''}">
          <button class="btn btn-secondary btn-wiz-back" id="btnWizBack">← Back</button>

          <div class="wizard-footer-tip">
            <span class="tip-icon">💡</span>
            <span>You can customize your content, media, and scenes in the next steps.</span>
          </div>

          <div style="display:flex; gap:8px;">
            ${this.currentStep === 3 ? `<button class="btn btn-ghost" id="btnWizSkipMedia">Skip for now</button>` : ''}
            <button class="btn btn-primary btn-wiz-continue" id="btnWizNext">
              ${this.currentStep === 3 ? '🚀 Generate Celebration' : (this.currentStep === 2 && this.wizardData.startMode === 'empty_canvas') ? 'Open Blank Canvas ➔' : 'Continue ➔'}
            </button>
          </div>
        </div>
      </footer>
    `;

    this.mountStepContent(root);
    this.attachEvents(root);
    return root;
  }

  mountStepContent(root) {
    const contentBox = root.querySelector('#wizardStepContent');
    contentBox.innerHTML = '';

    if (this.currentStep === 0) {
      const step0 = new StartFromBlankStepView({
        selectedMode: this.wizardData.startMode || 'empty_canvas',
        onSelectMode: (mode) => {
          this.wizardData.startMode = mode;
        },
        onProceed: (mode) => {
          this.wizardData.startMode = mode;
          if (mode === 'empty_canvas') {
            this.currentStep = 2; // Jump directly to Style Selection for Empty Canvas
          } else {
            this.currentStep = 1; // Move to Personalization for Structured starter
          }
          const newRoot = this.render();
          root.replaceWith(newRoot);
        }
      });
      contentBox.appendChild(step0.render());
    } else if (this.currentStep === 1) {
      const step1 = new PersonalizationStepView({
        data: this.wizardData.personalization,
        occasion: this.wizardData.occasion,
        onUpdate: (updated) => { this.wizardData.personalization = updated; }
      });
      contentBox.appendChild(step1.render());
    } else if (this.currentStep === 2) {
      const step2 = new StyleSelectionView({
        selectedStyleId: this.wizardData.styleId,
        occasion: this.wizardData.occasion || 'birthday',
        recipient: this.wizardData.personalization || { name: 'Friend' },
        onSelectStyle: (styleId) => { this.wizardData.styleId = styleId; }
      });
      contentBox.appendChild(step2.render());
    } else if (this.currentStep === 3) {
      const step3 = new MediaSetupView({
        uploadedAssetIds: this.wizardData.uploadedAssetIds,
        onUpdateMedia: (ids) => { this.wizardData.uploadedAssetIds = ids; }
      });
      contentBox.appendChild(step3.render());
    }
  }

  attachEvents(root) {
    root.addEventListener('click', async (e) => {
      if (e.target.id === 'btnCancelWizard') {
        window.location.hash = '#dashboard';
        return;
      }

      if (e.target.id === 'btnWizBack') {
        if (this.currentStep === 2 && this.wizardData.startMode === 'empty_canvas') {
          this.currentStep = 0; // Return directly to Start From Blank choice
          const newRoot = this.render();
          root.replaceWith(newRoot);
        } else if (this.currentStep > 0) {
          this.currentStep--;
          const newRoot = this.render();
          root.replaceWith(newRoot);
        } else {
          window.location.hash = '#dashboard';
        }
        return;
      }

      if (e.target.id === 'btnWizNext' || e.target.id === 'btnWizSkipMedia') {
        // 1. If on Step 0 (Start From Blank Hub)
        if (this.currentStep === 0) {
          if (this.wizardData.startMode === 'empty_canvas') {
            this.currentStep = 2; // Jump directly to Visual Style Selection
          } else {
            this.currentStep = 1; // Move to Personalization
          }
          const newRoot = this.render();
          root.replaceWith(newRoot);
          return;
        }

        // 2. If on Step 2 with Empty Canvas mode -> Create blank canvas project and open editor
        if (this.currentStep === 2 && this.wizardData.startMode === 'empty_canvas') {
          Toast.show('Creating your empty celebration canvas...', 'info');

          const blankProj = projectRepository.createBlankCanvasProject({
            occasion: this.wizardData.occasion || 'birthday',
            theme: this.wizardData.styleId || 'style_luxury',
            creatorId: this.currentUser?.id
          }, this.currentUser?.id);

          const style = StyleRegistry.getStyleById(this.wizardData.styleId || 'style_luxury');
          if (style) {
            blankProj.theme = style.id;
            blankProj.settings.styleConfig = {
              name: style.name,
              colors: style.colors,
              typography: style.typography,
              animation: style.animation,
              transition: style.transition
            };
          }

          await projectRepository.saveProject(blankProj, this.currentUser?.id);
          Toast.show('Empty canvas celebration created! 🎨', 'success');
          this.onFinish(blankProj.id);
          return;
        }

        // 3. Normal progression for Structured mode
        if (this.currentStep < 3) {
          this.currentStep++;
          const newRoot = this.render();
          root.replaceWith(newRoot);
        } else {
          // STEP 3 Complete -> Generate Structured Celebration
          Toast.show('Generating your celebration...', 'info');

          const createdProject = await CelebrationBuilderService.buildCelebration({
            presetId: this.wizardData.presetId,
            variant: this.wizardData.variant,
            occasion: this.wizardData.occasion,
            personalization: this.wizardData.personalization,
            styleId: this.wizardData.styleId,
            uploadedAssetIds: this.wizardData.uploadedAssetIds,
            creatorId: this.currentUser?.id
          });

          // Open Preview Overlay
          const previewer = new CelebrationPreviewView(
            createdProject,
            (projectId) => { this.onFinish(projectId); },
            (proj) => { this.onFinish(proj.id); }
          );

          const prevElem = await previewer.render();
          document.body.appendChild(prevElem);
        }
      }
    });
  }
}

