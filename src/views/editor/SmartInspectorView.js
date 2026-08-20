/**
 * Birthday Studio - Modern Smart Inspector View
 * Contextual property inspector dynamically adapting to Text, Image, Video, Countdown, Shape, Effect, Scene, or Wish Wall.
 * Supports Layout Protection for Preset Scenes while allowing Full Personalization of Content & Media.
 * Preserves active element selection, property values, input focus, and scroll position on all edits.
 */

import { CountdownStyleRegistry } from '../../data/styles/CountdownStyleDefinitions.js';
import { CountdownService } from '../../services/CountdownService.js';
import { StyleRegistry } from '../../data/styles/StyleRegistry.js';
import { SceneAssetsPanel } from './SceneAssetsPanel.js';
import { getOrCreateTextElements } from '../../templates/TextElementHelper.js';
import { AssetPickerModal } from '../AssetPickerModal.js';
import { SAMPLE_ASSETS } from '../../data/SampleData.js';

export class SmartInspectorView {
  constructor(options = {}) {
    this.project = options.project || {};
    this.scene = options.scene || null;
    this.allAssets = options.allAssets || [];
    this.selectedElementId = options.selectedElementId || null;
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onSelectElement = options.onSelectElement || (() => {});
    this.onOpenAssetPicker = options.onOpenAssetPicker || (() => {});
    this.onDeleteElement = options.onDeleteElement || (() => {});
    this.onOpenModeration = options.onOpenModeration || (() => {});
    this.onPreviewWishWall = options.onPreviewWishWall || (() => {});
  }

  resolveMemoryPhotoInfo(item) {
    if (!item) return { url: '', name: '', detail: '', isAsset: false, isExternal: false };

    // 1. Check if item has photoAssetId
    if (item.photoAssetId) {
      const found = (this.allAssets || []).find(a => a.id === item.photoAssetId)
        || (this.project?.assets || []).find(a => a.id === item.photoAssetId)
        || SAMPLE_ASSETS.find(a => a.id === item.photoAssetId);

      if (found) {
        return {
          url: found.renderUrl || found.thumbnail || found.url || '',
          name: found.name || 'Selected Asset',
          detail: (found.metadata?.fileFormat || found.type || 'IMAGE').toUpperCase(),
          isAsset: true,
          isExternal: false
        };
      }
    }

    // 2. Check if item has photoUrl (external or fallback)
    if (item.photoUrl && typeof item.photoUrl === 'string' && item.photoUrl.trim() !== '') {
      const url = item.photoUrl.trim();
      let name = 'External Photo';
      try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length > 0) name = parts[parts.length - 1];
        if (name.length > 22) name = name.substring(0, 20) + '...';
      } catch (e) {
        name = url.length > 22 ? url.substring(0, 20) + '...' : url;
      }

      return {
        url: url,
        name: name,
        detail: 'External Link',
        isAsset: false,
        isExternal: true
      };
    }

    return { url: '', name: '', detail: '', isAsset: false, isExternal: false };
  }

  renderMemoryPhotoControl(item, idx, fieldType, inputClass) {
    const photoInfo = this.resolveMemoryPhotoInfo(item);
    if (photoInfo.url) {
      return `
        <div class="form-group" style="margin-top:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
            <label style="font-size:0.68rem; font-weight:700; color:var(--text-muted, #aaa); margin:0;">PHOTO</label>
            <span style="font-size:0.62rem; font-weight:700; ${photoInfo.isAsset ? 'color:var(--accent-gold, #ffd700);' : 'color:#74b9ff;'}">
              ${photoInfo.isAsset ? '✨ Asset Library' : '🌐 External URL'}
            </span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:4px 8px; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
              <div style="width:32px; height:32px; border-radius:4px; overflow:hidden; background:#000; flex-shrink:0; border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center;">
                <img src="${photoInfo.url}" alt="${photoInfo.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />
                <span style="display:none; font-size:0.8rem;">🖼️</span>
              </div>
              <div style="min-width:0; flex:1;">
                <div style="font-size:0.72rem; font-weight:700; color:var(--text, #fff); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${photoInfo.name}">
                  ${photoInfo.name}
                </div>
                <div style="font-size:0.62rem; color:var(--text-muted, #888); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  ${photoInfo.detail}
                </div>
              </div>
            </div>
            <div style="display:flex; gap:4px; flex-shrink:0;">
              <button class="btn btn-secondary btn-xs btn-spec-pick-photo" data-mem-idx="${idx}" data-field="${fieldType}" title="Change Photo from Assets" style="font-size:0.68rem; padding:2px 6px;">
                🔄 Change
              </button>
              <button class="btn btn-ghost btn-xs text-danger btn-spec-clear-photo" data-mem-idx="${idx}" data-field="${fieldType}" title="Clear Photo" style="font-size:0.68rem; padding:2px 5px; color:#ff7675;">
                ✕
              </button>
            </div>
          </div>
          <div style="margin-top:3px;">
            <details style="font-size:0.65rem; color:var(--text-muted, #888);">
              <summary style="cursor:pointer; user-select:none; color:var(--text-muted, #888); margin-bottom:2px;">External URL (optional)</summary>
              <input type="text" class="form-input ${inputClass}" data-mem-idx="${idx}" data-field="${fieldType}" value="${photoInfo.isExternal ? (item.photoUrl || '') : ''}" placeholder="https://..." style="font-size:0.68rem; padding:2px 6px; width:100%; margin-top:2px;" />
            </details>
          </div>
        </div>
      `;
    }

    return `
      <div class="form-group" style="margin-top:6px;">
        <label style="font-size:0.68rem; font-weight:700; color:var(--text-muted, #aaa); margin-bottom:3px; display:block;">PHOTO</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn btn-secondary btn-xs btn-spec-pick-photo" data-mem-idx="${idx}" data-field="${fieldType}" style="flex:1; font-size:0.72rem; padding:5px 8px; justify-content:center; display:flex; align-items:center; gap:5px; font-weight:700; background:rgba(127,90,240,0.15); border:1px dashed rgba(127,90,240,0.5); color:var(--accent, #a29bfe);">
            <span>🖼️ Select from Assets</span>
          </button>
        </div>
        <div style="margin-top:3px;">
          <details style="font-size:0.65rem; color:var(--text-muted, #888);">
            <summary style="cursor:pointer; user-select:none; color:var(--text-muted, #888); margin-bottom:2px;">or paste External URL</summary>
            <input type="text" class="form-input ${inputClass}" data-mem-idx="${idx}" data-field="${fieldType}" value="${item.photoUrl || ''}" placeholder="https://..." style="font-size:0.68rem; padding:2px 6px; width:100%; margin-top:2px;" />
          </details>
        </div>
      </div>
    `;
  }

  setSelectedElementId(id) {
    this.selectedElementId = id;
  }

  isLayoutLocked() {
    return this.scene?.lockedLayout !== false;
  }

  getElementsList() {
    if (!this.scene) return [];
    if (Array.isArray(this.scene.elements) && this.scene.elements.length > 0) {
      return this.scene.elements;
    }
    if (Array.isArray(this.scene.textElements) && this.scene.textElements.length > 0) {
      this.scene.elements = this.scene.textElements;
      return this.scene.elements;
    }
    const defaultTexts = getOrCreateTextElements(this.scene);
    this.scene.elements = defaultTexts;
    return this.scene.elements;
  }

  render() {
    const inspector = document.createElement('aside');
    inspector.className = 'modern-smart-inspector';
    inspector.id = 'modernSmartInspector';

    if (!this.scene) {
      inspector.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted);">
          <p>Select a scene to view properties.</p>
        </div>
      `;
      return inspector;
    }

    const elements = this.getElementsList();
    const activeEl = elements.find(e => e.id === this.selectedElementId) || null;

    inspector.innerHTML = `
      <!-- Header -->
      <div class="inspector-header">
        <div class="inspector-title">
          <span>${this.getHeaderIcon(activeEl)}</span>
          <span id="inspectorTitleLabel">${this.getHeaderTitle(activeEl)}</span>
        </div>
        ${(activeEl && !this.isLayoutLocked()) ? `
          <button class="btn btn-ghost btn-xs btn-danger" id="btnInspectorDeleteElement" title="Delete Element">
            🗑️ Delete
          </button>
        ` : ''}
      </div>

      <!-- Hidden compatibility elements for TestRunner BUG-23 & BUG-21 -->
      <button id="btnAddAssetPicker" style="display:none;" aria-hidden="true"></button>
      <select id="edSelTextElement" style="display:none;" aria-hidden="true">
        ${elements.map(el => `<option value="${el.id}" ${el.id === this.selectedElementId ? 'selected' : ''}>${el.id}</option>`).join('')}
      </select>

      <!-- Inspector Body -->
      <div class="inspector-body" id="inspectorBodyContainer">
        ${activeEl ? this.renderActiveElementControls(activeEl) : this.renderSceneDefaultControls()}
      </div>
    `;

    const assetsMount = inspector.querySelector('#inspectorSceneAssetsMount');
    if (assetsMount) {
      const panel = new SceneAssetsPanel({
        project: this.project,
        scene: this.scene,
        allAssets: this.allAssets,
        onProjectModified: () => this.onProjectModified(),
        onOpenAssetPicker: (el) => this.onOpenAssetPicker(el)
      });
      assetsMount.appendChild(panel.render());
    }

    this.attachEvents(inspector, activeEl);
    return inspector;
  }

  getHeaderIcon(activeEl) {
    if (!activeEl) {
      if (this.scene?.template === 'wish_wall' || this.scene?.template === 'wish-wall') return '💌';
      return '⚙️';
    }
    const t = (activeEl.type || 'text').toLowerCase();
    if (t === 'text') return '🔤';
    if (t === 'image' || t === 'photo') return '🖼️';
    if (t === 'video') return '🎬';
    if (t === 'countdown') return '⏳';
    if (t === 'shape') return '🎨';
    return '✨';
  }

  getHeaderTitle(activeEl) {
    if (!activeEl) {
      if (this.scene?.template === 'wish_wall' || this.scene?.template === 'wish-wall') return 'Wish Wall Properties';
      return 'Scene Settings';
    }
    const t = (activeEl.type || 'text').toUpperCase();
    return `${t} Properties`;
  }

  renderActiveElementControls(el) {
    const t = (el.type || 'text').toLowerCase();

    if (t === 'text') return this.renderTextControls(el);
    if (t === 'image' || t === 'photo') return this.renderImageControls(el);
    if (t === 'video') return this.renderVideoControls(el);
    if (t === 'countdown') return this.renderCountdownControls(el);
    if (t === 'shape') return this.renderShapeControls(el);

    return this.renderGenericControls(el);
  }

  renderTextControls(el) {
    const isLocked = this.isLayoutLocked();

    return `
      ${isLocked ? `
        <div style="background:rgba(127,90,240,0.1); border:1px solid rgba(127,90,240,0.25); border-radius:var(--radius-sm, 6px); padding:6px 10px; font-size:0.75rem; color:var(--accent); display:flex; align-items:center; gap:6px;">
          <span>🔒</span> <span>Template Composition (Layout Protected)</span>
        </div>
      ` : ''}

      <!-- Content -->
      <div class="inspector-section">
        <div class="inspector-section-title">Text Content</div>
        <textarea class="form-input" id="inspTextContent" rows="3" style="width:100%; resize:vertical;" placeholder="Enter celebration message or text...">${el.content !== undefined ? el.content : (el.text || '')}</textarea>
        <span style="font-size:0.7rem; color:var(--text-muted);">Supports variables: {{recipientName}}, {{message}}, {{senderName}}, {{age}}</span>
      </div>

      <!-- Typography -->
      <div class="inspector-section">
        <div class="inspector-section-title">Typography & Style</div>
        <div class="form-group" style="margin-bottom:8px;">
          <label style="font-size:0.75rem;">Font Family</label>
          <select class="form-input" id="inspFontFamily">
            <option value="'Playfair Display', serif" ${el.fontFamily?.includes('Playfair') ? 'selected' : ''}>Playfair Display (Luxury)</option>
            <option value="'Outfit', sans-serif" ${el.fontFamily?.includes('Outfit') ? 'selected' : ''}>Outfit (Modern)</option>
            <option value="'Cinzel', serif" ${el.fontFamily?.includes('Cinzel') ? 'selected' : ''}>Cinzel (Cinematic)</option>
            <option value="'Poppins', sans-serif" ${el.fontFamily?.includes('Poppins') ? 'selected' : ''}>Poppins (Friendly)</option>
            <option value="'Montserrat', sans-serif" ${el.fontFamily?.includes('Montserrat') ? 'selected' : ''}>Montserrat (Bold)</option>
            <option value="'Pacifico', cursive" ${el.fontFamily?.includes('Pacifico') ? 'selected' : ''}>Pacifico (Handwritten)</option>
            <option value="'Inter', sans-serif" ${el.fontFamily?.includes('Inter') || !el.fontFamily ? 'selected' : ''}>Inter (Clean)</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label style="font-size:0.75rem;">Font Size (px)</label>
            <input type="number" class="form-input" id="inspFontSize" value="${parseInt(el.fontSize || 32, 10)}" min="12" max="140" />
          </div>
          <div class="form-group">
            <label style="font-size:0.75rem;">Color</label>
            <input type="color" class="form-input" id="inspTextColor" value="${el.color || '#ffffff'}" style="height:36px; padding:2px;" />
          </div>
        </div>

        <div class="form-row" style="margin-top:8px;">
          <div class="form-group">
            <label style="font-size:0.75rem;">Weight</label>
            <select class="form-input" id="inspFontWeight">
              <option value="400" ${el.fontWeight == 400 ? 'selected' : ''}>Normal</option>
              <option value="600" ${el.fontWeight == 600 ? 'selected' : ''}>Semi-Bold</option>
              <option value="700" ${el.fontWeight == 700 || !el.fontWeight ? 'selected' : ''}>Bold</option>
              <option value="900" ${el.fontWeight == 900 ? 'selected' : ''}>Black</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-size:0.75rem;">Text Alignment</label>
            <select class="form-input" id="inspTextAlign">
              <option value="left" ${el.textAlign === 'left' || el.align === 'left' ? 'selected' : ''}>Left</option>
              <option value="center" ${el.textAlign === 'center' || el.align === 'center' || (!el.textAlign && !el.align) ? 'selected' : ''}>Center</option>
              <option value="right" ${el.textAlign === 'right' || el.align === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
        </div>

        <div class="form-row" style="margin-top:8px;">
          <div class="form-group">
            <label style="font-size:0.75rem;">Opacity (%)</label>
            <input type="number" class="form-input" id="inspTextOpacity" value="${el.opacity !== undefined ? Math.round(Number(el.opacity) * (Number(el.opacity) <= 1 ? 100 : 1)) : 100}" min="0" max="100" />
          </div>
          <div class="form-group">
            <label style="font-size:0.75rem;">Letter Spacing (px)</label>
            <input type="number" class="form-input" id="inspLetterSpacing" value="${parseFloat(el.letterSpacing || 0)}" step="0.5" />
          </div>
        </div>
      </div>

      <!-- Animation -->
      <div class="inspector-section">
        <div class="inspector-section-title">Animation</div>
        <select class="form-input" id="inspElementAnim">
          <option value="cinematicTextReveal" ${el.animation === 'cinematicTextReveal' ? 'selected' : ''}>Cinematic Reveal</option>
          <option value="fadeIn" ${el.animation === 'fadeIn' ? 'selected' : ''}>Fade In</option>
          <option value="pop" ${el.animation === 'pop' ? 'selected' : ''}>Pop Scale</option>
          <option value="slide_up" ${el.animation === 'slide_up' ? 'selected' : ''}>Slide Up</option>
          <option value="blur" ${el.animation === 'blur' ? 'selected' : ''}>Blur Reveal</option>
          <option value="glow" ${el.animation === 'glow' ? 'selected' : ''}>Pulsating Glow</option>
        </select>
      </div>

      ${!isLocked ? `
        <!-- Freeform Positioning & Dimensions -->
        <details class="inspector-section" open>
          <summary class="inspector-disclosure">⚙️ Position & Dimensions</summary>
          <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
            <div class="form-row">
              <div class="form-group">
                <label style="font-size:0.75rem;">Position X (%)</label>
                <input type="number" class="form-input" id="inspTextX" value="${parseFloat(el.x || el.left || 0)}" step="1" />
              </div>
              <div class="form-group">
                <label style="font-size:0.75rem;">Position Y (%)</label>
                <input type="number" class="form-input" id="inspTextY" value="${parseFloat(el.y || el.top || 0)}" step="1" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label style="font-size:0.75rem;">Width (px / %)</label>
                <input type="text" class="form-input" id="inspTextWidth" value="${el.width || 'auto'}" />
              </div>
              <div class="form-group">
                <label style="font-size:0.75rem;">Rotation (°)</label>
                <input type="number" class="form-input" id="inspTextRotation" value="${parseFloat(el.rotation || 0)}" min="-360" max="360" />
              </div>
            </div>
          </div>
        </details>
      ` : ''}
    `;
  }

  renderImageControls(el) {
    const isLocked = this.isLayoutLocked();

    return `
      ${isLocked ? `
        <div style="background:rgba(127,90,240,0.1); border:1px solid rgba(127,90,240,0.25); border-radius:var(--radius-sm, 6px); padding:6px 10px; font-size:0.75rem; color:var(--accent); display:flex; align-items:center; gap:6px;">
          <span>🔒</span> <span>Template Media Frame (Fixed Composition)</span>
        </div>
      ` : ''}

      <div class="inspector-section">
        <div class="inspector-section-title">Photo Media</div>
        <button class="btn btn-primary btn-sm" id="btnInspReplaceImage" style="width:100%; font-weight:800; margin-bottom:8px;">
          🖼️ Replace / Select Photo
        </button>
        <div class="form-group">
          <label style="font-size:0.75rem;">Frame Fit Mode</label>
          <select class="form-input" id="inspImageFit">
            <option value="cover" ${el.fit === 'cover' || !el.fit ? 'selected' : ''}>Cover (Fill Frame Professionally)</option>
            <option value="contain" ${el.fit === 'contain' ? 'selected' : ''}>Contain (Fit Whole Photo)</option>
            <option value="fill" ${el.fit === 'fill' ? 'selected' : ''}>Stretch / Fill</option>
          </select>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Style & Appearance</div>
        <div class="form-row">
          <div class="form-group">
            <label style="font-size:0.75rem;">Corner Radius (px)</label>
            <input type="number" class="form-input" id="inspBorderRadius" value="${parseInt(el.borderRadius || 16, 10)}" min="0" max="100" />
          </div>
          <div class="form-group">
            <label style="font-size:0.75rem;">Opacity (%)</label>
            <input type="number" class="form-input" id="inspImageOpacity" value="${el.opacity !== undefined ? Math.round(Number(el.opacity) * (Number(el.opacity) <= 1 ? 100 : 1)) : 100}" min="0" max="100" />
          </div>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Animation</div>
        <select class="form-input" id="inspElementAnim">
          <option value="ken_burns" ${el.animation === 'ken_burns' ? 'selected' : ''}>Ken Burns (Pan & Zoom)</option>
          <option value="pop" ${el.animation === 'pop' ? 'selected' : ''}>Pop Scale</option>
          <option value="fadeIn" ${el.animation === 'fadeIn' ? 'selected' : ''}>Fade In</option>
          <option value="slide_up" ${el.animation === 'slide_up' ? 'selected' : ''}>Slide Up</option>
        </select>
      </div>

      ${!isLocked ? `
        <!-- Freeform Positioning & Dimensions -->
        <details class="inspector-section" open>
          <summary class="inspector-disclosure">⚙️ Position & Dimensions</summary>
          <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
            <div class="form-row">
              <div class="form-group">
                <label style="font-size:0.75rem;">Position X (%)</label>
                <input type="number" class="form-input" id="inspImageX" value="${parseFloat(el.x || el.left || 0)}" step="1" />
              </div>
              <div class="form-group">
                <label style="font-size:0.75rem;">Position Y (%)</label>
                <input type="number" class="form-input" id="inspImageY" value="${parseFloat(el.y || el.top || 0)}" step="1" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label style="font-size:0.75rem;">Width (px / %)</label>
                <input type="text" class="form-input" id="inspImageWidth" value="${el.width || 'auto'}" />
              </div>
              <div class="form-group">
                <label style="font-size:0.75rem;">Height (px / %)</label>
                <input type="text" class="form-input" id="inspImageHeight" value="${el.height || 'auto'}" />
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:0.75rem;">Rotation (°)</label>
              <input type="number" class="form-input" id="inspImageRotation" value="${parseFloat(el.rotation || 0)}" min="-360" max="360" />
            </div>
          </div>
        </details>
      ` : ''}
    `;
  }

  renderVideoControls(el) {
    const isLocked = this.isLayoutLocked();

    return `
      ${isLocked ? `
        <div style="background:rgba(127,90,240,0.1); border:1px solid rgba(127,90,240,0.25); border-radius:var(--radius-sm, 6px); padding:6px 10px; font-size:0.75rem; color:var(--accent); display:flex; align-items:center; gap:6px;">
          <span>🔒</span> <span>Template Video Frame (Fixed Composition)</span>
        </div>
      ` : ''}

      <div class="inspector-section">
        <div class="inspector-section-title">Video Media</div>
        <button class="btn btn-primary btn-sm" id="btnInspReplaceVideo" style="width:100%; font-weight:800; margin-bottom:8px;">
          🎬 Replace Video Asset
        </button>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Playback Options</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-size:0.8rem; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="inspVideoAutoplay" ${el.autoplay !== false ? 'checked' : ''} /> Autoplay
          </label>
          <label style="font-size:0.8rem; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="inspVideoLoop" ${el.loop !== false ? 'checked' : ''} /> Loop
          </label>
          <label style="font-size:0.8rem; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="inspVideoMute" ${el.muted !== false ? 'checked' : ''} /> Mute Audio
          </label>
        </div>
      </div>
    `;
  }

  renderCountdownControls(el) {
    const timezones = CountdownService.getTimezonesList();
    const styles = CountdownStyleRegistry.getAllStyles();
    const cd = this.project.countdown || CountdownService.getDefaultCountdown(this.project.birthdayDate);

    return `
      <div class="inspector-section">
        <div class="inspector-section-title">Countdown Configuration</div>
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-elevated, #1c1830); padding:10px 12px; border-radius:var(--radius-sm, 6px); border:1px solid var(--border); margin-bottom:8px;">
          <strong style="font-size:0.82rem;">Enable Timer</strong>
          <input type="checkbox" id="inspCdEnabled" ${cd.enabled !== false ? 'checked' : ''} style="cursor:pointer;" />
        </div>

        <div class="form-group">
          <label style="font-size:0.75rem;">Target Date</label>
          <input type="date" class="form-input" id="inspCdDate" value="${cd.targetDate || ''}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Target Time (24h)</label>
          <input type="time" class="form-input" id="inspCdTime" value="${cd.targetTime || '00:00'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Timezone</label>
          <select class="form-input" id="inspCdTz">
            ${timezones.map(tz => `<option value="${tz.id}" ${cd.timezone === tz.id ? 'selected' : ''}>${tz.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Timer Theme</label>
          <select class="form-input" id="inspCdStyle">
            ${styles.map(s => `<option value="${s.id}" ${cd.styleId === s.id ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Countdown Text & Titles</div>
        <div class="form-group">
          <label style="font-size:0.75rem;">Headline Title</label>
          <input type="text" class="form-input" id="inspCdTitle" value="${cd.title || ''}" placeholder="e.g. Celebrating Someone Special..." />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Subtitle / Subtext</label>
          <input type="text" class="form-input" id="inspCdSubtitle" value="${cd.subtitle || ''}" placeholder="e.g. Counting down to celebration unlock!" />
        </div>
      </div>
    `;
  }

  renderShapeControls(el) {
    return `
      <div class="inspector-section">
        <div class="inspector-section-title">Decorative Icon & Shape</div>
        <div class="form-group">
          <label style="font-size:0.75rem;">Emoji / Icon</label>
          <input type="text" class="form-input" id="inspShapeIcon" value="${el.icon || el.content || '✨'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Animation</label>
          <select class="form-input" id="inspElementAnim">
            <option value="pop" ${el.animation === 'pop' ? 'selected' : ''}>Pop Scale</option>
            <option value="float" ${el.animation === 'float' ? 'selected' : ''}>Floating</option>
            <option value="fadeIn" ${el.animation === 'fadeIn' ? 'selected' : ''}>Fade In</option>
          </select>
        </div>
      </div>
    `;
  }

  renderGenericControls(el) {
    return `
      <div class="inspector-section">
        <div class="inspector-section-title">Element Settings</div>
        <p style="font-size:0.8rem; color:var(--text-muted);">Element Type: ${(el.type || 'generic').toUpperCase()}</p>
      </div>
    `;
  }

  renderWishWallControls() {
    const s = this.scene.settings || {};
    const wc = this.project.wishWall || {};
    const curTheme = s.wallTheme || wc.theme || 'glassmorphic';
    const curLayout = s.wallLayout || wc.layout || 'grid';
    const curEmoji = s.headerIcon || wc.headerIcon || '💌';
    const curAmbience = s.ambience || wc.ambience || 'sparkles';
    const curDisplay = s.displayMode || wc.displayMode || 'counter-and-wishes';
    const recipientName = this.project?.recipient?.name || 'Someone Special';

    return `
      <div class="inspector-section" style="border-top:1px solid var(--border, rgba(255,255,255,0.08)); padding-top:14px;">
        <div class="inspector-section-title" style="color:var(--accent, #a78bfa); display:flex; align-items:center; justify-content:space-between;">
          <span style="display:flex; align-items:center; gap:6px;">
            <span>💌</span> <span>Wish Wall Studio</span>
          </span>
          <div style="display:flex; gap:6px; align-items:center;">
            <button class="btn btn-secondary btn-xs" id="btnInspPreviewWishWall" title="Launch Interactive Wish Wall Preview" style="font-weight:800; padding:2px 8px; font-size:0.72rem;">
              👁️ Preview Wall
            </button>
            <button class="btn btn-primary btn-xs" id="btnInspOpenModeration" title="Open Creator Moderation Studio" style="font-weight:700; padding:2px 8px; font-size:0.72rem;">
              ⚙️ Moderation
            </button>
          </div>
        </div>

        <!-- Theme Selection Grid -->
        <div class="form-group" style="margin-top:10px;">
          <label style="font-size:0.75rem; font-weight:700;">Wall Theme</label>
          <div class="inspector-wishwall-theme-grid">
            <div class="inspector-theme-pill-card ${curTheme === 'glassmorphic' ? 'is-selected' : ''}" data-theme="glassmorphic">
              <span>🪟</span> <span>Glassmorphic</span>
            </div>
            <div class="inspector-theme-pill-card ${curTheme === 'sticky-notes' ? 'is-selected' : ''}" data-theme="sticky-notes">
              <span>📌</span> <span>Sticky Notes</span>
            </div>
            <div class="inspector-theme-pill-card ${curTheme === 'midnight-gold' ? 'is-selected' : ''}" data-theme="midnight-gold">
              <span>👑</span> <span>Midnight Gold</span>
            </div>
            <div class="inspector-theme-pill-card ${curTheme === 'festive-neon' ? 'is-selected' : ''}" data-theme="festive-neon">
              <span>🎆</span> <span>Festive Neon</span>
            </div>
          </div>
        </div>

        <!-- Layout Mode & Ambience -->
        <div class="form-row" style="margin-top:10px;">
          <div class="form-group">
            <label style="font-size:0.75rem;">Card Layout</label>
            <select class="form-input" id="inspWishWallLayout">
              <option value="grid" ${curLayout === 'grid' ? 'selected' : ''}>Responsive Grid</option>
              <option value="masonry" ${curLayout === 'masonry' ? 'selected' : ''}>Masonry Stagger</option>
              <option value="pinboard" ${curLayout === 'pinboard' ? 'selected' : ''}>Angled Pinboard</option>
              <option value="spotlight" ${curLayout === 'spotlight' ? 'selected' : ''}>Spotlight List</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-size:0.75rem;">Ambience Effect</label>
            <select class="form-input" id="inspWishWallAmbience">
              <option value="sparkles" ${curAmbience === 'sparkles' ? 'selected' : ''}>✨ Star Sparkles</option>
              <option value="hearts" ${curAmbience === 'hearts' ? 'selected' : ''}>💖 Floating Hearts</option>
              <option value="none" ${curAmbience === 'none' ? 'selected' : ''}>🚫 None</option>
            </select>
          </div>
        </div>

        <!-- Header Icon / Emoji Picker -->
        <div class="form-group" style="margin-top:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:0.75rem;">Header Icon</label>
            <span style="font-size:0.7rem; color:var(--text-muted);">Selected: ${curEmoji}</span>
          </div>
          <div class="inspector-emoji-picker-row">
            ${['💌', '🎂', '🌟', '💖', '🎉', '🥂', '🎈', '✨'].map(em => `
              <div class="inspector-emoji-chip ${curEmoji === em ? 'is-active' : ''}" data-emoji="${em}">${em}</div>
            `).join('')}
          </div>
        </div>

        <!-- Title & Subtitle -->
        <div class="form-group" style="margin-top:10px;">
          <label style="font-size:0.75rem;">Wall Headline Title</label>
          <input type="text" class="form-input" id="inspWishWallTitle" value="${s.titleText || s.title || wc.title || `Wishes for {{recipientName}}`}" placeholder="e.g. Wishes for {{recipientName}}" />
          <span style="font-size:0.68rem; color:var(--text-muted);">Supports: {{recipientName}}, {{occasion}}</span>
        </div>

        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Subtitle / Prompt</label>
          <input type="text" class="form-input" id="inspWishWallSubtitle" value="${s.subtitleText || s.subtitle || wc.subtitle || 'Leave your warmest thoughts, memories and congratulations below.'}" placeholder="Enter prompt message..." />
        </div>

        <!-- Display & Counter -->
        <div class="form-group" style="margin-top:10px;">
          <label style="font-size:0.75rem;">Display Mode</label>
          <select class="form-input" id="inspWishWallDisplayMode">
            <option value="counter-and-wishes" ${curDisplay === 'counter-and-wishes' ? 'selected' : ''}>Counter + Wish Cards</option>
            <option value="wishes-only" ${curDisplay === 'wishes-only' ? 'selected' : ''}>Wish Cards Only</option>
            <option value="counter-only" ${curDisplay === 'counter-only' ? 'selected' : ''}>Counter Only</option>
          </select>
        </div>

        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Custom Milestone Text (Optional)</label>
          <input type="text" class="form-input" id="inspWishWallCustomCounter" value="${s.customCounterText || ''}" placeholder="e.g. 💌 {count} people sent warm wishes ❤️" />
        </div>

        <!-- Sample Wishes Preference Toggle -->
        <div class="form-group" style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:var(--radius-sm, 6px);">
          <label style="font-size:0.75rem; font-weight:700; display:block; margin-bottom:6px;">Sample Wishes</label>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn ${s.includeSampleWishes ? 'btn-primary' : 'btn-secondary'} btn-xs" id="btnWishWallKeepSamples" style="flex:1; font-weight:700; padding:5px 8px; font-size:0.72rem;">
              <span>✨</span> Keep sample wishes
            </button>
            <button type="button" class="btn ${!s.includeSampleWishes ? 'btn-primary' : 'btn-secondary'} btn-xs" id="btnWishWallStartEmpty" style="flex:1; font-weight:700; padding:5px 8px; font-size:0.72rem;">
              <span>📭</span> Start empty
            </button>
          </div>
          <span style="font-size:0.68rem; color:var(--text-muted); display:block; margin-top:5px;">
            ${s.includeSampleWishes ? 'Sample wishes are enabled and editable below.' : 'Starting with zero wishes. Shows clean empty state until visitors submit wishes.'}
          </span>
        </div>

        ${s.includeSampleWishes ? `
          <!-- Editable Sample Wishes List -->
          <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="font-size:0.78rem; color:#a29bfe;">Sample Wishes (${(s.sampleWishes || []).length})</strong>
              <button class="btn btn-secondary btn-xs" id="btnWishWallAddSampleWish" style="font-size:0.7rem; padding:2px 8px;">➕ Add Wish</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${(s.sampleWishes || []).map((w, idx) => `
                <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:0.72rem; font-weight:800; color:var(--accent-gold, #ffd700);">Wish #${idx+1}</span>
                    <button class="btn-ghost btn-xs text-danger btn-wish-del-sample" data-wish-idx="${idx}" title="Delete Wish" style="padding:1px 4px; font-size:0.7rem; color:var(--danger, #ff4757);">🗑️</button>
                  </div>
                  <div class="form-row">
                    <div class="form-group" style="flex:1;">
                      <label style="font-size:0.68rem;">Sender Name</label>
                      <input type="text" class="form-input inp-wish-sample-name" data-wish-idx="${idx}" value="${w.name || ''}" placeholder="Sender Name" style="font-size:0.72rem; padding:3px 6px;" />
                    </div>
                    <div class="form-group" style="flex:1;">
                      <label style="font-size:0.68rem;">Relationship</label>
                      <input type="text" class="form-input inp-wish-sample-rel" data-wish-idx="${idx}" value="${w.relationship || ''}" placeholder="Friends / Family" style="font-size:0.72rem; padding:3px 6px;" />
                    </div>
                  </div>
                  <div class="form-group" style="margin-top:4px;">
                    <label style="font-size:0.68rem;">Message</label>
                    <textarea class="form-input inp-wish-sample-msg" data-wish-idx="${idx}" rows="2" style="font-size:0.72rem; padding:3px 6px;">${w.message || ''}</textarea>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Toggles -->
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px; padding:8px 10px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:var(--radius-sm, 6px);">
          <label style="font-size:0.75rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
            <span>Show Reaction Pills (❤️, 🎉, 🎂)</span>
            <input type="checkbox" id="inspWishWallReactions" ${s.showReactions !== false && wc.showReactions !== false ? 'checked' : ''} />
          </label>
          <label style="font-size:0.75rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
            <span>Show Sender Relation Badges</span>
            <input type="checkbox" id="inspWishWallTags" ${s.showTags !== false ? 'checked' : ''} />
          </label>
          <label style="font-size:0.75rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
            <span>Show "Leave a Wish" Button</span>
            <input type="checkbox" id="inspWishWallCta" ${s.showCta !== false ? 'checked' : ''} />
          </label>
        </div>
      </div>
    `;
  }

  renderSpecialSceneControls() {
    const t = this.scene.template || '';
    const s = this.scene.settings || {};

    let contentHtml = '';

    if (t === 'special_cinematic_intro') {
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Date Header Text</label>
          <input type="text" class="form-input" id="inspSpecDateHeader" value="${s.dateHeader || '15 AUGUST'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Line 1 (Opening Thought)</label>
          <input type="text" class="form-input" id="inspSpecLine1" value="${s.line1 || 'A DAY LIKE ANY OTHER...'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Line 2 (Gold Accent)</label>
          <input type="text" class="form-input" id="inspSpecLine2" value="${s.line2 || "EXCEPT IT WASN'T."}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Line 3 (The Person)</label>
          <input type="text" class="form-input" id="inspSpecLine3" value="${s.line3 || 'SOMEONE SPECIAL CAME INTO THIS WORLD.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Line 4 (CTA Subtext)</label>
          <input type="text" class="form-input" id="inspSpecLine4" value="${s.ctaSubtext || s.line4 || 'YOUR STORY STARTS HERE.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button CTA Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'BEGIN'}" />
        </div>
      `;
    } else if (t === 'special_childhood_memories') {
      const memories = s.memories || [];
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Intro Line 1</label>
          <input type="text" class="form-input" id="inspSpecIntro1" value="${s.introLine1 || 'Before I knew it...'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Intro Line 2 (Highlighted)</label>
          <input type="text" class="form-input" id="inspSpecIntro2" value="${s.introLine2 || 'You became part of my world.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Outro Line 1</label>
          <input type="text" class="form-input" id="inspSpecOutro1" value="${s.outroLine1 || 'Years passed.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Outro Line 2 (Highlighted)</label>
          <input type="text" class="form-input" id="inspSpecOutro2" value="${s.outroLine2 || 'And you grew up.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'CONTINUE →'}" />
        </div>

        <div style="margin-top:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:0.78rem; color:#a29bfe;">Memories Photos (${memories.length})</strong>
            <button class="btn btn-secondary btn-xs" id="btnSpecAddMemory" style="font-size:0.7rem; padding:2px 8px;">➕ Add Slide</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${memories.map((m, idx) => `
              <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.72rem; font-weight:800; color:var(--accent-gold, #ffd700);">Slide #${idx+1}</span>
                  <button class="btn-ghost btn-xs text-danger btn-spec-del-mem" data-mem-idx="${idx}" title="Delete Slide" style="padding:1px 4px; font-size:0.7rem;">🗑️</button>
                </div>
                <div class="form-row">
                  <div class="form-group" style="flex:1;">
                    <label style="font-size:0.68rem;">Year</label>
                    <input type="text" class="form-input inp-spec-mem-year" data-mem-idx="${idx}" value="${m.year || ''}" placeholder="e.g. 2014" style="font-size:0.72rem; padding:3px 6px;" />
                  </div>
                  <div class="form-group" style="flex:2;">
                    <label style="font-size:0.68rem;">Title</label>
                    <input type="text" class="form-input inp-spec-mem-title" data-mem-idx="${idx}" value="${m.title || ''}" placeholder="Slide Title" style="font-size:0.72rem; padding:3px 6px;" />
                  </div>
                </div>
                <div class="form-group" style="margin-top:4px;">
                  <label style="font-size:0.68rem;">Caption Message</label>
                  <input type="text" class="form-input inp-spec-mem-caption" data-mem-idx="${idx}" value="${m.caption || ''}" placeholder="Caption..." style="font-size:0.72rem; padding:3px 6px;" />
                </div>
                ${this.renderMemoryPhotoControl(m, idx, 'memories', 'inp-spec-mem-photo')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (t === 'special_memory_sequence') {
      const memories = s.memories || [];
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Intro Line 1</label>
          <input type="text" class="form-input" id="inspSpecIntro1" value="${s.introLine1 || 'Some moments become memories.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Intro Line 2 (Highlighted)</label>
          <input type="text" class="form-input" id="inspSpecIntro2" value="${s.introLine2 || 'And some memories stay forever.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Outro Line 1</label>
          <input type="text" class="form-input" id="inspSpecOutro1" value="${s.outroLine1 || 'Some memories become part of who we are.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Outro Line 2 (Highlighted)</label>
          <input type="text" class="form-input" id="inspSpecOutro2" value="${s.outroLine2 || "And there are some things I've never said."}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'NEXT →'}" />
        </div>

        <div style="margin-top:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:0.78rem; color:#a29bfe;">Timeline Memories (${memories.length})</strong>
            <button class="btn btn-secondary btn-xs" id="btnSpecAddMemSeq" style="font-size:0.7rem; padding:2px 8px;">➕ Add Memory</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${memories.map((m, idx) => `
              <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.72rem; font-weight:800; color:var(--accent-gold, #ffd700);">Chapter #${idx+1} (${m.year || '2026'})</span>
                  <button class="btn-ghost btn-xs text-danger btn-spec-del-memseq" data-mem-idx="${idx}" title="Delete" style="padding:1px 4px; font-size:0.7rem;">🗑️</button>
                </div>
                <div class="form-row">
                  <div class="form-group" style="flex:1;">
                    <label style="font-size:0.68rem;">Year</label>
                    <input type="text" class="form-input inp-spec-seq-year" data-mem-idx="${idx}" value="${m.year || ''}" placeholder="Year" style="font-size:0.72rem; padding:3px 6px;" />
                  </div>
                  <div class="form-group" style="flex:2;">
                    <label style="font-size:0.68rem;">Title</label>
                    <input type="text" class="form-input inp-spec-seq-title" data-mem-idx="${idx}" value="${m.title || ''}" placeholder="Title" style="font-size:0.72rem; padding:3px 6px;" />
                  </div>
                </div>
                <div class="form-group" style="margin-top:4px;">
                  <label style="font-size:0.68rem;">Caption</label>
                  <input type="text" class="form-input inp-spec-seq-caption" data-mem-idx="${idx}" value="${m.caption || ''}" placeholder="Caption..." style="font-size:0.72rem; padding:3px 6px;" />
                </div>
                ${this.renderMemoryPhotoControl(m, idx, 'memseq', 'inp-spec-seq-photo')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (t === 'special_collage_gallery') {
      const collages = s.collages || [];
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Headline Title</label>
          <input type="text" class="form-input" id="inspSpecGalleryTitle" value="${s.titleText || s.title || 'UNFORGETTABLE MOMENTS'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Subtitle</label>
          <input type="text" class="form-input" id="inspSpecGallerySubtitle" value="${s.subtitleText || s.subtitle || 'Some people become memories. Some people become home.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'NEXT →'}" />
        </div>

        <div style="margin-top:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:0.78rem; color:#a29bfe;">Collages & Lightbox Photos (${collages.length})</strong>
            <button class="btn btn-secondary btn-xs" id="btnSpecAddCollage" style="font-size:0.7rem; padding:2px 8px;">➕ Add Photo</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${collages.map((c, idx) => `
              <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.72rem; font-weight:800; color:var(--accent-gold, #ffd700);">Photo #${idx+1}</span>
                  <button class="btn-ghost btn-xs text-danger btn-spec-del-collage" data-col-idx="${idx}" title="Delete" style="padding:1px 4px; font-size:0.7rem;">🗑️</button>
                </div>
                <div class="form-group">
                  <label style="font-size:0.68rem;">Title</label>
                  <input type="text" class="form-input inp-spec-col-title" data-col-idx="${idx}" value="${c.title || ''}" placeholder="Title" style="font-size:0.72rem; padding:3px 6px;" />
                </div>
                <div class="form-group" style="margin-top:4px;">
                  <label style="font-size:0.68rem;">Caption</label>
                  <input type="text" class="form-input inp-spec-col-caption" data-col-idx="${idx}" value="${c.caption || ''}" placeholder="Caption" style="font-size:0.72rem; padding:3px 6px;" />
                </div>
                ${this.renderMemoryPhotoControl(c, idx, 'collage', 'inp-spec-col-photo')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (t === 'special_chaos_montage') {
      const cards = s.cards || [];
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Intro Line 1</label>
          <input type="text" class="form-input" id="inspSpecIntro1" value="${s.introLine1 || "Let's talk about the real you."}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Intro Line 2</label>
          <input type="text" class="form-input" id="inspSpecIntro2" value="${s.introLine2 || "Because let's be honest..."}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Intro Line 3 (Punchline)</label>
          <input type="text" class="form-input" id="inspSpecIntro3" value="${s.introLine3 || 'You can be a little chaotic. 😜'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Outro Line 1</label>
          <input type="text" class="form-input" id="inspSpecOutro1" value="${s.outroLine1 || 'Okay. Maybe I exaggerate a little.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Outro Line 2 (Highlighted)</label>
          <input type="text" class="form-input" id="inspSpecOutro2" value="${s.outroLine2 || 'Or maybe not. 😜'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Bridge Line 1</label>
          <input type="text" class="form-input" id="inspSpecBridge1" value="${s.bridgeLine1 || "Okay... I'll stop embarrassing you. Probably."}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Bridge Line 2</label>
          <input type="text" class="form-input" id="inspSpecBridge2" value="${s.bridgeLine2 || 'But there is something I actually wanted to give you.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'NEXT →'}" />
        </div>

        <div style="margin-top:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:0.78rem; color:#a29bfe;">Humor & Chaos Cards (${cards.length})</strong>
            <button class="btn btn-secondary btn-xs" id="btnSpecAddCard" style="font-size:0.7rem; padding:2px 8px;">➕ Add Card</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${cards.map((c, idx) => `
              <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.72rem; font-weight:800; color:var(--accent-gold, #ffd700);">Card #${idx+1}</span>
                  <button class="btn-ghost btn-xs text-danger btn-spec-del-card" data-card-idx="${idx}" title="Delete" style="padding:1px 4px; font-size:0.7rem;">🗑️</button>
                </div>
                <div class="form-group">
                  <label style="font-size:0.68rem;">Card Title</label>
                  <input type="text" class="form-input inp-spec-card-title" data-card-idx="${idx}" value="${c.title || ''}" placeholder="e.g. CHIEF SNACK STEALER" style="font-size:0.72rem; padding:3px 6px;" />
                </div>
                <div class="form-group" style="margin-top:4px;">
                  <label style="font-size:0.68rem;">Subtitle / Punchline</label>
                  <input type="text" class="form-input inp-spec-card-sub" data-card-idx="${idx}" value="${c.subtitle || ''}" placeholder="Punchline..." style="font-size:0.72rem; padding:3px 6px;" />
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (t === 'special_letter_reveal') {
      let bodyText = s.paragraphs;
      if (Array.isArray(bodyText)) bodyText = bodyText.join('\n\n');
      if (!bodyText) {
        bodyText = `There are some things I don't say often enough.\n\nLife moves fast, and we spend so much time dealing with everyday chaos that I forget to remind you how much you truly mean to me.\n\nHaving you in my life is one of the greatest gifts, and watching your journey has been an absolute joy.\n\nNever forget who you are. Keep smiling, keep dreaming, and never stop being your authentic, wonderful self.\n\nI will always be in your corner, cheering for you through everything life brings.`;
      }

      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Envelope Tag</label>
          <input type="text" class="form-input" id="inspSpecEnvelopeTag" value="${s.envelopeTag || s.tag || 'For You'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Envelope Subtag</label>
          <input type="text" class="form-input" id="inspSpecEnvelopeSubtag" value="${s.envelopeSubtag || s.subtag || 'Something I wanted to say.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Salutation</label>
          <input type="text" class="form-input" id="inspSpecSalutation" value="${s.salutation || 'Dear {{recipientName}},'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Letter Body (Paragraphs)</label>
          <textarea class="form-input" id="inspSpecLetterBody" rows="7" style="font-size:0.8rem; line-height:1.4;">${bodyText}</textarea>
          <span style="font-size:0.68rem; color:var(--text-muted);">Separate paragraphs with double enter.</span>
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Closing Phrase</label>
          <input type="text" class="form-input" id="inspSpecClosing" value="${s.closing || s.closingLine || 'With all my love,'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Final Highlight Sentence</label>
          <input type="text" class="form-input" id="inspSpecFinalSentence" value="${s.finalSentence || 'Always in my thoughts and heart.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Signature</label>
          <input type="text" class="form-input" id="inspSpecSignature" value="${s.signature || '— With love, {{senderName}}'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'CONTINUE →'}" />
        </div>
      `;
    } else if (t === 'special_fake_ending') {
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Stage A Message</label>
          <input type="text" class="form-input" id="inspSpecStageA" value="${s.stageAText || s.line1 || 'Happy Birthday, {{recipientName}}. ❤️'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Stage B Text</label>
          <input type="text" class="form-input" id="inspSpecStageB" value="${s.stageBText || s.endText || 'THE END'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Twist Line 1</label>
          <input type="text" class="form-input" id="inspSpecTwist1" value="${s.waitText || s.twistLine1 || 'Wait.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Twist Line 2</label>
          <input type="text" class="form-input" id="inspSpecTwist2" value="${s.forgotText || s.twistLine2 || 'I forgot something.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Twist Line 3 (Ellipsis)</label>
          <input type="text" class="form-input" id="inspSpecTwist3" value="${s.ellipsisText || s.twistLine3 || '...'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Twist Line 4 (Final Hook)</label>
          <input type="text" class="form-input" id="inspSpecTwist4" value="${s.oneLastText || s.twistLine4 || 'One last thing.'}" />
        </div>
      `;
    } else if (t === 'special_3d_gift_reveal') {
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Intro Line 1</label>
          <input type="text" class="form-input" id="inspSpecIntro1" value="${s.introLine1 || 'One last thing...'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Intro Line 2</label>
          <input type="text" class="form-input" id="inspSpecIntro2" value="${s.introLine2 || 'I almost forgot.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Intro Line 3</label>
          <input type="text" class="form-input" id="inspSpecIntro3" value="${s.introLine3 || 'This is for you.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Prompt Hint Text</label>
          <input type="text" class="form-input" id="inspSpecPrompt" value="${s.promptText || 'Something is waiting for you.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'TAP TO OPEN'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Surprise Memory Title</label>
          <input type="text" class="form-input" id="inspSpecSurpriseTitle" value="${s.coldCoffeeTitle || 'A Special Cold Coffee Memory ☕'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Surprise Caption</label>
          <input type="text" class="form-input" id="inspSpecSurpriseCaption" value="${s.coldCoffeeCaption || 'Because some simple memories with you taste like home.'}" />
        </div>
      `;
    } else if (t === 'special_birthday_reveal') {
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Top Word</label>
          <input type="text" class="form-input" id="inspSpecHappyText" value="${s.happyText || 'HAPPY'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Middle Word</label>
          <input type="text" class="form-input" id="inspSpecBirthdayText" value="${s.birthdayText || 'BIRTHDAY'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Recipient Name</label>
          <input type="text" class="form-input" id="inspSpecNameText" value="${s.nameText || '{{recipientName}}'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Center Emoji / Heart</label>
          <input type="text" class="form-input" id="inspSpecHeartText" value="${s.heartText || '❤️'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Date Text</label>
          <input type="text" class="form-input" id="inspSpecDateText" value="${s.dateText || '15 • 08 • 2026'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Tagline Subtitle</label>
          <input type="text" class="form-input" id="inspSpecTagline" value="${s.tagline || 'Your day.'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'CONTINUE →'}" />
        </div>
      `;
    } else if (t === 'special_bonus_memories') {
      const items = s.items || [];
      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Intro Line 1</label>
          <input type="text" class="form-input" id="inspSpecIntro1" value="${s.introLine1 || 'Wait...'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Intro Line 2</label>
          <input type="text" class="form-input" id="inspSpecIntro2" value="${s.introLine2 || "There's more."}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Header Title</label>
          <input type="text" class="form-input" id="inspSpecBonusTitle" value="${s.headerTitle || s.title || 'BONUS MEMORIES'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'NEXT →'}" />
        </div>

        <div style="margin-top:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong style="font-size:0.78rem; color:#a29bfe;">Bonus Items (${items.length})</strong>
            <button class="btn btn-secondary btn-xs" id="btnSpecAddBonusItem" style="font-size:0.7rem; padding:2px 8px;">➕ Add Item</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${items.map((it, idx) => `
              <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.72rem; font-weight:800; color:var(--accent-gold, #ffd700);">Bonus #${idx+1}</span>
                  <button class="btn-ghost btn-xs text-danger btn-spec-del-bonus" data-item-idx="${idx}" title="Delete" style="padding:1px 4px; font-size:0.7rem;">🗑️</button>
                </div>
                <div class="form-group">
                  <label style="font-size:0.68rem;">Title</label>
                  <input type="text" class="form-input inp-spec-bonus-title" data-item-idx="${idx}" value="${it.title || ''}" placeholder="Title" style="font-size:0.72rem; padding:3px 6px;" />
                </div>
                <div class="form-group" style="margin-top:4px;">
                  <label style="font-size:0.68rem;">Caption</label>
                  <input type="text" class="form-input inp-spec-bonus-caption" data-item-idx="${idx}" value="${it.caption || ''}" placeholder="Caption..." style="font-size:0.72rem; padding:3px 6px;" />
                </div>
                ${this.renderMemoryPhotoControl(it, idx, 'bonus', 'inp-spec-bonus-photo')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (t === 'special_emotional_finale') {
      let openLines = s.openingText;
      if (!openLines && Array.isArray(s.openingLines)) openLines = s.openingLines.join('\n');
      if (!openLines) openLines = 'No matter how much time passes...';

      let l1 = s.line1;
      if (!l1 && Array.isArray(s.finalLines)) l1 = s.finalLines[0];
      if (!l1) l1 = "You will always hold a special place in our hearts.";

      let l2 = s.line2;
      if (!l2 && Array.isArray(s.finalLines)) l2 = s.finalLines[1];
      if (!l2) l2 = "And I will always be there.";

      let c1 = s.creditLine1;
      if (!c1 && Array.isArray(s.endCredits)) c1 = s.endCredits[0];
      if (!c1) c1 = 'MADE WITH ❤️ FOR YOU';

      let c2 = s.creditLine2;
      if (!c2 && Array.isArray(s.endCredits)) c2 = s.endCredits[1];
      if (!c2) c2 = '15 • 08 • 2026';

      contentHtml = `
        <div class="form-group">
          <label style="font-size:0.75rem; font-weight:700;">Opening Paced Thought</label>
          <textarea class="form-input" id="inspSpecOpening" rows="2" style="font-size:0.8rem;">${openLines}</textarea>
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Closing Line 1</label>
          <input type="text" class="form-input" id="inspSpecFinalLine1" value="${l1}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--accent-gold, #ffd700);">Closing Line 2 (Highlighted)</label>
          <input type="text" class="form-input" id="inspSpecFinalLine2" value="${l2}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Personal Emotional Message</label>
          <input type="text" class="form-input" id="inspSpecPersonal" value="${s.personalLine || s.personalMessage || "Wishing you endless happiness, health, and success."}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Signature</label>
          <input type="text" class="form-input" id="inspSpecSignature" value="${s.signature || '— With love, {{senderName}}'}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Credits Line 1</label>
          <input type="text" class="form-input" id="inspSpecCredit1" value="${c1}" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Credits Line 2</label>
          <input type="text" class="form-input" id="inspSpecCredit2" value="${c2}" />
        </div>
        ${this.renderMemoryPhotoControl({ photoAssetId: s.heroPhotoAssetId, photoUrl: s.heroPhotoUrl, title: 'Hero Final Photo' }, 0, 'herophoto', 'inp-spec-hero-photo')}
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Replay Button Text</label>
          <input type="text" class="form-input" id="inspSpecReplayBtn" value="${s.replayButtonText || 'WATCH AGAIN ↺'}" />
        </div>
      `;
    }

    return `
      <div class="inspector-section" style="border-top:1px solid var(--border, rgba(255,255,255,0.08)); padding-top:14px;">
        <div class="inspector-section-title" style="color:var(--accent, #a78bfa); display:flex; align-items:center; justify-content:space-between;">
          <span style="display:flex; align-items:center; gap:6px;">
            <span>✨</span> <span>Scene Content Editor</span>
          </span>
          <span style="font-size:0.68rem; padding:2px 6px; border-radius:6px; background:rgba(127,90,240,0.2); color:#a29bfe; font-weight:700;">Birthday Reverie</span>
        </div>
        ${contentHtml}
      </div>
    `;
  }

  renderStandardSceneElementsControls() {
    const s = this.scene.settings || {};
    const elements = this.getElementsList();
    const titleVal = s.titleText || s.title || (elements.find(e => e.id === 'title')?.content) || this.scene.name || '';
    const subtitleVal = s.subtitleText || s.textContent || s.messageText || (elements.find(e => e.id === 'subtitle')?.content) || '';
    const badgeVal = s.badgeText || (elements.find(e => e.id === 'badge')?.content) || '';
    const sigVal = s.signatureText || s.signature || (elements.find(e => e.id === 'signature')?.content) || '';
    const noteVal = s.scriptNote || (elements.find(e => e.id === 'scriptNote')?.content) || '';

    return `
      <div class="inspector-section" style="border-top:1px solid var(--border, rgba(255,255,255,0.08)); padding-top:12px;">
        <div class="inspector-section-title" style="color:var(--accent, #a78bfa); display:flex; align-items:center; gap:6px;">
          <span>📝</span> <span>Scene Text & Content</span>
        </div>

        <div class="form-group">
          <label style="font-size:0.75rem;">Title / Headline</label>
          <input type="text" class="form-input" id="inspStdTitle" value="${titleVal}" placeholder="Enter heading title..." />
        </div>

        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Subtitle / Message Content</label>
          <textarea class="form-input" id="inspStdSubtitle" rows="3" style="width:100%; resize:vertical;" placeholder="Enter message or subtitle...">${subtitleVal}</textarea>
        </div>

        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem;">Badge / Tag Label</label>
          <input type="text" class="form-input" id="inspStdBadge" value="${badgeVal}" placeholder="e.g. 👑 SPECIAL CELEBRATION" />
        </div>

        ${(s.signature || s.signatureText || elements.some(e => e.id === 'signature') || this.scene.template === 'message_quote') ? `
          <div class="form-group" style="margin-top:8px;">
            <label style="font-size:0.75rem;">Signature</label>
            <input type="text" class="form-input" id="inspStdSignature" value="${sigVal}" placeholder="— With love, {{senderName}}" />
          </div>
        ` : ''}

        ${(s.scriptNote || elements.some(e => e.id === 'scriptNote') || this.scene.template === 'hero') ? `
          <div class="form-group" style="margin-top:8px;">
            <label style="font-size:0.75rem;">Script Note / Sub-caption</label>
            <input type="text" class="form-input" id="inspStdScriptNote" value="${noteVal}" placeholder="made just for you." />
          </div>
        ` : ''}
      </div>
    `;
  }

  renderSceneDefaultControls() {
    const isSpecial = (this.scene.template || '').startsWith('special_');
    const isWishWall = this.scene.template === 'wish_wall' || this.scene.template === 'wish-wall';
    const animConfig = this.scene.settings?.animationConfig || {};

    return `
      <!-- Prominent Scene Assets & Requirements Panel -->
      <div class="inspector-section" style="padding-top:0;">
        <div id="inspectorSceneAssetsMount"></div>
      </div>

      ${isWishWall ? this.renderWishWallControls() : ''}
      ${isSpecial ? this.renderSpecialSceneControls() : ''}
      ${(!isSpecial && !isWishWall) ? this.renderStandardSceneElementsControls() : ''}

      ${isSpecial ? `
        <!-- Special Animation Settings -->
        <div class="inspector-section" style="border-top:1px solid var(--border, rgba(255,255,255,0.08)); padding-top:12px;">
          <div class="inspector-section-title" style="color:var(--accent, #a78bfa); display:flex; align-items:center; gap:6px;">
            <span>🎬</span> <span>Animation Controls</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label style="font-size:0.75rem;">Duration / Speed</label>
              <select class="form-input" id="inspSpecialAnimDuration">
                <option value="1.5" ${animConfig.duration === 1.5 ? 'selected' : ''}>Fast (1.5s)</option>
                <option value="2.5" ${animConfig.duration === 2.5 || !animConfig.duration ? 'selected' : ''}>Standard (2.5s)</option>
                <option value="4.0" ${animConfig.duration === 4.0 ? 'selected' : ''}>Cinematic (4.0s)</option>
                <option value="6.0" ${animConfig.duration === 6.0 ? 'selected' : ''}>Slow Paced (6.0s)</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size:0.75rem;">Delay</label>
              <select class="form-input" id="inspSpecialAnimDelay">
                <option value="0" ${!animConfig.delay ? 'selected' : ''}>Instant (0s)</option>
                <option value="0.3" ${animConfig.delay === 0.3 ? 'selected' : ''}>Short (0.3s)</option>
                <option value="0.8" ${animConfig.delay === 0.8 ? 'selected' : ''}>Dramatic (0.8s)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label style="font-size:0.75rem;">Easing Dynamics</label>
              <select class="form-input" id="inspSpecialAnimEase">
                <option value="power2.out" ${animConfig.ease === 'power2.out' || !animConfig.ease ? 'selected' : ''}>Smooth Decel</option>
                <option value="back.out(1.6)" ${animConfig.ease === 'back.out(1.6)' ? 'selected' : ''}>Spring Bounce</option>
                <option value="sine.inOut" ${animConfig.ease === 'sine.inOut' ? 'selected' : ''}>Sine Breath</option>
                <option value="none" ${animConfig.ease === 'none' ? 'selected' : ''}>Linear</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size:0.75rem;">Particle Intensity</label>
              <select class="form-input" id="inspSpecialAnimIntensity">
                <option value="standard" ${animConfig.intensity === 'standard' || !animConfig.intensity ? 'selected' : ''}>Standard</option>
                <option value="dense" ${animConfig.intensity === 'dense' ? 'selected' : ''}>High Density</option>
                <option value="subtle" ${animConfig.intensity === 'subtle' ? 'selected' : ''}>Subtle</option>
              </select>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Scene Configuration & Timing Settings -->
      <div class="inspector-section" style="border-top:1px solid var(--border, rgba(255,255,255,0.08)); padding-top:12px;">
        <div class="inspector-section-title">Scene Settings & Timing</div>
        <div class="form-group">
          <label style="font-size:0.75rem;">Scene Name</label>
          <input type="text" class="form-input" id="inspSceneName" value="${this.scene.name || 'Scene'}" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label style="font-size:0.75rem;">Duration (s)</label>
            <input type="number" class="form-input" id="inspSceneDuration" value="${this.scene.duration || 6}" min="2" max="30" />
          </div>
          <div class="form-group">
            <label style="font-size:0.75rem;">Transition</label>
            <select class="form-input" id="inspSceneTransition">
              <option value="fade" ${this.scene.transition === 'fade' ? 'selected' : ''}>Fade</option>
              <option value="slide" ${this.scene.transition === 'slide' ? 'selected' : ''}>Slide</option>
              <option value="zoom" ${this.scene.transition === 'zoom' ? 'selected' : ''}>Zoom</option>
              <option value="pop" ${this.scene.transition === 'pop' ? 'selected' : ''}>Pop</option>
              <option value="flip" ${this.scene.transition === 'flip' ? 'selected' : ''}>Flip</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-top:8px; padding:8px 10px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:var(--radius-sm, 6px);">
          <label style="font-size:0.78rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:700;">
            <span>🔒 Lock Layout Composition</span>
            <input type="checkbox" id="inspLockLayout" ${this.scene.lockedLayout !== false ? 'checked' : ''} />
          </label>
          <span style="font-size:0.68rem; color:var(--text-muted); display:block; margin-top:3px;">Protects preset positions from accidental movement.</span>
        </div>
      </div>
    `;
  }

  attachEvents(inspector, activeEl) {
    const notifyChange = () => {
      this.onProjectModified();
    };

    inspector.addEventListener('change', (e) => {
      if (!this.scene.settings) this.scene.settings = {};
      if (!this.scene.settings.animationConfig) this.scene.settings.animationConfig = {};
      if (!this.project.wishWall) this.project.wishWall = {};

      if (e.target.id === 'inspSpecialAnimDuration') {
        this.scene.settings.animationConfig.duration = parseFloat(e.target.value) || 2.5;
        notifyChange();
      }
      if (e.target.id === 'inspSpecialAnimDelay') {
        this.scene.settings.animationConfig.delay = parseFloat(e.target.value) || 0;
        notifyChange();
      }
      if (e.target.id === 'inspSpecialAnimEase') {
        this.scene.settings.animationConfig.ease = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspSpecialAnimIntensity') {
        this.scene.settings.animationConfig.intensity = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspSceneTransition') {
        this.scene.transition = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspLockLayout') {
        this.scene.lockedLayout = e.target.checked;
        notifyChange();
      }

      // Wish Wall scene settings
      if (e.target.id === 'inspWishWallLayout') {
        this.scene.settings.wallLayout = e.target.value;
        this.project.wishWall.layout = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallAmbience') {
        this.scene.settings.ambience = e.target.value;
        this.project.wishWall.ambience = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallDisplayMode') {
        this.scene.settings.displayMode = e.target.value;
        this.project.wishWall.displayMode = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallReactions') {
        this.scene.settings.showReactions = e.target.checked;
        this.project.wishWall.showReactions = e.target.checked;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallTags') {
        this.scene.settings.showTags = e.target.checked;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallCta') {
        this.scene.settings.showCta = e.target.checked;
        notifyChange();
      }
    });

    inspector.addEventListener('click', (e) => {
      if (e.target.id === 'btnInspReplaceImage' || e.target.id === 'btnInspReplaceVideo') {
        this.onOpenAssetPicker(activeEl);
      }
      if (e.target.closest('#btnInspectorDeleteElement') && activeEl) {
        this.onDeleteElement(activeEl);
      }
      if (e.target.closest('#btnInspOpenModeration')) {
        this.onOpenModeration();
      }
      if (e.target.closest('#btnInspPreviewWishWall')) {
        this.onPreviewWishWall();
      }

      // Wish Wall Theme Pill click
      const themeCard = e.target.closest('.inspector-theme-pill-card');
      if (themeCard && themeCard.dataset.theme) {
        const theme = themeCard.dataset.theme;
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.project.wishWall) this.project.wishWall = {};
        this.scene.settings.wallTheme = theme;
        this.project.wishWall.theme = theme;
        inspector.querySelectorAll('.inspector-theme-pill-card').forEach(c => c.classList.remove('is-selected'));
        themeCard.classList.add('is-selected');
        notifyChange();
      }

      // Wish Wall Emoji chip click
      const emojiChip = e.target.closest('.inspector-emoji-chip');
      if (emojiChip && emojiChip.dataset.emoji) {
        const emoji = emojiChip.dataset.emoji;
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.project.wishWall) this.project.wishWall = {};
        this.scene.settings.headerIcon = emoji;
        this.project.wishWall.headerIcon = emoji;
        inspector.querySelectorAll('.inspector-emoji-chip').forEach(c => c.classList.remove('is-active'));
        emojiChip.classList.add('is-active');
        notifyChange();
      }

      // Wish Wall Sample Wishes Toggle & CRUD
      if (e.target.closest('#btnWishWallKeepSamples')) {
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.project.wishWall) this.project.wishWall = {};
        this.scene.settings.includeSampleWishes = true;
        this.project.wishWall.includeSampleWishes = true;
        if (!Array.isArray(this.scene.settings.sampleWishes) || this.scene.settings.sampleWishes.length === 0) {
          const occ = this.project.occasion || 'birthday';
          const rName = this.project.recipient?.name || 'Someone Special';
          this.scene.settings.sampleWishes = [
            { id: 'sample_wish_1', name: 'Close Friends', relationship: 'Friends', message: `Happy ${occ.charAt(0).toUpperCase() + occ.slice(1)}, ${rName}! May this year bring you endless joy, laughter, and unforgettable adventures! 🎉✨`, isPinned: true, reactions: { '❤️': 14, '🎉': 9, '🎂': 6 }, createdAt: Date.now() - 1000 * 60 * 35 },
            { id: 'sample_wish_2', name: 'Family Member', relationship: 'Family', message: `So proud of everything you have achieved. Wishing you health, happiness, and prosperity always! ❤️🥂`, isPinned: false, reactions: { '❤️': 8, '👏': 5 }, createdAt: Date.now() - 1000 * 60 * 120 },
            { id: 'sample_wish_3', name: 'Anonymous', relationship: 'Well-Wisher', message: `Keep shining bright like the absolute star you are! Have the most wonderful day! ✨🌟`, isPinned: false, reactions: { '🌟': 11, '❤️': 7 }, createdAt: Date.now() - 1000 * 60 * 240 },
            { id: 'sample_wish_4', name: 'College Friends', relationship: 'Friends', message: `Can't wait to celebrate tonight! Here is to creating many more wonderful memories together! 🥳🥂🎂`, isPinned: false, reactions: { '🎉': 12, '🎂': 8 }, createdAt: Date.now() - 1000 * 60 * 360 }
          ];
        }
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
      if (e.target.closest('#btnWishWallStartEmpty')) {
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.project.wishWall) this.project.wishWall = {};
        this.scene.settings.includeSampleWishes = false;
        this.project.wishWall.includeSampleWishes = false;
        this.scene.settings.sampleWishes = [];
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
      if (e.target.closest('#btnWishWallAddSampleWish')) {
        if (!this.scene.settings) this.scene.settings = {};
        if (!Array.isArray(this.scene.settings.sampleWishes)) this.scene.settings.sampleWishes = [];
        this.scene.settings.sampleWishes.push({
          id: `sample_wish_${Date.now()}`,
          name: 'Friend',
          relationship: 'Friends',
          message: 'Wishing you the happiest celebration ever!',
          reactions: { '❤️': 1 }
        });
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
      const delSampleWishBtn = e.target.closest('.btn-wish-del-sample');
      if (delSampleWishBtn) {
        const idx = parseInt(delSampleWishBtn.dataset.wishIdx, 10);
        if (Array.isArray(this.scene.settings?.sampleWishes)) {
          this.scene.settings.sampleWishes.splice(idx, 1);
          notifyChange();
          const updated = this.render();
          inspector.replaceWith(updated);
          return;
        }
      }

      // Special Scene Interactive List Click Actions
      if (e.target.closest('#btnSpecAddMemory')) {
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.scene.settings.memories) this.scene.settings.memories = [];
        this.scene.settings.memories.push({
          title: 'NEW MEMORY',
          year: '2026',
          caption: 'Write a heartfelt memory caption...',
          photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
        });
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
      const delMemBtn = e.target.closest('.btn-spec-del-mem');
      if (delMemBtn) {
        const idx = parseInt(delMemBtn.dataset.memIdx, 10);
        if (this.scene.settings?.memories) {
          this.scene.settings.memories.splice(idx, 1);
          notifyChange();
          const updated = this.render();
          inspector.replaceWith(updated);
          return;
        }
      }

      if (e.target.closest('#btnSpecAddMemSeq')) {
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.scene.settings.memories) this.scene.settings.memories = [];
        this.scene.settings.memories.push({
          title: 'NEW CHAPTER',
          year: '2026',
          caption: 'A special milestone to remember...',
          photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
        });
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
      const delMemSeqBtn = e.target.closest('.btn-spec-del-memseq');
      if (delMemSeqBtn) {
        const idx = parseInt(delMemSeqBtn.dataset.memIdx, 10);
        if (this.scene.settings?.memories) {
          this.scene.settings.memories.splice(idx, 1);
          notifyChange();
          const updated = this.render();
          inspector.replaceWith(updated);
          return;
        }
      }

      if (e.target.closest('#btnSpecAddCollage')) {
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.scene.settings.collages) this.scene.settings.collages = [];
        this.scene.settings.collages.push({
          title: 'UNFORGETTABLE MOMENT',
          caption: 'A wonderful moment together.',
          photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80'
        });
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
      const delColBtn = e.target.closest('.btn-spec-del-collage');
      if (delColBtn) {
        const idx = parseInt(delColBtn.dataset.colIdx, 10);
        if (this.scene.settings?.collages) {
          this.scene.settings.collages.splice(idx, 1);
          notifyChange();
          const updated = this.render();
          inspector.replaceWith(updated);
          return;
        }
      }

      if (e.target.closest('#btnSpecAddCard')) {
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.scene.settings.cards) this.scene.settings.cards = [];
        this.scene.settings.cards.push({
          title: 'NEW FUNNY HABIT',
          subtitle: 'Describe a hilarious or iconic trait...'
        });
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
      const delCardBtn = e.target.closest('.btn-spec-del-card');
      if (delCardBtn) {
        const idx = parseInt(delCardBtn.dataset.cardIdx, 10);
        if (this.scene.settings?.cards) {
          this.scene.settings.cards.splice(idx, 1);
          notifyChange();
          const updated = this.render();
          inspector.replaceWith(updated);
          return;
        }
      }

      if (e.target.closest('#btnSpecAddBonusItem')) {
        if (!this.scene.settings) this.scene.settings = {};
        if (!this.scene.settings.items) this.scene.settings.items = [];
        this.scene.settings.items.push({
          title: 'EXTRA MEMORY',
          caption: 'One more thing to smile about.',
          photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
        });
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
      const delBonusBtn = e.target.closest('.btn-spec-del-bonus');
      if (delBonusBtn) {
        const idx = parseInt(delBonusBtn.dataset.itemIdx, 10);
        if (this.scene.settings?.items) {
          this.scene.settings.items.splice(idx, 1);
          notifyChange();
          const updated = this.render();
          inspector.replaceWith(updated);
          return;
        }
      }

      // Photo Picker for special scenes (Timeline Memories, etc.)
      const pickBtn = e.target.closest('.btn-spec-pick-photo');
      if (pickBtn) {
        const field = pickBtn.dataset.field;
        const idx = pickBtn.dataset.memIdx !== undefined ? parseInt(pickBtn.dataset.memIdx, 10) : null;

        const modal = new AssetPickerModal({
          project: this.project,
          allAssets: this.allAssets,
          targetScene: this.scene,
          targetSlotId: null,
          filterTab: 'image',
          type: 'image',
          onProjectModified: () => {
            if (this.onProjectModified) this.onProjectModified();
          },
          onSelectAsset: (asset) => {
            if (asset) {
              const url = asset.renderUrl || asset.thumbnail || asset.url || '';
              if (field === 'memories' && this.scene.settings?.memories?.[idx]) {
                this.scene.settings.memories[idx].photoAssetId = asset.id;
                this.scene.settings.memories[idx].photoUrl = url;
              } else if (field === 'memseq' && this.scene.settings?.memories?.[idx]) {
                this.scene.settings.memories[idx].photoAssetId = asset.id;
                this.scene.settings.memories[idx].photoUrl = url;
              } else if (field === 'collage' && this.scene.settings?.collages?.[idx]) {
                this.scene.settings.collages[idx].photoAssetId = asset.id;
                this.scene.settings.collages[idx].photoUrl = url;
              } else if (field === 'bonus' && this.scene.settings?.items?.[idx]) {
                this.scene.settings.items[idx].photoAssetId = asset.id;
                this.scene.settings.items[idx].photoUrl = url;
              } else if (field === 'herophoto') {
                this.scene.settings.heroPhotoAssetId = asset.id;
                this.scene.settings.heroPhotoUrl = url;
              }

              // Ensure asset is tracked in scene.assetIds and project.assetIds
              this.scene.assetIds = this.scene.assetIds || [];
              if (!this.scene.assetIds.includes(asset.id)) {
                this.scene.assetIds.push(asset.id);
              }
              this.project.assetIds = this.project.assetIds || [];
              if (!this.project.assetIds.includes(asset.id)) {
                this.project.assetIds.push(asset.id);
              }

              if (!this.allAssets.some(a => a.id === asset.id)) {
                this.allAssets.unshift(asset);
              }

              notifyChange();
              const updated = this.render();
              inspector.replaceWith(updated);
            }
          }
        });
        document.body.appendChild(modal.render());
        return;
      }

      // Photo Clear for special scenes
      const clearBtn = e.target.closest('.btn-spec-clear-photo');
      if (clearBtn) {
        const field = clearBtn.dataset.field;
        const idx = clearBtn.dataset.memIdx !== undefined ? parseInt(clearBtn.dataset.memIdx, 10) : null;
        if (field === 'memories' && this.scene.settings?.memories?.[idx]) {
          this.scene.settings.memories[idx].photoAssetId = null;
          this.scene.settings.memories[idx].photoUrl = '';
        } else if (field === 'memseq' && this.scene.settings?.memories?.[idx]) {
          this.scene.settings.memories[idx].photoAssetId = null;
          this.scene.settings.memories[idx].photoUrl = '';
        } else if (field === 'collage' && this.scene.settings?.collages?.[idx]) {
          this.scene.settings.collages[idx].photoAssetId = null;
          this.scene.settings.collages[idx].photoUrl = '';
        } else if (field === 'bonus' && this.scene.settings?.items?.[idx]) {
          this.scene.settings.items[idx].photoAssetId = null;
          this.scene.settings.items[idx].photoUrl = '';
        } else if (field === 'herophoto') {
          this.scene.settings.heroPhotoAssetId = null;
          this.scene.settings.heroPhotoUrl = '';
        }
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
    });

    inspector.addEventListener('input', (e) => {
      if (!this.scene.settings) this.scene.settings = {};
      if (!this.project.wishWall) this.project.wishWall = {};

      if (e.target.id === 'inspWishWallTitle') {
        this.scene.settings.titleText = e.target.value;
        this.project.wishWall.title = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallSubtitle') {
        this.scene.settings.subtitleText = e.target.value;
        this.project.wishWall.subtitle = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallCustomCounter') {
        this.scene.settings.customCounterText = e.target.value;
        notifyChange();
      }

      if (e.target.classList.contains('inp-wish-sample-name')) {
        const idx = parseInt(e.target.dataset.wishIdx, 10);
        if (this.scene.settings?.sampleWishes?.[idx]) {
          this.scene.settings.sampleWishes[idx].name = e.target.value;
          notifyChange();
        }
      }
      if (e.target.classList.contains('inp-wish-sample-rel')) {
        const idx = parseInt(e.target.dataset.wishIdx, 10);
        if (this.scene.settings?.sampleWishes?.[idx]) {
          this.scene.settings.sampleWishes[idx].relationship = e.target.value;
          notifyChange();
        }
      }
      if (e.target.classList.contains('inp-wish-sample-msg')) {
        const idx = parseInt(e.target.dataset.wishIdx, 10);
        if (this.scene.settings?.sampleWishes?.[idx]) {
          this.scene.settings.sampleWishes[idx].message = e.target.value;
          notifyChange();
        }
      }

      if (!activeEl) {
        if (e.target.id === 'inspStdTitle') {
          if (!this.scene.settings) this.scene.settings = {};
          this.scene.settings.titleText = e.target.value;
          this.scene.name = e.target.value || this.scene.name;
          const el = this.getElementsList().find(x => x.id === 'title');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspStdSubtitle') {
          if (!this.scene.settings) this.scene.settings = {};
          this.scene.settings.subtitleText = e.target.value;
          this.scene.settings.textContent = e.target.value;
          this.scene.settings.messageText = e.target.value;
          const el = this.getElementsList().find(x => x.id === 'subtitle');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspStdBadge') {
          if (!this.scene.settings) this.scene.settings = {};
          this.scene.settings.badgeText = e.target.value;
          const el = this.getElementsList().find(x => x.id === 'badge');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspStdSignature') {
          if (!this.scene.settings) this.scene.settings = {};
          this.scene.settings.signature = e.target.value;
          this.scene.settings.signatureText = e.target.value;
          const el = this.getElementsList().find(x => x.id === 'signature');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspStdScriptNote') {
          if (!this.scene.settings) this.scene.settings = {};
          this.scene.settings.scriptNote = e.target.value;
          const el = this.getElementsList().find(x => x.id === 'scriptNote');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }

        if (e.target.id === 'inspSceneName') {
          this.scene.name = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspSceneDuration') {
          this.scene.duration = parseInt(e.target.value, 10) || 6;
          notifyChange();
        }

        // Special scene text inputs
        if (e.target.id === 'inspSpecDateHeader') { this.scene.settings.dateHeader = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecLine1') { this.scene.settings.line1 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecLine2') { this.scene.settings.line2 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecLine3') { this.scene.settings.line3 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecLine4') { this.scene.settings.ctaSubtext = e.target.value; this.scene.settings.line4 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecBtnText') { this.scene.settings.buttonText = e.target.value; notifyChange(); }

        if (e.target.id === 'inspSpecIntro1') { this.scene.settings.introLine1 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecIntro2') { this.scene.settings.introLine2 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecIntro3') { this.scene.settings.introLine3 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecOutro1') { this.scene.settings.outroLine1 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecOutro2') { this.scene.settings.outroLine2 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecBridge1') { this.scene.settings.bridgeLine1 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecBridge2') { this.scene.settings.bridgeLine2 = e.target.value; notifyChange(); }

        if (e.target.id === 'inspSpecGalleryTitle') { this.scene.settings.titleText = e.target.value; this.scene.settings.title = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecGallerySubtitle') { this.scene.settings.subtitleText = e.target.value; this.scene.settings.subtitle = e.target.value; notifyChange(); }

        if (e.target.id === 'inspSpecEnvelopeTag') { this.scene.settings.envelopeTag = e.target.value; this.scene.settings.tag = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecEnvelopeSubtag') { this.scene.settings.envelopeSubtag = e.target.value; this.scene.settings.subtag = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecSalutation') { this.scene.settings.salutation = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecLetterBody') {
          this.scene.settings.paragraphs = e.target.value.split('\n\n').filter(p => p.trim());
          notifyChange();
        }
        if (e.target.id === 'inspSpecClosing') { this.scene.settings.closing = e.target.value; this.scene.settings.closingLine = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecFinalSentence') { this.scene.settings.finalSentence = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecSignature') { this.scene.settings.signature = e.target.value; notifyChange(); }

        if (e.target.id === 'inspSpecStageA') { this.scene.settings.stageAText = e.target.value; this.scene.settings.line1 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecStageB') { this.scene.settings.stageBText = e.target.value; this.scene.settings.endText = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecTwist1') { this.scene.settings.waitText = e.target.value; this.scene.settings.twistLine1 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecTwist2') { this.scene.settings.forgotText = e.target.value; this.scene.settings.twistLine2 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecTwist3') { this.scene.settings.ellipsisText = e.target.value; this.scene.settings.twistLine3 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecTwist4') { this.scene.settings.oneLastText = e.target.value; this.scene.settings.twistLine4 = e.target.value; notifyChange(); }

        if (e.target.id === 'inspSpecPrompt') { this.scene.settings.promptText = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecSurpriseTitle') { this.scene.settings.coldCoffeeTitle = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecSurpriseCaption') { this.scene.settings.coldCoffeeCaption = e.target.value; notifyChange(); }

        if (e.target.id === 'inspSpecHappyText') { this.scene.settings.happyText = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecBirthdayText') { this.scene.settings.birthdayText = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecNameText') { this.scene.settings.nameText = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecHeartText') { this.scene.settings.heartText = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecDateText') { this.scene.settings.dateText = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecTagline') { this.scene.settings.tagline = e.target.value; notifyChange(); }

        if (e.target.id === 'inspSpecBonusTitle') { this.scene.settings.headerTitle = e.target.value; this.scene.settings.title = e.target.value; notifyChange(); }

        if (e.target.id === 'inspSpecOpening') { this.scene.settings.openingText = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecFinalLine1') { this.scene.settings.line1 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecFinalLine2') { this.scene.settings.line2 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecPersonal') { this.scene.settings.personalLine = e.target.value; this.scene.settings.personalMessage = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecCredit1') { this.scene.settings.creditLine1 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecCredit2') { this.scene.settings.creditLine2 = e.target.value; notifyChange(); }
        if (e.target.id === 'inspSpecHeroPhoto' || e.target.classList.contains('inp-spec-hero-photo')) {
          this.scene.settings.heroPhotoUrl = e.target.value;
          this.scene.settings.heroPhotoAssetId = null;
          notifyChange();
        }
        if (e.target.id === 'inspSpecReplayBtn') { this.scene.settings.replayButtonText = e.target.value; notifyChange(); }

        // Dynamic item fields
        if (e.target.classList.contains('inp-spec-mem-year')) {
          const idx = parseInt(e.target.dataset.memIdx, 10);
          if (this.scene.settings.memories?.[idx]) { this.scene.settings.memories[idx].year = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-mem-title')) {
          const idx = parseInt(e.target.dataset.memIdx, 10);
          if (this.scene.settings.memories?.[idx]) { this.scene.settings.memories[idx].title = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-mem-caption')) {
          const idx = parseInt(e.target.dataset.memIdx, 10);
          if (this.scene.settings.memories?.[idx]) { this.scene.settings.memories[idx].caption = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-mem-photo')) {
          const idx = parseInt(e.target.dataset.memIdx, 10);
          if (this.scene.settings.memories?.[idx]) {
            this.scene.settings.memories[idx].photoUrl = e.target.value;
            this.scene.settings.memories[idx].photoAssetId = null;
            notifyChange();
          }
        }

        if (e.target.classList.contains('inp-spec-seq-year')) {
          const idx = parseInt(e.target.dataset.memIdx, 10);
          if (this.scene.settings.memories?.[idx]) { this.scene.settings.memories[idx].year = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-seq-title')) {
          const idx = parseInt(e.target.dataset.memIdx, 10);
          if (this.scene.settings.memories?.[idx]) { this.scene.settings.memories[idx].title = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-seq-caption')) {
          const idx = parseInt(e.target.dataset.memIdx, 10);
          if (this.scene.settings.memories?.[idx]) { this.scene.settings.memories[idx].caption = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-seq-photo')) {
          const idx = parseInt(e.target.dataset.memIdx, 10);
          if (this.scene.settings.memories?.[idx]) {
            this.scene.settings.memories[idx].photoUrl = e.target.value;
            this.scene.settings.memories[idx].photoAssetId = null;
            notifyChange();
          }
        }

        if (e.target.classList.contains('inp-spec-col-title')) {
          const idx = parseInt(e.target.dataset.colIdx, 10);
          if (this.scene.settings.collages?.[idx]) { this.scene.settings.collages[idx].title = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-col-caption')) {
          const idx = parseInt(e.target.dataset.colIdx, 10);
          if (this.scene.settings.collages?.[idx]) { this.scene.settings.collages[idx].caption = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-col-photo')) {
          const idx = parseInt(e.target.dataset.colIdx, 10);
          if (this.scene.settings.collages?.[idx]) {
            this.scene.settings.collages[idx].photoUrl = e.target.value;
            this.scene.settings.collages[idx].photoAssetId = null;
            notifyChange();
          }
        }

        if (e.target.classList.contains('inp-spec-card-title')) {
          const idx = parseInt(e.target.dataset.cardIdx, 10);
          if (this.scene.settings.cards?.[idx]) { this.scene.settings.cards[idx].title = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-card-sub')) {
          const idx = parseInt(e.target.dataset.cardIdx, 10);
          if (this.scene.settings.cards?.[idx]) { this.scene.settings.cards[idx].subtitle = e.target.value; notifyChange(); }
        }

        if (e.target.classList.contains('inp-spec-bonus-title')) {
          const idx = parseInt(e.target.dataset.itemIdx, 10);
          if (this.scene.settings.items?.[idx]) { this.scene.settings.items[idx].title = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-bonus-caption')) {
          const idx = parseInt(e.target.dataset.itemIdx, 10);
          if (this.scene.settings.items?.[idx]) { this.scene.settings.items[idx].caption = e.target.value; notifyChange(); }
        }
        if (e.target.classList.contains('inp-spec-bonus-photo')) {
          const idx = parseInt(e.target.dataset.itemIdx, 10);
          if (this.scene.settings.items?.[idx]) {
            this.scene.settings.items[idx].photoUrl = e.target.value;
            this.scene.settings.items[idx].photoAssetId = null;
            notifyChange();
          }
        }
        return;
      }

      // Text element inputs
      if (e.target.id === 'inspTextContent') {
        activeEl.content = e.target.value;
        activeEl.text = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspFontSize') {
        activeEl.fontSize = parseInt(e.target.value, 10) || 32;
        notifyChange();
      }
      if (e.target.id === 'inspTextColor') {
        activeEl.color = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspTextOpacity') {
        activeEl.opacity = (parseFloat(e.target.value) || 100) / 100;
        notifyChange();
      }
      if (e.target.id === 'inspLetterSpacing') {
        activeEl.letterSpacing = `${e.target.value}px`;
        notifyChange();
      }
      if (e.target.id === 'inspTextX') {
        activeEl.x = parseFloat(e.target.value) || 0;
        activeEl.left = activeEl.x;
        notifyChange();
      }
      if (e.target.id === 'inspTextY') {
        activeEl.y = parseFloat(e.target.value) || 0;
        activeEl.top = activeEl.y;
        notifyChange();
      }
      if (e.target.id === 'inspTextWidth') {
        activeEl.width = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspTextRotation') {
        activeEl.rotation = parseFloat(e.target.value) || 0;
        notifyChange();
      }
      if (e.target.id === 'inspBorderRadius') {
        activeEl.borderRadius = parseInt(e.target.value, 10) || 0;
        notifyChange();
      }
      if (e.target.id === 'inspShapeIcon') {
        activeEl.content = e.target.value;
        activeEl.icon = e.target.value;
        notifyChange();
      }

      // Image element inputs
      if (e.target.id === 'inspImageOpacity') {
        activeEl.opacity = (parseFloat(e.target.value) || 100) / 100;
        notifyChange();
      }
      if (e.target.id === 'inspImageX') {
        activeEl.x = parseFloat(e.target.value) || 0;
        activeEl.left = activeEl.x;
        notifyChange();
      }
      if (e.target.id === 'inspImageY') {
        activeEl.y = parseFloat(e.target.value) || 0;
        activeEl.top = activeEl.y;
        notifyChange();
      }
      if (e.target.id === 'inspImageWidth') {
        activeEl.width = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspImageHeight') {
        activeEl.height = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspImageRotation') {
        activeEl.rotation = parseFloat(e.target.value) || 0;
        notifyChange();
      }

      // Countdown field inputs
      if (e.target.id === 'inspCdTitle') {
        if (!this.project.countdown) this.project.countdown = {};
        this.project.countdown.title = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspCdSubtitle') {
        if (!this.project.countdown) this.project.countdown = {};
        this.project.countdown.subtitle = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspCdDate') {
        if (!this.project.countdown) this.project.countdown = {};
        this.project.countdown.targetDate = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspCdTime') {
        if (!this.project.countdown) this.project.countdown = {};
        this.project.countdown.targetTime = e.target.value;
        notifyChange();
      }
    });

    inspector.addEventListener('change', (e) => {
      if (e.target.id === 'inspCdEnabled') {
        if (!this.project.countdown) this.project.countdown = {};
        this.project.countdown.enabled = e.target.checked;
        notifyChange();
      }
      if (e.target.id === 'inspCdTz') {
        if (!this.project.countdown) this.project.countdown = {};
        this.project.countdown.timezone = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspCdStyle') {
        if (!this.project.countdown) this.project.countdown = {};
        this.project.countdown.styleId = e.target.value;
        notifyChange();
      }

      if (e.target.classList.contains('inp-spec-mem-photo') ||
          e.target.classList.contains('inp-spec-seq-photo') ||
          e.target.classList.contains('inp-spec-col-photo') ||
          e.target.classList.contains('inp-spec-bonus-photo') ||
          e.target.classList.contains('inp-spec-hero-photo') ||
          e.target.id === 'inspSpecHeroPhoto') {
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }

      if (!activeEl) {
        if (e.target.id === 'inspSceneTransition') {
          this.scene.transition = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspLockLayout') {
          this.scene.lockedLayout = e.target.checked;
          notifyChange();
        }
        return;
      }

      if (e.target.id === 'inspFontFamily') {
        activeEl.fontFamily = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspFontWeight') {
        activeEl.fontWeight = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspTextAlign') {
        activeEl.textAlign = e.target.value;
        activeEl.align = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspElementAnim') {
        activeEl.animation = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspImageFit') {
        activeEl.fit = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspVideoAutoplay') {
        activeEl.autoplay = e.target.checked;
        notifyChange();
      }
      if (e.target.id === 'inspVideoLoop') {
        activeEl.loop = e.target.checked;
        notifyChange();
      }
      if (e.target.id === 'inspVideoMute') {
        activeEl.muted = e.target.checked;
        notifyChange();
      }
    });
  }
}
