/**
 * Birthday Studio - Scene Assets Panel
 * Single source of truth for Scene Asset Requirements, Semantic Slots,
 * Dynamic Capacity Tracking, and Slot-Aware Asset Management.
 */

import { SceneAssetDefinitionService } from '../../services/asset/SceneAssetDefinitions.js';
import { SlotManager } from '../../services/asset/SlotManager.js';
import { AssetPickerModal } from '../AssetPickerModal.js';
import { MediaPreviewView } from '../MediaPreviewView.js';
import { SceneRequirementsModal } from './SceneRequirementsModal.js';
import { assetRepository } from '../../services/AssetRepository.js';
import { Toast } from '../../utils/Toast.js';

export class SceneAssetsPanel {
  constructor(options = {}) {
    this.project = options.project || {};
    this.scene = options.scene || null;
    this.allAssets = options.allAssets || [];
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onOpenAssetPicker = options.onOpenAssetPicker || null;
  }

  setScene(scene, allAssets = []) {
    this.scene = scene;
    if (allAssets && allAssets.length > 0) this.allAssets = allAssets;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'scene-assets-panel-container';
    container.id = 'sceneAssetsPanelRoot';

    if (!this.scene) {
      container.innerHTML = `
        <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.8rem;">
          Select a scene to view its asset requirements.
        </div>
      `;
      return container;
    }

    const def = SceneAssetDefinitionService.getDefinition(this.scene.template);
    const slotsState = SlotManager.getSceneSlotsState(this.scene, this.allAssets);
    const completeness = SlotManager.getSceneCompleteness(this.scene, this.allAssets);
    const maxCapacity = SceneAssetDefinitionService.getMaxCapacity(this.scene);
    const currentAssetCount = (this.scene.assetIds || []).length;
    const capacityPct = Math.min(100, Math.round((currentAssetCount / maxCapacity) * 100));

    const requiredSlots = slotsState.filter(s => s.required);
    const optionalSlots = slotsState.filter(s => !s.required);

    const totalRequired = requiredSlots.length;
    const completedRequired = requiredSlots.filter(s => s.isComplete).length;
    const missingRequired = requiredSlots.filter(s => s.isMissingRequired).length;
    const totalOptional = optionalSlots.length;

    const isBlankOrUniversal = this.scene.template === 'universal';

    // 1. Top Compact Summary Box
    let summaryContentHtml = '';
    if (totalRequired > 0) {
      const isAllComplete = missingRequired === 0;
      summaryContentHtml = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
          <div>
            <div style="font-size:0.75rem; font-weight:800; color:var(--accent-gold, #f6c90e); text-transform:uppercase; letter-spacing:0.5px;">
              ASSET REQUIREMENTS
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
              <strong>${totalRequired} required</strong> · <strong>${totalOptional} optional</strong>
            </div>
          </div>
          <button class="btn btn-ghost btn-xs" id="btnInspectSceneReqs" style="font-size:0.7rem; padding:2px 6px; border:1px solid var(--border);" title="View full asset specifications">
            ℹ️ Specs
          </button>
        </div>

        <div style="font-size:0.75rem; font-weight:700; margin-bottom:6px; display:flex; flex-direction:column; gap:3px;">
          ${isAllComplete ? `
            <span style="color:#2ed573; display:flex; align-items:center; gap:5px;">
              <span>✓</span> <span>All required assets added</span>
            </span>
            <span style="color:var(--text-muted); font-size:0.7rem; font-weight:400;">
              ${totalOptional} optional slot${totalOptional === 1 ? '' : 's'} available
            </span>
          ` : `
            <span style="color:#2ed573; display:flex; align-items:center; gap:5px;">
              <span>✓</span> <span>${completedRequired} required slot${completedRequired === 1 ? '' : 's'} complete</span>
            </span>
            <span style="color:#ffa502; display:flex; align-items:center; gap:5px;">
              <span>⚠️</span> <span>${missingRequired} required slot${missingRequired === 1 ? '' : 's'} remaining</span>
            </span>
          `}
        </div>

        <!-- Visual Capacity Bar -->
        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted); margin-bottom:3px;">
          <span>Scene Capacity: <strong>${currentAssetCount}/${maxCapacity}</strong></span>
          <span>${capacityPct}%</span>
        </div>
        <div style="height:5px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
          <div style="width:${capacityPct}%; height:100%; background:${currentAssetCount >= maxCapacity ? '#ff4757' : 'linear-gradient(90deg, #7f5af0, #2cb67d)'}; transition:width 0.3s ease;"></div>
        </div>
      `;
    } else {
      // Scene with NO required assets
      summaryContentHtml = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
          <div>
            <div style="font-size:0.75rem; font-weight:800; color:var(--accent-gold, #f6c90e); text-transform:uppercase; letter-spacing:0.5px;">
              ASSET REQUIREMENTS
            </div>
            <div style="font-size:0.82rem; font-weight:800; color:#2ed573; margin-top:2px; display:flex; align-items:center; gap:5px;">
              <span>✓</span> <span>No assets required</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-xs" id="btnInspectSceneReqs" style="font-size:0.7rem; padding:2px 6px; border:1px solid var(--border);" title="View full asset specifications">
            ℹ️ Specs
          </button>
        </div>

        <p style="font-size:0.75rem; color:var(--text-muted); margin:0 0 6px 0; line-height:1.3;">
          ${isBlankOrUniversal 
            ? 'This is a blank canvas. Add any supported assets using the editor controls.' 
            : 'This scene works without adding any images, videos, or audio.'}
        </p>

        ${totalOptional > 0 ? `
          <div style="font-size:0.72rem; color:var(--accent, #7f5af0); font-weight:700;">
            ${totalOptional} optional asset slot${totalOptional === 1 ? '' : 's'} available below
          </div>
        ` : ''}
      `;
    }

    container.innerHTML = `
      <!-- Scene Asset Capacity & Status Card -->
      <div class="scene-asset-status-card" style="background:var(--surface-elevated, #1a162c); border:1px solid var(--border, rgba(255,255,255,0.12)); border-radius:var(--radius-md, 8px); padding:10px 12px; margin-bottom:12px;">
        ${summaryContentHtml}
      </div>

      <!-- 2. REQUIRED SLOTS SECTION -->
      ${requiredSlots.length > 0 ? `
        <div class="scene-slots-group required-slots-group" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid rgba(255,165,2,0.3); padding-bottom:4px;">
            <span style="font-size:0.75rem; font-weight:800; color:#ffa502; text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:5px;">
              <span>⚠️</span> <span>REQUIRED ASSETS (${completedRequired}/${totalRequired})</span>
            </span>
            <span style="font-size:0.7rem; color:var(--text-muted);">${requiredSlots.length} slot${requiredSlots.length === 1 ? '' : 's'}</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            ${requiredSlots.map(slot => this.renderSlotCard(slot, true)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 3. OPTIONAL SLOTS SECTION -->
      ${optionalSlots.length > 0 ? `
        <div class="scene-slots-group optional-slots-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid var(--border, rgba(255,255,255,0.1)); padding-bottom:4px;">
            <span style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:5px;">
              <span>✨</span> <span>OPTIONAL ASSETS (${optionalSlots.length})</span>
            </span>
            <span style="font-size:0.7rem; color:var(--text-muted);">${optionalSlots.length} slot${optionalSlots.length === 1 ? '' : 's'}</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            ${optionalSlots.map(slot => this.renderSlotCard(slot, false)).join('')}
          </div>
        </div>
      ` : ''}
    `;

    this.attachEvents(container);
    return container;
  }

  renderSlotCard(slot, isRequired = false) {
    const isMissing = slot.isMissingRequired;
    const isComplete = slot.isComplete;
    const isFull = slot.isFull;
    const assigned = slot.assignedAssets || [];
    const minNeeded = slot.min || 1;

    let statusBadgeHtml = '';
    if (isRequired) {
      if (isComplete) {
        statusBadgeHtml = `<span style="font-size:0.65rem; background:rgba(46,213,115,0.2); color:#2ed573; padding:2px 6px; border-radius:4px; font-weight:800;">✓ COMPLETE</span>`;
      } else {
        statusBadgeHtml = `<span style="font-size:0.65rem; background:rgba(255,165,2,0.2); color:#ffa502; padding:2px 6px; border-radius:4px; font-weight:800;">⚠️ ${slot.assignedCount === 0 ? 'MISSING' : `ADD ${minNeeded - slot.assignedCount} MORE`}</span>`;
      }
    } else {
      statusBadgeHtml = `<span style="font-size:0.65rem; background:rgba(255,255,255,0.06); color:var(--text-muted); padding:2px 6px; border-radius:4px; font-weight:700;">○ OPTIONAL</span>`;
    }

    return `
      <div class="slot-card ${isMissing ? 'slot-card-missing' : ''} ${isComplete ? 'slot-card-complete' : ''}" data-slot-id="${slot.slotId}" style="background:var(--surface-elevated, #161325); border:1px solid ${isMissing ? '#ffa502' : (isComplete ? 'rgba(46, 213, 115, 0.4)' : 'var(--border, rgba(255,255,255,0.1))')}; border-radius:var(--radius-md, 8px); padding:9px 10px; transition:all 0.2s ease;">
        <!-- Slot Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <strong style="font-size:0.82rem; color:var(--text);">${slot.name}</strong>
              ${statusBadgeHtml}
            </div>
            <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">
              ${slot.description || ''} • Formats: ${(slot.formats || ['Any']).join(', ').toUpperCase()}
              ${slot.aspectRatio && slot.aspectRatio !== 'any' ? ` • Ratio: ${slot.aspectRatio}` : ''}
            </div>
          </div>
          <span style="font-size:0.72rem; font-weight:800; color:${isMissing ? '#ffa502' : (isFull ? 'var(--text)' : 'var(--text-muted)')}; background:var(--surface, #0f0c1b); padding:2px 6px; border-radius:5px; border:1px solid var(--border); flex-shrink:0;">
            ${slot.assignedCount} / ${slot.max}
          </span>
        </div>

        <!-- Assigned Asset Items List -->
        ${assigned.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap:5px; margin-bottom:6px;">
            ${assigned.map(asset => this.renderAssignedAssetItem(asset, slot)).join('')}
          </div>
        ` : ''}

        <!-- Actions / Add Buttons -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <div style="font-size:0.68rem; color:${isMissing ? '#ffa502' : 'var(--text-muted)'};">
            ${isMissing ? `⚠️ Add at least ${minNeeded} item${minNeeded === 1 ? '' : 's'}` : (isFull ? '🔒 Maximum limit reached' : `${slot.max - slot.assignedCount} slot${(slot.max - slot.assignedCount) === 1 ? '' : 's'} remaining`)}
          </div>

          <div>
            ${!isFull ? `
              <button class="btn btn-xs ${isMissing ? 'btn-primary' : 'btn-secondary'} btn-assign-slot" data-slot-id="${slot.slotId}" style="display:inline-flex; align-items:center; gap:4px; font-weight:700; padding:3px 8px;">
                <span>➕</span> <span>${assigned.length > 0 ? 'Add Another' : 'Choose Asset'}</span>
              </button>
            ` : `
              <span style="font-size:0.68rem; color:var(--text-muted); font-weight:700; padding:2px 6px; background:rgba(255,255,255,0.05); border-radius:4px;">
                Max Reached
              </span>
            `}
          </div>
        </div>
      </div>
    `;
  }

  renderAssignedAssetItem(asset, slot) {
    const isImg = (asset.type || '').startsWith('image') || asset.type === 'sticker';
    const isVid = (asset.type || '').startsWith('video');
    const isAud = (asset.type || '').startsWith('audio');
    const url = asset.renderUrl || asset.thumbnail || asset.url || '';

    return `
      <div class="slot-asset-row" style="display:flex; align-items:center; justify-content:space-between; background:var(--surface, #0f0c1b); border:1px solid var(--border, rgba(255,255,255,0.08)); border-radius:var(--radius-sm, 6px); padding:4px 6px; gap:6px;">
        <div style="display:flex; align-items:center; gap:6px; min-width:0; flex:1;">
          <div style="width:30px; height:30px; border-radius:4px; overflow:hidden; background:#000; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
            ${isImg && url ? `<img src="${url}" alt="" style="width:100%; height:100%; object-fit:cover;" />` : ''}
            ${isVid ? `<span style="font-size:0.9rem;">🎬</span>` : ''}
            ${isAud ? `<span style="font-size:0.9rem;">🎵</span>` : ''}
            ${!url && !isVid && !isAud ? `<span style="font-size:0.9rem;">📄</span>` : ''}
          </div>
          <div style="min-width:0; flex:1;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${asset.name || 'Media Asset'}
            </div>
            <div style="font-size:0.65rem; color:var(--text-muted);">
              ${(asset.metadata?.fileFormat || asset.type || '').toUpperCase()} ${asset.metadata?.aspectRatio ? `• ${asset.metadata.aspectRatio}` : ''}
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
          <button class="btn btn-ghost btn-compact btn-preview-asset" data-asset-id="${asset.id}" title="Preview Asset" style="padding:2px 5px; font-size:0.7rem;">
            👁️
          </button>
          <button class="btn btn-ghost btn-compact btn-replace-slot-asset" data-slot-id="${slot.slotId}" data-asset-id="${asset.id}" title="Replace Asset in this Slot" style="padding:2px 5px; font-size:0.7rem;">
            🔄
          </button>
          <button class="btn btn-ghost btn-compact btn-danger btn-remove-slot-asset" data-slot-id="${slot.slotId}" data-asset-id="${asset.id}" title="Remove from Slot" style="padding:2px 5px; font-size:0.7rem; color:var(--danger, #ff4757);">
            ✕
          </button>
        </div>
      </div>
    `;
  }

  attachEvents(container) {
    // Inspect Scene Requirements
    container.querySelector('#btnInspectSceneReqs')?.addEventListener('click', () => {
      const modal = new SceneRequirementsModal(this.scene.template);
      document.body.appendChild(modal.render());
    });

    // Slot Assign Asset Button
    container.querySelectorAll('.btn-assign-slot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slotId = e.currentTarget.dataset.slotId;
        this.openPickerForSlot(slotId);
      });
    });

    // Slot Replace Asset Button
    container.querySelectorAll('.btn-replace-slot-asset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slotId = e.currentTarget.dataset.slotId;
        this.openPickerForSlot(slotId, true);
      });
    });

    // Slot Remove Asset Button
    container.querySelectorAll('.btn-remove-slot-asset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const slotId = e.currentTarget.dataset.slotId;
        const assetId = e.currentTarget.dataset.assetId;
        SlotManager.removeAssetFromSlot(this.scene, slotId, assetId);
        this.onProjectModified();
        Toast.show('Asset removed from slot', 'info');
        this.refreshInPlace(container);
      });
    });

    // Preview Asset Button
    container.querySelectorAll('.btn-preview-asset').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const assetId = e.currentTarget.dataset.assetId;
        const asset = (this.allAssets || []).find(a => a.id === assetId) || await assetRepository.getAsset(assetId);
        if (asset) {
          const preview = new MediaPreviewView(asset, this.project, () => {
            this.onProjectModified();
            this.refreshInPlace(container);
          });
          const elem = await preview.render();
          document.body.appendChild(elem);
        }
      });
    });
  }

  openPickerForSlot(slotId, isReplace = false) {
    const modal = new AssetPickerModal({
      project: this.project,
      allAssets: this.allAssets,
      targetScene: this.scene,
      targetSlotId: slotId,
      onProjectModified: () => {
        this.onProjectModified();
        const root = document.getElementById('sceneAssetsPanelRoot');
        if (root) this.refreshInPlace(root);
      },
      onSelectAsset: (asset) => {
        const res = SlotManager.assignAssetToSlot(this.scene, slotId, asset, this.allAssets);
        if (res.success) {
          this.onProjectModified();
          Toast.show(`Assigned ${asset.name} to slot`, 'success');
          const root = document.getElementById('sceneAssetsPanelRoot');
          if (root) this.refreshInPlace(root);
        } else {
          Toast.show(res.error || 'Failed to assign asset', 'error');
        }
      }
    });

    document.body.appendChild(modal.render());
  }

  refreshInPlace(currentContainer) {
    const newRoot = this.render();
    currentContainer.replaceWith(newRoot);
  }
}

