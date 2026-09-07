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
import { getOrCreateTextElements, updateTextElement } from '../../templates/TextElementHelper.js';
import { AssetPickerModal } from '../AssetPickerModal.js';
import { SAMPLE_ASSETS } from '../../data/SampleData.js';
import { resolveGiftContent } from '../../animations/SpecialAnimationEngine.js';

export class SmartInspectorView {
  constructor(options = {}) {
    this.project = options.project || { scenes: [] };
    this.activeSceneId = options.activeSceneId || (options.scene && options.scene.id) || null;
    this.selectedElementId = options.selectedElementId || null;
    this.selectedElementSceneId = options.selectedElementSceneId || (this.selectedElementId ? this.activeSceneId : null);
    this._initialScene = (options.scene && options.scene.id === this.activeSceneId) ? options.scene : null;
    this.allAssets = options.allAssets || [];
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onSelectElement = options.onSelectElement || (() => {});
    this.onOpenAssetPicker = options.onOpenAssetPicker || (() => {});
    this.onDeleteElement = options.onDeleteElement || (() => {});
    this.onOpenModeration = options.onOpenModeration || (() => {});
    this.onPreviewWishWall = options.onPreviewWishWall || (() => {});
    this.onQuickAddElement = options.onQuickAddElement || (() => {});
  }

  get scene() {
    const sceneId = this.selectedElementId ? this.selectedElementSceneId : this.activeSceneId;
    return (sceneId && this.project?.scenes?.find(s => s.id === sceneId)) || this._initialScene || null;
  }

  set scene(val) {
    this._initialScene = val;
    if (val && val.id) {
      if (this.selectedElementId) {
        this.selectedElementSceneId = val.id;
      } else {
        this.activeSceneId = val.id;
      }
    }
  }

  get selectedSceneId() {
    return this.activeSceneId;
  }

  set selectedSceneId(val) {
    this.activeSceneId = val;
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

  renderGiftBoxControl(scene) {
    const gift = resolveGiftContent(scene, this.project, this.allAssets);
    const hasMedia = gift.hasContent && Boolean(gift.url);
    const isVideo = gift.contentType === 'video';

    let mediaName = 'Attached Gift Media';
    if (gift.assetId) {
      const asset = (this.allAssets || []).find(a => a.id === gift.assetId);
      if (asset?.name) mediaName = asset.name;
    } else if (gift.url) {
      try {
        const u = new URL(gift.url);
        const p = u.pathname.split('/').filter(Boolean);
        if (p.length > 0) mediaName = p[p.length - 1];
      } catch (e) {
        mediaName = gift.url.length > 25 ? gift.url.substring(0, 22) + '...' : gift.url;
      }
    }

    return `
      <div style="background:var(--surface-elevated, #161328); border:1px solid rgba(226, 190, 122, 0.4); border-radius:10px; padding:12px; margin-top:12px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:0.78rem; font-weight:800; color:var(--accent-gold, #ffd700); display:flex; align-items:center; gap:6px;">
            <span>🎁</span> <span>GIFT CONTENT (Revealed on Open)</span>
          </span>
          <span class="badge" style="font-size:0.65rem; font-weight:700; padding:2px 6px; border-radius:4px; ${hasMedia ? (isVideo ? 'background:rgba(59,130,246,0.2); color:#60a5fa; border:1px solid rgba(59,130,246,0.4);' : 'background:rgba(44,182,125,0.2); color:#2cb67d; border:1px solid rgba(44,182,125,0.4);') : 'background:rgba(255,255,255,0.08); color:var(--text-muted);'}">
            ${hasMedia ? (isVideo ? '🎬 VIDEO ATTACHED' : '🖼️ IMAGE ATTACHED') : '⚪ NO GIFT ATTACHED'}
          </span>
        </div>

        ${hasMedia ? `
          <!-- Preview of Attached Content -->
          <div style="position:relative; width:100%; border-radius:8px; overflow:hidden; background:#000; margin-bottom:8px; border:1px solid rgba(255,255,255,0.1); max-height:150px; display:flex; align-items:center; justify-content:center;">
            ${isVideo ? `
              <video src="${gift.url}" controls playsinline style="max-height:140px; max-width:100%; object-fit:contain; display:block;"></video>
            ` : `
              <img src="${gift.url}" alt="${mediaName}" style="max-height:140px; max-width:100%; object-fit:contain; display:block;" />
            `}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:0.72rem; color:var(--text-muted);">
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;" title="${mediaName}">📎 ${mediaName}</span>
            <span style="font-weight:700; color:var(--accent-gold);">${(gift.contentType || 'MEDIA').toUpperCase()}</span>
          </div>

          <!-- Action Buttons -->
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-xs btn-spec-pick-gift-image" title="Replace with Image" style="flex:1; min-height:28px; font-size:0.72rem;">
              🖼️ Replace Image
            </button>
            <button class="btn btn-secondary btn-xs btn-spec-pick-gift-video" title="Replace with Video" style="flex:1; min-height:28px; font-size:0.72rem;">
              🎬 Replace Video
            </button>
            <button class="btn btn-ghost btn-xs btn-danger btn-spec-clear-gift" title="Remove Gift Content" style="min-height:28px; padding:0 8px;">
              🗑️
            </button>
          </div>
        ` : `
          <!-- Empty State & Selection Buttons -->
          <p style="font-size:0.74rem; color:var(--text-muted); margin:0 0 10px 0; line-height:1.4;">
            Attach exactly one image or video to be unboxed inside the 3D gift box. If empty, a graceful surprise card is shown.
          </p>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-primary btn-xs btn-spec-pick-gift-image" style="flex:1; min-height:30px; font-weight:700; font-size:0.74rem;">
              🖼️ Attach Image
            </button>
            <button class="btn btn-secondary btn-xs btn-spec-pick-gift-video" style="flex:1; min-height:30px; font-weight:700; font-size:0.74rem;">
              🎬 Attach Video
            </button>
          </div>
        `}
      </div>
    `;
  }

  setSelectedElementId(id) {
    this.selectedElementId = id;
  }

  isLayoutLocked(scene) {
    const sc = scene || this.currentRenderScene || (this.activeSceneId && this.project?.scenes?.find(s => s.id === this.activeSceneId)) || this.scene;
    return sc?.lockedLayout !== false;
  }

  resolveSelectedElement() {
    const sceneId = this.selectedElementId ? this.selectedElementSceneId : this.activeSceneId;
    if (!sceneId) return { scene: null, element: null };
    const targetScene = (this.project?.scenes?.find(s => s.id === sceneId)) || (this._initialScene && this._initialScene.id === sceneId ? this._initialScene : null);
    if (!targetScene) return { scene: null, element: null };

    if (this.selectedElementId) {
      const elements = this.getElementsList(targetScene);
      let element = elements.find(e => e.id === this.selectedElementId) || null;
      if (!element) {
        const s = targetScene.settings || {};
        const slots = targetScene.slots || {};
        if (this.selectedElementId === 'photo' || this.selectedElementId === 'reveal-photo' || this.selectedElementId === 'hero_image' || this.selectedElementId === 'hero_photo' || this.selectedElementId?.startsWith('gallery-img') || this.selectedElementId?.startsWith('collage-item')) {
          element = {
            id: this.selectedElementId,
            type: 'image',
            name: 'Scene Photo',
            assetId: s.heroPhotoAssetId || s.photoAssetId || slots.reveal_photo || slots.hero_image,
            url: s.revealPhotoUrl || s.heroPhotoUrl || s.photoUrl || '',
            fit: s.imageFit || 'cover'
          };
        } else if (this.selectedElementId === 'video' || this.selectedElementId === 'main_video') {
          element = {
            id: this.selectedElementId,
            type: 'video',
            name: 'Scene Video',
            assetId: s.videoAssetId || slots.main_video || slots.video,
            url: s.videoUrl || '',
            autoplay: s.autoplay !== false
          };
        }
      }
      return { scene: targetScene, element: element || null };
    }

    return { scene: targetScene, element: null };
  }

  getElementsList(targetScene) {
    const sc = targetScene || (this.activeSceneId && this.project?.scenes?.find(s => s.id === this.activeSceneId)) || (this.scene && this.scene.id === this.activeSceneId ? this.scene : null);
    if (!sc) return [];
    if (Array.isArray(sc.elements) && sc.elements.length > 0) {
      return sc.elements;
    }
    if (Array.isArray(sc.textElements) && sc.textElements.length > 0) {
      sc.elements = sc.textElements;
      return sc.elements;
    }
    const defaultTexts = getOrCreateTextElements(sc);
    sc.elements = defaultTexts;
    return sc.elements;
  }

  render() {
    const inspector = document.createElement('aside');
    inspector.className = 'modern-smart-inspector';
    inspector.id = 'modernSmartInspector';

    const { scene, element: activeEl } = this.resolveSelectedElement();
    this.currentRenderScene = scene;

    if (!scene) {
      inspector.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted);">
          <p>Select a scene to view properties.</p>
        </div>
      `;
      return inspector;
    }

    const elements = this.getElementsList(scene);

    inspector.innerHTML = `
      <!-- Header -->
      <div class="inspector-header">
        <div class="inspector-title">
          <span>${this.getHeaderIcon(activeEl, scene)}</span>
          <span id="inspectorTitleLabel">${this.getHeaderTitle(activeEl, scene)}</span>
        </div>
        ${(activeEl && !this.isLayoutLocked(scene)) ? `
          <button class="btn btn-ghost btn-xs btn-danger" id="btnInspectorDeleteElement" title="Delete Element">
            🗑️ Delete
          </button>
        ` : ''}
      </div>

      <!-- Hidden compatibility elements for TestRunner BUG-23 -->
      <button id="btnAddAssetPicker" style="display:none;" aria-hidden="true"></button>

      <!-- Inspector Body -->
      <div class="inspector-body" id="inspectorBodyContainer">
        ${activeEl ? `
          ${this.renderActiveElementControls(activeEl, scene)}
          ${this.renderSceneTimingSection(scene)}
        ` : this.renderSceneDefaultControls(scene)}
      </div>
    `;

    const assetsMount = inspector.querySelector('#inspectorSceneAssetsMount');
    if (assetsMount) {
      const panel = new SceneAssetsPanel({
        project: this.project,
        scene: scene,
        allAssets: this.allAssets,
        onProjectModified: () => this.onProjectModified(),
        onOpenAssetPicker: (el) => this.onOpenAssetPicker(el)
      });
      assetsMount.appendChild(panel.render());
    }

    this.attachEvents(inspector, activeEl, scene);
    return inspector;
  }

  getSceneKind(scene = this.currentRenderScene || this.scene) {
    const sc = scene || this.currentRenderScene || (this.activeSceneId && this.project?.scenes?.find(s => s.id === this.activeSceneId)) || this.scene;
    if (!sc) return 'text';
    const t = (sc.template || '').toLowerCase();
    if (t === 'basic_celebration' || t === 'basic' || t === 'text') return 'text';
    if (t === 'wish_wall' || t === 'wish-wall') return 'wish_wall';
    if (t === 'video_showcase' || t === 'video') return 'video';
    if (t === 'photo_gallery' || t === 'collage' || t === 'memory_timeline') return 'gallery';
    if (t === 'fullscreen_photo') return 'image';
    if (t === 'hero') {
      const hasPhoto = sc.slots?.hero_image || sc.slots?.hero_photo || sc.settings?.heroPhotoAssetId || sc.settings?.photoAssetId || (Array.isArray(sc.assetIds) && sc.assetIds.length > 0 && sc.name !== 'New Scene');
      return hasPhoto ? 'image' : 'text';
    }
    if (t.startsWith('special_')) return 'special';
    if (t === 'message' || t === 'reveal' || t === 'final_wish' || t === 'quote') return 'text';
    if (t === 'universal' || t === 'blank' || t === 'custom') {
      const elements = sc.elements || sc.textElements || [];
      if (elements.some(e => e.type === 'video')) return 'video';
      if (elements.some(e => e.type === 'image' || e.type === 'photo')) return 'image';
      return 'text';
    }

    // Check elements or slots fallback
    const elements = sc.elements || sc.textElements || [];
    if (elements.some(e => e.type === 'video') || sc.slots?.main_video || sc.slots?.video) return 'video';
    if (elements.some(e => e.type === 'image' || e.type === 'photo') || (sc.slots?.hero_image && sc.name !== 'New Scene') || sc.slots?.primaryPhoto) return 'image';
    return 'text';
  }

  getHeaderIcon(activeEl, scene) {
    if (!activeEl) {
      const kind = this.getSceneKind(scene);
      switch (kind) {
        case 'text': return '🔤';
        case 'image': return '🖼️';
        case 'video': return '🎬';
        case 'gallery': return '🖼️';
        case 'wish_wall': return '💌';
        case 'universal': return '🎨';
        case 'special': return '✨';
        default: return '⚙️';
      }
    }
    const t = (activeEl.type || 'text').toLowerCase();
    if (t === 'text') return '🔤';
    if (t === 'image' || t === 'photo') return '🖼️';
    if (t === 'video') return '🎬';
    if (t === 'countdown') return '⏳';
    if (t === 'shape') return '🎨';
    return '✨';
  }

  getHeaderTitle(activeEl, scene) {
    if (!activeEl) {
      const kind = this.getSceneKind(scene);
      switch (kind) {
        case 'text': return 'Scene Settings';
        case 'image': return 'Photo Scene Settings';
        case 'video': return 'Video Scene Settings';
        case 'gallery': return 'Gallery & Collage Settings';
        case 'wish_wall': return 'Wish Wall Settings';
        case 'universal': return 'Canvas Scene Settings';
        case 'special': return 'Story Animation Settings';
        default: return 'Scene Settings';
      }
    }
    const t = (activeEl.type || 'text').toUpperCase();
    return `${t} Properties`;
  }

  renderActiveElementControls(el, scene) {
    const sc = scene || this.currentRenderScene || (this.activeSceneId && this.project?.scenes?.find(s => s.id === this.activeSceneId)) || this.scene;
    const t = (el.type || 'text').toLowerCase();

    if (t === 'text') return this.renderTextControls(el, sc);
    if (t === 'image' || t === 'photo') return this.renderImageControls(el, sc);
    if (t === 'video') return this.renderVideoControls(el, sc);
    if (t === 'countdown') return this.renderCountdownControls(el, sc);
    if (t === 'shape') return this.renderShapeControls(el, sc);

    return this.renderGenericControls(el, sc);
  }

  renderTextControls(el, scene) {
    const isLocked = this.isLayoutLocked(scene);

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
            <option value="'Playfair Display', serif" ${(el.fontFamily || '').toLowerCase().includes('playfair') ? 'selected' : ''}>Playfair Display (Luxury)</option>
            <option value="'Outfit', sans-serif" ${(el.fontFamily || '').toLowerCase().includes('outfit') ? 'selected' : ''}>Outfit (Modern)</option>
            <option value="'Cinzel', serif" ${(el.fontFamily || '').toLowerCase().includes('cinzel') ? 'selected' : ''}>Cinzel (Cinematic)</option>
            <option value="'Poppins', sans-serif" ${(el.fontFamily || '').toLowerCase().includes('poppins') ? 'selected' : ''}>Poppins (Friendly)</option>
            <option value="'Montserrat', sans-serif" ${(el.fontFamily || '').toLowerCase().includes('montserrat') ? 'selected' : ''}>Montserrat (Bold)</option>
            <option value="'Pacifico', cursive" ${(el.fontFamily || '').toLowerCase().includes('pacifico') ? 'selected' : ''}>Pacifico (Handwritten)</option>
            <option value="'Inter', sans-serif" ${(el.fontFamily || '').toLowerCase().includes('inter') || (!(el.fontFamily || '').toLowerCase().includes('playfair') && !(el.fontFamily || '').toLowerCase().includes('outfit') && !(el.fontFamily || '').toLowerCase().includes('cinzel') && !(el.fontFamily || '').toLowerCase().includes('poppins') && !(el.fontFamily || '').toLowerCase().includes('montserrat') && !(el.fontFamily || '').toLowerCase().includes('pacifico')) ? 'selected' : ''}>Inter (Clean)</option>
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
      const gift = resolveGiftContent(this.scene, this.project, this.allAssets);
      contentHtml = `
        <!-- Gift Box Media Attachment Control -->
        ${this.renderGiftBoxControl(this.scene)}

        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Surprise Title</label>
          <input type="text" class="form-input" id="inspSpecSurpriseTitle" value="${gift.title || s.giftTitle || s.coldCoffeeTitle || 'A Special Surprise 🎁'}" placeholder="e.g. A Special Gift For You 🎁" />
        </div>
        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.75rem; font-weight:700;">Surprise Caption / Note</label>
          <input type="text" class="form-input" id="inspSpecSurpriseCaption" value="${gift.caption || s.giftCaption || s.coldCoffeeCaption || ''}" placeholder="Personal note or voucher message..." />
        </div>

        <div style="border-top:1px solid var(--border, rgba(255,255,255,0.08)); margin:12px 0 8px 0; padding-top:8px;">
          <span style="font-size:0.72rem; font-weight:700; color:var(--text-muted);">CINEMATIC INTRO & TEXT</span>
        </div>

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
          <label style="font-size:0.75rem; font-weight:700;">Box Button Text</label>
          <input type="text" class="form-input" id="inspSpecBtnText" value="${s.buttonText || 'TAP TO OPEN'}" />
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

  resolveCurrentSceneMedia(type = 'image') {
    const s = this.scene.settings || {};
    const slots = this.scene.slots || {};
    const elements = this.getElementsList();

    if (type === 'image') {
      const assetId = s.heroPhotoAssetId || s.photoAssetId || slots.hero_image || slots.hero_photo || slots.primaryPhoto || slots.photo ||
        elements.find(e => e.type === 'image' || e.type === 'photo')?.assetId ||
        this.scene.assetIds?.find(id => {
          const a = (this.allAssets || []).find(x => x.id === id);
          return a && (a.type === 'image' || a.type === 'sticker');
        });

      if (assetId) {
        const found = (this.allAssets || []).find(a => a.id === assetId) ||
                      (this.project?.assets || []).find(a => a.id === assetId) ||
                      SAMPLE_ASSETS.find(a => a.id === assetId);
        if (found) {
          return {
            url: found.renderUrl || found.thumbnail || found.url || '',
            name: found.name || 'Selected Photo Asset',
            detail: (found.metadata?.fileFormat || found.type || 'IMAGE').toUpperCase(),
            assetId: found.id
          };
        }
      }

      // External URL
      const extUrl = s.heroPhotoUrl || s.photoUrl || elements.find(e => e.type === 'image')?.url;
      if (extUrl && typeof extUrl === 'string' && extUrl.trim()) {
        return {
          url: extUrl.trim(),
          name: 'External Image',
          detail: 'Web Photo',
          assetId: null
        };
      }

      return {
        url: '',
        name: 'No photo selected',
        detail: 'Click "Change Photo" to select or upload',
        assetId: null
      };
    }

    if (type === 'video') {
      const assetId = s.videoAssetId || slots.main_video || slots.video ||
        elements.find(e => e.type === 'video')?.assetId ||
        this.scene.assetIds?.find(id => {
          const a = (this.allAssets || []).find(x => x.id === id);
          return a && a.type === 'video';
        });

      if (assetId) {
        const found = (this.allAssets || []).find(a => a.id === assetId) ||
                      (this.project?.assets || []).find(a => a.id === assetId) ||
                      SAMPLE_ASSETS.find(a => a.id === assetId);
        if (found) {
          return {
            url: found.renderUrl || found.thumbnail || found.url || '',
            name: found.name || 'Selected Video Asset',
            detail: (found.metadata?.fileFormat || 'MP4').toUpperCase(),
            assetId: found.id
          };
        }
      }

      const extUrl = s.videoUrl || elements.find(e => e.type === 'video')?.url;
      if (extUrl && typeof extUrl === 'string' && extUrl.trim()) {
        return {
          url: extUrl.trim(),
          name: 'External Video',
          detail: 'Web Video',
          assetId: null
        };
      }

      return {
        url: '',
        name: 'No video selected',
        detail: 'Click "Change Video" to select or upload',
        assetId: null
      };
    }

    return { url: '', name: '', detail: '', assetId: null };
  }

  resolveGallerySlots() {
    const slots = [];
    const def = SceneAssetDefinitionService.getDefinition(this.scene.template);
    const defSlots = def?.slots?.filter(s => (s.acceptedTypes || []).includes('image')) || [];

    if (defSlots.length > 0) {
      defSlots.forEach(ds => {
        const assetId = this.scene.slots?.[ds.id];
        let found = assetId ? ((this.allAssets || []).find(a => a.id === assetId) || (this.project?.assets || []).find(a => a.id === assetId) || SAMPLE_ASSETS.find(a => a.id === assetId)) : null;
        slots.push({
          id: ds.id,
          title: ds.name || 'Photo Slot',
          name: found?.name || (assetId ? 'Assigned Asset' : 'Empty Slot'),
          url: found?.renderUrl || found?.thumbnail || found?.url || '',
          assetId: assetId || null
        });
      });
      return slots;
    }

    const assetIds = (this.scene.assetIds || []).filter(id => {
      const a = (this.allAssets || []).find(x => x.id === id);
      return !a || a.type === 'image' || a.type === 'sticker';
    });

    const totalCount = Math.max(3, assetIds.length);
    for (let i = 0; i < totalCount; i++) {
      const aId = assetIds[i];
      let found = aId ? ((this.allAssets || []).find(a => a.id === aId) || (this.project?.assets || []).find(a => a.id === aId) || SAMPLE_ASSETS.find(a => a.id === aId)) : null;
      slots.push({
        id: `gallery_photo_${i + 1}`,
        title: `Photo ${i + 1}`,
        name: found?.name || (aId ? 'Assigned Asset' : 'Empty Slot'),
        url: found?.renderUrl || found?.thumbnail || found?.url || '',
        assetId: aId || null
      });
    }
    return slots;
  }

  renderSceneDefaultControls(scene = this.currentRenderScene) {
    const sc = scene || this.currentRenderScene || (this.activeSceneId && this.project?.scenes?.find(s => s.id === this.activeSceneId)) || this.scene;
    const kind = this.getSceneKind(sc);
    switch (kind) {
      case 'text':
        return this.renderContextualTextSceneControls(sc);
      case 'image':
        return this.renderContextualImageSceneControls(sc);
      case 'video':
        return this.renderContextualVideoSceneControls(sc);
      case 'gallery':
        return this.renderContextualGallerySceneControls(sc);
      case 'wish_wall':
        return this.renderContextualWishWallSceneControls(sc);
      case 'universal':
        return this.renderContextualUniversalSceneControls(sc);
      case 'special':
        return this.renderContextualSpecialSceneControls(sc);
      default:
        return this.renderContextualTextSceneControls(sc);
    }
  }

  renderContextualTextSceneControls(scene = this.currentRenderScene) {
    const sc = scene || this.currentRenderScene || (this.activeSceneId && this.project?.scenes?.find(s => s.id === this.activeSceneId)) || this.scene;
    const s = sc?.settings || {};
    const elements = this.getElementsList(sc);
    const titleEl = elements.find(e => e.id === 'title' || e.role === 'title');
    const msgEl = elements.find(e => e.id === 'subtitle' || e.id === 'message' || e.role === 'body' || e.role === 'subtitle') || null;
    
    const titleVal = s.titleText || s.title || titleEl?.content || '';
    const msgVal = s.messageText || s.textContent || s.subtitleText || msgEl?.content || '';
    const fontFamily = s.fontFamily || msgEl?.fontFamily || "'Playfair Display', serif";
    const fontSize = parseInt(s.fontSize || msgEl?.fontSize || 28, 10);
    const fontWeight = s.fontWeight || msgEl?.fontWeight || 400;
    const textAlign = s.textAlign || msgEl?.textAlign || msgEl?.align || 'center';
    const textColor = s.textColor || msgEl?.color || '#ffffff';
    const bgColor = s.bgColor || '#1a162b';

    return `
      <div class="inspector-section" style="padding-top:0;">
        <div class="inspector-section-title">Scene Text & Content</div>
        <div class="form-group" style="margin-bottom:8px;">
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">Title / Headline</label>
          <input type="text" class="form-input" id="inspTextSceneTitle" value="${titleVal}" placeholder="e.g. A Heartfelt Wish..." />
        </div>
        <div class="form-group">
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">Subtitle / Message Content</label>
          <textarea class="form-input" id="inspTextSceneContent" rows="4" style="width:100%; resize:vertical;" placeholder="Write your personal message...">${msgVal}</textarea>
          <span style="font-size:0.68rem; color:var(--text-muted); margin-top:2px; display:block;">Supports: {{recipientName}}, {{senderName}}, {{age}}</span>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Typography & Styling</div>
        <div class="form-group" style="margin-bottom:8px;">
          <label style="font-size:0.72rem; color:var(--text-muted);">Font Style</label>
          <select class="form-input" id="inspTextSceneFontFamily">
            <option value="'Playfair Display', serif" ${fontFamily.includes('Playfair') ? 'selected' : ''}>Playfair Display (Luxury & Elegant)</option>
            <option value="'Outfit', sans-serif" ${fontFamily.includes('Outfit') ? 'selected' : ''}>Outfit (Modern & Clean)</option>
            <option value="'Cinzel', serif" ${fontFamily.includes('Cinzel') ? 'selected' : ''}>Cinzel (Cinematic & Grand)</option>
            <option value="'Poppins', sans-serif" ${fontFamily.includes('Poppins') ? 'selected' : ''}>Poppins (Friendly & Warm)</option>
            <option value="'Pacifico', cursive" ${fontFamily.includes('Pacifico') ? 'selected' : ''}>Pacifico (Handwritten Flourish)</option>
            <option value="'Inter', sans-serif" ${fontFamily.includes('Inter') ? 'selected' : ''}>Inter (Minimalist)</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label style="font-size:0.72rem; color:var(--text-muted);">Size (px)</label>
            <input type="number" class="form-input" id="inspTextSceneFontSize" value="${fontSize}" min="14" max="120" />
          </div>
          <div class="form-group">
            <label style="font-size:0.72rem; color:var(--text-muted);">Text Color</label>
            <input type="color" class="form-input" id="inspTextSceneColor" value="${textColor}" style="height:36px; padding:2px;" />
          </div>
        </div>

        <div class="form-row" style="margin-top:8px;">
          <div class="form-group">
            <label style="font-size:0.72rem; color:var(--text-muted);">Weight</label>
            <select class="form-input" id="inspTextSceneWeight">
              <option value="400" ${fontWeight == 400 ? 'selected' : ''}>Regular</option>
              <option value="600" ${fontWeight == 600 ? 'selected' : ''}>Semi-Bold</option>
              <option value="700" ${fontWeight == 700 ? 'selected' : ''}>Bold</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-size:0.72rem; color:var(--text-muted);">Alignment</label>
            <select class="form-input" id="inspTextSceneAlign">
              <option value="center" ${textAlign === 'center' ? 'selected' : ''}>Center</option>
              <option value="left" ${textAlign === 'left' ? 'selected' : ''}>Left</option>
              <option value="right" ${textAlign === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.72rem; color:var(--text-muted);">Background Tint</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="color" class="form-input" id="inspTextSceneBgColor" value="${bgColor}" style="width:48px; height:36px; padding:2px;" />
            <span style="font-size:0.72rem; color:var(--text-muted);">Custom backdrop accent color</span>
          </div>
        </div>
      </div>

      ${this.renderSceneTimingSection()}
    `;
  }

  renderContextualImageSceneControls() {
    const s = this.scene.settings || {};
    const mediaInfo = this.resolveCurrentSceneMedia('image');
    const fit = s.imageFit || s.fit || 'cover';
    const titleVal = s.titleText || s.title || (this.getElementsList().find(e => e.id === 'title')?.content) || '';
    const subtitleVal = s.subtitleText || s.subtitle || s.caption || (this.getElementsList().find(e => e.id === 'subtitle')?.content) || '';

    return `
      <!-- Active Photo Showcase Card -->
      <div class="inspector-section" style="padding-top:0;">
        <div class="inspector-section-title">Photo Media</div>
        
        <div class="inspector-media-preview-card" style="background:var(--surface-elevated, #161328); border:1px solid var(--border, rgba(255,255,255,0.12)); border-radius:8px; padding:10px; margin-bottom:12px;">
          <div style="display:flex; gap:10px; align-items:center;">
            <div style="width:64px; height:64px; border-radius:6px; overflow:hidden; background:#000; border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${mediaInfo.url ? `
                <img src="${mediaInfo.url}" alt="Preview" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />
                <span style="display:none; font-size:1.5rem;">🖼️</span>
              ` : `
                <span style="font-size:1.5rem;">🖼️</span>
              `}
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:0.8rem; font-weight:700; color:var(--text, #fff); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${mediaInfo.name}">
                ${mediaInfo.name}
              </div>
              <div style="font-size:0.68rem; color:var(--text-muted, #888); margin-top:2px;">
                ${mediaInfo.detail || 'Photo Frame'}
              </div>
              <button class="btn btn-primary btn-xs" id="btnSceneChangeImage" style="margin-top:6px; font-weight:700; display:inline-flex; align-items:center; gap:4px; padding:3px 8px;">
                <span>🔄 Change Photo</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label style="font-size:0.72rem; color:var(--text-muted);">Frame Fit & Crop Mode</label>
          <select class="form-input" id="inspImageSceneFit">
            <option value="cover" ${fit === 'cover' ? 'selected' : ''}>Cover (Fill Frame Professionally)</option>
            <option value="contain" ${fit === 'contain' ? 'selected' : ''}>Contain (Show Entire Photo)</option>
            <option value="fill" ${fit === 'fill' ? 'selected' : ''}>Original Stretch / Fill</option>
          </select>
        </div>
      </div>

      <!-- Text Overlay / Caption (if supported) -->
      <div class="inspector-section">
        <div class="inspector-section-title">Headline & Caption</div>
        <div class="form-group" style="margin-bottom:8px;">
          <label style="font-size:0.72rem; color:var(--text-muted);">Title / Heading</label>
          <input type="text" class="form-input" id="inspImageSceneTitle" value="${titleVal}" placeholder="e.g. Celebrating You!" />
        </div>
        <div class="form-group">
          <label style="font-size:0.72rem; color:var(--text-muted);">Subtitle / Caption</label>
          <input type="text" class="form-input" id="inspImageSceneSubtitle" value="${subtitleVal}" placeholder="e.g. A memory to cherish forever." />
        </div>
      </div>

      ${this.renderSceneTimingSection()}
    `;
  }

  renderContextualVideoSceneControls() {
    const s = this.scene.settings || {};
    const mediaInfo = this.resolveCurrentSceneMedia('video');
    const titleVal = s.titleText || s.title || (this.getElementsList().find(e => e.id === 'title')?.content) || '';
    const autoplay = s.autoplay !== false;
    const loop = s.loop !== false;
    const muted = s.muted !== false;

    return `
      <!-- Active Video Showcase Card -->
      <div class="inspector-section" style="padding-top:0;">
        <div class="inspector-section-title">Video Media</div>

        <div class="inspector-media-preview-card" style="background:var(--surface-elevated, #161328); border:1px solid var(--border, rgba(255,255,255,0.12)); border-radius:8px; padding:10px; margin-bottom:12px;">
          <div style="display:flex; gap:10px; align-items:center;">
            <div style="width:64px; height:64px; border-radius:6px; overflow:hidden; background:#000; border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span style="font-size:1.8rem;">🎬</span>
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:0.8rem; font-weight:700; color:var(--text, #fff); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${mediaInfo.name}">
                ${mediaInfo.name || 'Selected Video'}
              </div>
              <div style="font-size:0.68rem; color:var(--text-muted, #888); margin-top:2px;">
                ${mediaInfo.detail || 'Video Stream'}
              </div>
              <button class="btn btn-primary btn-xs" id="btnSceneChangeVideo" style="margin-top:6px; font-weight:700; display:inline-flex; align-items:center; gap:4px; padding:3px 8px;">
                <span>🔄 Change Video</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-top:8px;">
          <label style="font-size:0.72rem; color:var(--text-muted);">Video Title / Overlay (Optional)</label>
          <input type="text" class="form-input" id="inspVideoSceneTitle" value="${titleVal}" placeholder="e.g. Highlights Reel" />
        </div>
      </div>

      <!-- Playback Options -->
      <div class="inspector-section">
        <div class="inspector-section-title">Playback Options</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:0.78rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
            <span>Autoplay Video</span>
            <input type="checkbox" id="inspVideoAutoplay" ${autoplay ? 'checked' : ''} />
          </label>
          <label style="font-size:0.78rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
            <span>Loop Playback</span>
            <input type="checkbox" id="inspVideoLoop" ${loop ? 'checked' : ''} />
          </label>
          <label style="font-size:0.78rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
            <span>Mute Video Sound</span>
            <input type="checkbox" id="inspVideoMute" ${muted ? 'checked' : ''} />
          </label>
        </div>
      </div>

      ${this.renderSceneTimingSection()}
    `;
  }

  renderContextualGallerySceneControls() {
    const s = this.scene.settings || {};
    const slots = this.resolveGallerySlots();
    const layout = s.galleryLayout || s.layout || 'grid';
    const titleVal = s.titleText || s.title || '';
    const subtitleVal = s.subtitleText || s.subtitle || '';

    return `
      <div class="inspector-section" style="padding-top:0;">
        <div class="inspector-section-title">Gallery Photos (${slots.length} Slots)</div>
        
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
          ${slots.map((slot, idx) => `
            <div class="gallery-slot-row" style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-elevated, #161328); border:1px solid var(--border, rgba(255,255,255,0.1)); border-radius:6px; padding:6px 10px; gap:8px;">
              <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
                <div style="width:36px; height:36px; border-radius:4px; overflow:hidden; background:#000; flex-shrink:0; border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center;">
                  ${slot.url ? `
                    <img src="${slot.url}" alt="${slot.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';" />
                    <span style="display:none; font-size:1rem;">🖼️</span>
                  ` : `
                    <span style="font-size:1rem; color:var(--text-muted);">📷</span>
                  `}
                </div>
                <div style="min-width:0; flex:1;">
                  <div style="font-size:0.75rem; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${slot.title || `Photo ${idx + 1}`}
                  </div>
                  <div style="font-size:0.65rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${slot.name}
                  </div>
                </div>
              </div>
              <button class="btn btn-secondary btn-xs btn-gallery-change-photo" data-slot-id="${slot.id}" data-slot-idx="${idx}" style="font-size:0.68rem; padding:3px 7px; font-weight:700;">
                🔄 Change
              </button>
            </div>
          `).join('')}
        </div>

        <div class="form-group">
          <label style="font-size:0.72rem; color:var(--text-muted);">Arrangement / Layout</label>
          <select class="form-input" id="inspGalleryLayout">
            <option value="grid" ${layout === 'grid' ? 'selected' : ''}>Grid Matrix</option>
            <option value="masonry" ${layout === 'masonry' ? 'selected' : ''}>Dynamic Masonry</option>
            <option value="carousel" ${layout === 'carousel' ? 'selected' : ''}>Horizontal Carousel</option>
            <option value="stack" ${layout === 'stack' ? 'selected' : ''}>Overlapping Tilt Stack</option>
          </select>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Gallery Title & Subtitle</div>
        <div class="form-group" style="margin-bottom:8px;">
          <label style="font-size:0.72rem; color:var(--text-muted);">Headline Title</label>
          <input type="text" class="form-input" id="inspGalleryTitle" value="${titleVal}" placeholder="e.g. Unforgettable Moments" />
        </div>
        <div class="form-group">
          <label style="font-size:0.72rem; color:var(--text-muted);">Subtitle</label>
          <input type="text" class="form-input" id="inspGallerySubtitle" value="${subtitleVal}" placeholder="e.g. Looking back at our favorite times." />
        </div>
      </div>

      ${this.renderSceneTimingSection()}
    `;
  }

  renderContextualWishWallSceneControls() {
    return `
      ${this.renderWishWallControls()}
      ${this.renderSceneTimingSection()}
    `;
  }

  renderContextualUniversalSceneControls() {
    const elements = this.getElementsList();

    return `
      <div class="inspector-section" style="padding-top:0;">
        <div class="inspector-section-title">Canvas Layers & Elements (${elements.length})</div>
        
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
          ${elements.length === 0 ? `
            <div style="padding:16px 8px; text-align:center; color:var(--text-muted); font-size:0.75rem; background:rgba(255,255,255,0.02); border-radius:6px; border:1px dashed var(--border);">
              No elements on canvas. Click below to add your first element.
            </div>
          ` : elements.map(el => {
            const icon = el.type === 'text' ? '🔤' : (el.type === 'image' || el.type === 'photo' ? '🖼️' : (el.type === 'video' ? '🎬' : '🎨'));
            const snippet = (el.content || el.text || el.name || el.type || '').toString().substring(0, 24);
            return `
              <div class="universal-layer-row" data-element-id="${el.id}" style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-elevated, #161328); border:1px solid var(--border, rgba(255,255,255,0.1)); border-radius:6px; padding:6px 10px; cursor:pointer; transition:all 0.15s ease;">
                <div style="display:flex; align-items:center; gap:8px; min-width:0;">
                  <span style="font-size:1rem;">${icon}</span>
                  <div style="min-width:0;">
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                      ${el.name || `${el.type.toUpperCase()} Element`}
                    </div>
                    <div style="font-size:0.65rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                      ${snippet}
                    </div>
                  </div>
                </div>
                <span style="font-size:0.68rem; color:var(--accent, #a78bfa); font-weight:700;">Edit ➔</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="inspector-section-title" style="margin-top:8px;">Quick Add to Canvas</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <button class="btn btn-secondary btn-xs" id="btnQuickAddText" style="padding:6px 8px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span>🔤 Add Text</span>
          </button>
          <button class="btn btn-secondary btn-xs" id="btnQuickAddImage" style="padding:6px 8px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span>🖼️ Add Photo</span>
          </button>
          <button class="btn btn-secondary btn-xs" id="btnQuickAddShape" style="padding:6px 8px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span>🎨 Add Shape</span>
          </button>
          <button class="btn btn-secondary btn-xs" id="btnQuickAddVideo" style="padding:6px 8px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span>🎬 Add Video</span>
          </button>
        </div>
      </div>

      ${this.renderSceneTimingSection()}
    `;
  }

  renderContextualSpecialSceneControls() {
    const animConfig = this.scene.settings?.animationConfig || {};

    return `
      ${this.renderSpecialSceneControls()}

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

      ${this.renderSceneTimingSection()}
    `;
  }

  renderSceneTimingSection(scene = this.currentRenderScene) {
    const sc = scene || this.currentRenderScene || (this.activeSceneId && this.project?.scenes?.find(s => s.id === this.activeSceneId)) || this.scene;
    const settings = sc?.settings || {};
    const nextText = settings.nextButtonText || 'Next Scene ✨';
    const nextTheme = settings.nextButtonTheme || 'royal-gold';
    const nextTiming = settings.nextButtonTiming || 'on-scene-end';
    const nextCustomColor = settings.nextButtonCustomColor || '#FFD700';

    return `
      <!-- Scene Configuration & Timing Settings -->
      <div class="inspector-section" style="border-top:1px solid var(--border, rgba(255,255,255,0.08)); padding-top:12px;">
        <div class="inspector-section-title">Scene Settings & Timing</div>
        <div class="form-group">
          <label style="font-size:0.72rem; color:var(--text-muted);">Scene Name</label>
          <input type="text" class="form-input" id="inspSceneName" value="${sc?.name || 'Scene'}" />
        </div>

        <div class="form-row" style="margin-top:6px;">
          <div class="form-group">
            <label style="font-size:0.72rem; color:var(--text-muted);">Duration (s)</label>
            <input type="number" class="form-input" id="inspSceneDuration" value="${sc?.duration || 6}" min="2" max="30" />
          </div>
          <div class="form-group">
            <label style="font-size:0.72rem; color:var(--text-muted);">Transition</label>
            <select class="form-input" id="inspSceneTransition">
              <option value="fade" ${sc?.transition === 'fade' || !sc?.transition ? 'selected' : ''}>Fade</option>
              <option value="slide" ${sc?.transition === 'slide' ? 'selected' : ''}>Slide</option>
              <option value="zoom" ${sc?.transition === 'zoom' ? 'selected' : ''}>Zoom</option>
              <option value="pop" ${sc?.transition === 'pop' ? 'selected' : ''}>Pop</option>
              <option value="flip" ${sc?.transition === 'flip' ? 'selected' : ''}>Flip</option>
            </select>
          </div>
        </div>

        <!-- Customizable Golden Next Button Section -->
        <div class="form-group" style="margin-top:10px; padding:10px 12px; background:linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,179,0,0.03) 100%); border:1px solid rgba(255,215,0,0.22); border-radius:var(--radius-sm, 8px);">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <label style="font-size:0.75rem; font-weight:700; color:#FFD54F; display:flex; align-items:center; gap:6px; margin:0;">
              <span>✨ Golden Next Button</span>
            </label>
            <span style="font-size:0.68rem; color:var(--text-muted);">Published Player</span>
          </div>

          <div class="form-group" style="margin-bottom:8px;">
            <label style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px; display:block;">Button Text</label>
            <input type="text" class="form-input" id="inspNextBtnText" value="${nextText}" placeholder="e.g. Next Scene ✨" />
          </div>

          <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="form-group" style="margin:0;">
              <label style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px; display:block;">Golden Theme</label>
              <select class="form-input" id="inspNextBtnTheme">
                <option value="royal-gold" ${nextTheme === 'royal-gold' ? 'selected' : ''}>👑 Royal Gold</option>
                <option value="champagne-gold" ${nextTheme === 'champagne-gold' ? 'selected' : ''}>🥂 Champagne Gold</option>
                <option value="rose-gold" ${nextTheme === 'rose-gold' ? 'selected' : ''}>🌸 Rose Gold</option>
                <option value="amber-gold" ${nextTheme === 'amber-gold' ? 'selected' : ''}>✨ Amber Gold</option>
                <option value="custom" ${nextTheme === 'custom' ? 'selected' : ''}>🎨 Custom Color</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label style="font-size:0.7rem; color:var(--text-muted); margin-bottom:4px; display:block;">Appearance</label>
              <select class="form-input" id="inspNextBtnTiming">
                <option value="on-scene-end" ${nextTiming === 'on-scene-end' || !nextTiming ? 'selected' : ''}>When Scene Ends</option>
                <option value="always" ${nextTiming === 'always' ? 'selected' : ''}>Show Immediately</option>
              </select>
            </div>
          </div>

          <div class="form-group" id="inspNextBtnCustomColorGroup" style="margin-top:8px; display:${nextTheme === 'custom' ? 'flex' : 'none'}; align-items:center; gap:8px;">
            <label style="font-size:0.7rem; color:var(--text-muted); margin:0;">Custom Color:</label>
            <input type="color" id="inspNextBtnCustomColor" value="${nextCustomColor}" style="width:36px; height:24px; padding:0; border:none; border-radius:4px; cursor:pointer;" />
            <input type="text" class="form-input" id="inspNextBtnCustomColorHex" value="${nextCustomColor}" style="font-size:0.72rem; padding:3px 6px; flex:1;" />
          </div>
        </div>

        <div class="form-group" style="margin-top:8px; padding:6px 10px; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:var(--radius-sm, 6px);">
          <label style="font-size:0.75rem; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:700; margin:0;">
            <span>🔒 Lock Layout Composition</span>
            <input type="checkbox" id="inspLockLayout" ${sc?.lockedLayout !== false ? 'checked' : ''} />
          </label>
        </div>
      </div>
    `;
  }

  attachEvents(inspector, activeEl, scene) {
    const notifyChange = () => {
      this.onProjectModified();
    };

    const getTargetScene = () => {
      const sId = (activeEl ? this.selectedElementSceneId : this.activeSceneId) || scene?.id || this.activeSceneId;
      return (sId && this.project?.scenes?.find(s => s.id === sId)) || scene || this.scene;
    };

    const updateElementProp = (elementId, updates) => {
      if (!elementId || !updates) return;
      const ownerSceneId = this.selectedElementSceneId || scene?.id || this.activeSceneId;
      const targetScene = (ownerSceneId && this.project?.scenes?.find(s => s.id === ownerSceneId)) || scene;
      if (!targetScene) return;
      const elements = targetScene.elements || targetScene.textElements || [];
      const el = elements.find(e => e.id === elementId) || (activeEl && activeEl.id === elementId ? activeEl : null);
      if (el) {
        Object.assign(el, updates);
        if (updates.content !== undefined && updates.text === undefined) {
          el.text = updates.content;
        }
      }
      if (activeEl && activeEl.id === elementId) {
        Object.assign(activeEl, updates);
        if (updates.content !== undefined && updates.text === undefined) {
          activeEl.text = updates.content;
        }
      }
      updateTextElement(targetScene, elementId, updates);
      notifyChange();
    };

    const handleTextElementPropChange = (target) => {
      if (!activeEl) return;
      if (target.id === 'inspTextContent') {
        updateElementProp(activeEl.id, { content: target.value });
      }
      if (target.id === 'inspFontSize') {
        const size = parseInt(target.value, 10) || 32;
        updateElementProp(activeEl.id, { fontSize: size });
      }
      if (target.id === 'inspTextColor') {
        updateElementProp(activeEl.id, { color: target.value });
      }
      if (target.id === 'inspTextOpacity') {
        const op = (parseFloat(target.value) || 100) / 100;
        updateElementProp(activeEl.id, { opacity: op });
      }
      if (target.id === 'inspLetterSpacing') {
        const ls = parseFloat(target.value) || 0;
        updateElementProp(activeEl.id, { letterSpacing: `${ls}px` });
      }
    };

    inspector.addEventListener('change', (e) => {
      handleTextElementPropChange(e.target);
      const targetScene = getTargetScene();
      if (targetScene) {
        if (!targetScene.settings) targetScene.settings = {};
        if (!targetScene.settings.animationConfig) targetScene.settings.animationConfig = {};
        if (!this.project.wishWall) this.project.wishWall = {};

        if (e.target.id === 'inspSpecialAnimDuration') {
          targetScene.settings.animationConfig.duration = parseFloat(e.target.value) || 2.5;
          notifyChange();
        }
        if (e.target.id === 'inspSpecialAnimDelay') {
          targetScene.settings.animationConfig.delay = parseFloat(e.target.value) || 0;
          notifyChange();
        }
        if (e.target.id === 'inspSpecialAnimEase') {
          targetScene.settings.animationConfig.ease = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspSpecialAnimIntensity') {
          targetScene.settings.animationConfig.intensity = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspSceneTransition') {
          targetScene.transition = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspLockLayout') {
          targetScene.lockedLayout = e.target.checked;
          notifyChange();
        }

        // Golden Next Button Scene Settings
        if (e.target.id === 'inspNextBtnTheme') {
          targetScene.settings.nextButtonTheme = e.target.value;
          const colorGrp = inspector.querySelector('#inspNextBtnCustomColorGroup');
          if (colorGrp) colorGrp.style.display = e.target.value === 'custom' ? 'flex' : 'none';
          notifyChange();
        }
        if (e.target.id === 'inspNextBtnTiming') {
          targetScene.settings.nextButtonTiming = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspNextBtnCustomColor') {
          targetScene.settings.nextButtonCustomColor = e.target.value;
          const hexInp = inspector.querySelector('#inspNextBtnCustomColorHex');
          if (hexInp) hexInp.value = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspNextBtnText') {
          targetScene.settings.nextButtonText = e.target.value;
          notifyChange();
        }

        // Wish Wall scene settings
        if (e.target.id === 'inspWishWallLayout') {
          targetScene.settings.wallLayout = e.target.value;
          this.project.wishWall.layout = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspWishWallAmbience') {
          targetScene.settings.ambience = e.target.value;
          this.project.wishWall.ambience = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspWishWallDisplayMode') {
          targetScene.settings.displayMode = e.target.value;
          this.project.wishWall.displayMode = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspWishWallReactions') {
          targetScene.settings.showReactions = e.target.checked;
          this.project.wishWall.showReactions = e.target.checked;
          notifyChange();
        }
        if (e.target.id === 'inspWishWallTags') {
          targetScene.settings.showTags = e.target.checked;
          notifyChange();
        }
        if (e.target.id === 'inspWishWallCta') {
          targetScene.settings.showCta = e.target.checked;
          notifyChange();
        }

        // Contextual Text Scene Controls
        if (e.target.id === 'inspTextSceneFontFamily') {
          targetScene.settings.fontFamily = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle' || x.id === 'message');
          if (el) el.fontFamily = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspTextSceneFontSize') {
          const sz = parseInt(e.target.value, 10) || 28;
          targetScene.settings.fontSize = sz;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle' || x.id === 'message');
          if (el) el.fontSize = sz;
          notifyChange();
        }
        if (e.target.id === 'inspTextSceneWeight') {
          targetScene.settings.fontWeight = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle' || x.id === 'message');
          if (el) el.fontWeight = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspTextSceneAlign') {
          targetScene.settings.textAlign = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle' || x.id === 'message');
          if (el) { el.textAlign = e.target.value; el.align = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspTextSceneColor') {
          targetScene.settings.textColor = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle' || x.id === 'message');
          if (el) el.color = e.target.value;
          notifyChange();
        }
        if (e.target.id === 'inspTextSceneBgColor') {
          targetScene.settings.bgColor = e.target.value;
          notifyChange();
        }

        // Contextual Image Scene Controls
        if (e.target.id === 'inspImageSceneFit') {
          targetScene.settings.imageFit = e.target.value;
          const imgEl = this.getElementsList(targetScene).find(x => x.type === 'image');
          if (imgEl) imgEl.fit = e.target.value;
          notifyChange();
        }

        // Contextual Video Scene Controls
        if (e.target.id === 'inspVideoAutoplay') {
          targetScene.settings.autoplay = e.target.checked;
          notifyChange();
        }
        if (e.target.id === 'inspVideoLoop') {
          targetScene.settings.loop = e.target.checked;
          notifyChange();
        }
        if (e.target.id === 'inspVideoMute') {
          targetScene.settings.muted = e.target.checked;
          notifyChange();
        }

        // Contextual Gallery Scene Controls
        if (e.target.id === 'inspGalleryLayout') {
          targetScene.settings.galleryLayout = e.target.value;
          notifyChange();
        }
      }
    });

    inspector.addEventListener('click', (e) => {
      if (e.target.id === 'btnInspReplaceImage' || e.target.id === 'btnInspReplaceVideo') {
        this.onOpenAssetPicker(activeEl);
      }
      if (e.target.closest('#btnSceneChangeImage')) {
        this.onOpenAssetPicker({ type: 'image', slotId: 'hero_image' });
      }
      if (e.target.closest('#btnSceneChangeVideo')) {
        this.onOpenAssetPicker({ type: 'video', slotId: 'video' });
      }
      const btnGalleryChange = e.target.closest('.btn-gallery-change-photo');
      if (btnGalleryChange) {
        const slotId = btnGalleryChange.dataset.slotId;
        const idx = parseInt(btnGalleryChange.dataset.slotIdx, 10);
        this.onOpenAssetPicker({ type: 'image', slotId: slotId, idx: idx });
      }
      const layerRow = e.target.closest('.universal-layer-row');
      if (layerRow) {
        const elId = layerRow.dataset.elementId;
        if (elId) this.onSelectElement(elId, scene?.id || this.activeSceneId);
      }
      if (e.target.closest('#btnQuickAddText')) {
        this.onQuickAddElement?.('text');
      }
      if (e.target.closest('#btnQuickAddImage')) {
        this.onQuickAddElement?.('image');
      }
      if (e.target.closest('#btnQuickAddShape')) {
        this.onQuickAddElement?.('shape');
      }
      if (e.target.closest('#btnQuickAddVideo')) {
        this.onQuickAddElement?.('video');
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

      // Gift Box Media Picker (Image)
      if (e.target.closest('.btn-spec-pick-gift-image')) {
        const modal = new AssetPickerModal({
          project: this.project,
          allAssets: this.allAssets,
          targetScene: this.scene,
          targetSlotId: 'gift_content',
          filterTab: 'image',
          type: 'image',
          onProjectModified: () => {
            if (this.onProjectModified) this.onProjectModified();
          },
          onSelectAsset: (asset) => {
            if (asset) {
              const url = asset.renderUrl || asset.thumbnail || asset.url || '';
              this.scene.settings = this.scene.settings || {};
              this.scene.settings.giftBox = {
                enabled: true,
                contentType: 'image',
                contentAssetId: asset.id,
                contentUrl: url,
                title: this.scene.settings.giftBox?.title || this.scene.settings.giftTitle || this.scene.settings.coldCoffeeTitle || 'A Special Surprise 🎁',
                caption: this.scene.settings.giftBox?.caption || this.scene.settings.giftCaption || this.scene.settings.coldCoffeeCaption || ''
              };
              this.scene.settings.giftContentType = 'image';
              this.scene.settings.giftContentAssetId = asset.id;
              this.scene.settings.giftContentUrl = url;

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

      // Gift Box Media Picker (Video)
      if (e.target.closest('.btn-spec-pick-gift-video')) {
        const modal = new AssetPickerModal({
          project: this.project,
          allAssets: this.allAssets,
          targetScene: this.scene,
          targetSlotId: 'gift_content',
          filterTab: 'video',
          type: 'video',
          onProjectModified: () => {
            if (this.onProjectModified) this.onProjectModified();
          },
          onSelectAsset: (asset) => {
            if (asset) {
              const url = asset.renderUrl || asset.url || '';
              this.scene.settings = this.scene.settings || {};
              this.scene.settings.giftBox = {
                enabled: true,
                contentType: 'video',
                contentAssetId: asset.id,
                contentUrl: url,
                title: this.scene.settings.giftBox?.title || this.scene.settings.giftTitle || this.scene.settings.coldCoffeeTitle || 'A Special Surprise 🎁',
                caption: this.scene.settings.giftBox?.caption || this.scene.settings.giftCaption || this.scene.settings.coldCoffeeCaption || ''
              };
              this.scene.settings.giftContentType = 'video';
              this.scene.settings.giftContentAssetId = asset.id;
              this.scene.settings.giftContentUrl = url;

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

      // Gift Box Media Clear
      if (e.target.closest('.btn-spec-clear-gift')) {
        this.scene.settings = this.scene.settings || {};
        if (this.scene.settings.giftBox) {
          this.scene.settings.giftBox.contentType = null;
          this.scene.settings.giftBox.contentAssetId = null;
          this.scene.settings.giftBox.contentUrl = '';
        }
        this.scene.settings.giftContentType = null;
        this.scene.settings.giftContentAssetId = null;
        this.scene.settings.giftContentUrl = '';
        notifyChange();
        const updated = this.render();
        inspector.replaceWith(updated);
        return;
      }
    });

    inspector.addEventListener('input', (e) => {
      handleTextElementPropChange(e.target);
      const targetScene = getTargetScene();
      if (!targetScene) return;
      if (!targetScene.settings) targetScene.settings = {};
      if (!this.project.wishWall) this.project.wishWall = {};

      if (e.target.id === 'inspWishWallTitle') {
        targetScene.settings.titleText = e.target.value;
        this.project.wishWall.title = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallSubtitle') {
        targetScene.settings.subtitleText = e.target.value;
        this.project.wishWall.subtitle = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspWishWallCustomCounter') {
        targetScene.settings.customCounterText = e.target.value;
        notifyChange();
      }

      if (e.target.classList.contains('inp-wish-sample-name')) {
        const idx = parseInt(e.target.dataset.wishIdx, 10);
        if (targetScene.settings?.sampleWishes?.[idx]) {
          targetScene.settings.sampleWishes[idx].name = e.target.value;
          notifyChange();
        }
      }
      if (e.target.classList.contains('inp-wish-sample-rel')) {
        const idx = parseInt(e.target.dataset.wishIdx, 10);
        if (targetScene.settings?.sampleWishes?.[idx]) {
          targetScene.settings.sampleWishes[idx].relationship = e.target.value;
          notifyChange();
        }
      }
      if (e.target.classList.contains('inp-wish-sample-msg')) {
        const idx = parseInt(e.target.dataset.wishIdx, 10);
        if (targetScene.settings?.sampleWishes?.[idx]) {
          targetScene.settings.sampleWishes[idx].message = e.target.value;
          notifyChange();
        }
      }

      if (e.target.id === 'inspSceneName') {
        targetScene.name = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspSceneDuration') {
        const dur = parseInt(e.target.value, 10) || 6;
        targetScene.duration = dur;
        notifyChange();
      }
      if (e.target.id === 'inspNextBtnText') {
        targetScene.settings = targetScene.settings || {};
        targetScene.settings.nextButtonText = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspNextBtnCustomColor') {
        targetScene.settings = targetScene.settings || {};
        targetScene.settings.nextButtonCustomColor = e.target.value;
        const hexInp = inspector.querySelector('#inspNextBtnCustomColorHex');
        if (hexInp) hexInp.value = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspNextBtnCustomColorHex') {
        targetScene.settings = targetScene.settings || {};
        targetScene.settings.nextButtonCustomColor = e.target.value;
        const colInp = inspector.querySelector('#inspNextBtnCustomColor');
        if (colInp) colInp.value = e.target.value;
        notifyChange();
      }

      if (!activeEl) {
        if (e.target.id === 'inspTextSceneTitle') {
          targetScene.settings.titleText = e.target.value;
          targetScene.settings.title = e.target.value;
          targetScene.name = e.target.value || targetScene.name;
          const el = this.getElementsList(targetScene).find(x => x.id === 'title' || x.role === 'title');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspTextSceneContent') {
          targetScene.settings.messageText = e.target.value;
          targetScene.settings.textContent = e.target.value;
          targetScene.settings.subtitleText = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle' || x.id === 'message' || x.role === 'body' || x.role === 'subtitle');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspImageSceneTitle') {
          if (!this.scene.settings) this.scene.settings = {};
          this.scene.settings.titleText = e.target.value;
          this.scene.settings.title = e.target.value;
          targetScene.name = e.target.value || targetScene.name;
          const el = this.getElementsList(targetScene).find(x => x.id === 'title');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspImageSceneSubtitle') {
          targetScene.settings.subtitleText = e.target.value;
          targetScene.settings.subtitle = e.target.value;
          targetScene.settings.caption = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspVideoSceneTitle') {
          targetScene.settings.titleText = e.target.value;
          targetScene.settings.title = e.target.value;
          targetScene.name = e.target.value || targetScene.name;
          const el = this.getElementsList(targetScene).find(x => x.id === 'title');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspGalleryTitle') {
          targetScene.settings.titleText = e.target.value;
          targetScene.settings.title = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'title');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspGallerySubtitle') {
          targetScene.settings.subtitleText = e.target.value;
          targetScene.settings.subtitle = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }

        if (e.target.id === 'inspStdTitle') {
          targetScene.settings.titleText = e.target.value;
          targetScene.name = e.target.value || targetScene.name;
          const el = this.getElementsList(targetScene).find(x => x.id === 'title');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspStdSubtitle') {
          targetScene.settings.subtitleText = e.target.value;
          targetScene.settings.textContent = e.target.value;
          targetScene.settings.messageText = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'subtitle');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspStdBadge') {
          targetScene.settings.badgeText = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'badge');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspStdSignature') {
          targetScene.settings.signature = e.target.value;
          targetScene.settings.signatureText = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'signature');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
          notifyChange();
        }
        if (e.target.id === 'inspStdScriptNote') {
          targetScene.settings.scriptNote = e.target.value;
          const el = this.getElementsList(targetScene).find(x => x.id === 'scriptNote');
          if (el) { el.content = e.target.value; el.text = e.target.value; }
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
        if (e.target.id === 'inspSpecSurpriseTitle') {
          this.scene.settings.coldCoffeeTitle = e.target.value;
          this.scene.settings.giftTitle = e.target.value;
          if (this.scene.settings.giftBox) {
            this.scene.settings.giftBox.title = e.target.value;
          }
          notifyChange();
        }
        if (e.target.id === 'inspSpecSurpriseCaption') {
          this.scene.settings.coldCoffeeCaption = e.target.value;
          this.scene.settings.giftCaption = e.target.value;
          if (this.scene.settings.giftBox) {
            this.scene.settings.giftBox.caption = e.target.value;
          }
          notifyChange();
        }

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
      handleTextElementPropChange(e.target);
      if (e.target.id === 'inspTextX') {
        const val = parseFloat(e.target.value) || 0;
        updateElementProp(activeEl.id, { x: val, left: val });
      }
      if (e.target.id === 'inspTextY') {
        const val = parseFloat(e.target.value) || 0;
        updateElementProp(activeEl.id, { y: val, top: val });
      }
      if (e.target.id === 'inspTextWidth') {
        updateElementProp(activeEl.id, { width: e.target.value });
      }
      if (e.target.id === 'inspTextRotation') {
        const val = parseFloat(e.target.value) || 0;
        updateElementProp(activeEl.id, { rotation: val });
      }
      if (e.target.id === 'inspBorderRadius') {
        const val = parseInt(e.target.value, 10) || 0;
        updateElementProp(activeEl.id, { borderRadius: val });
      }
      if (e.target.id === 'inspShapeIcon') {
        updateElementProp(activeEl.id, { content: e.target.value, icon: e.target.value });
      }

      // Image element inputs
      if (e.target.id === 'inspImageOpacity') {
        const val = (parseFloat(e.target.value) || 100) / 100;
        updateElementProp(activeEl.id, { opacity: val });
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

      if (e.target.id === 'inspSceneTransition') {
        const target = getTargetScene();
        if (target) target.transition = e.target.value;
        notifyChange();
      }
      if (e.target.id === 'inspLockLayout') {
        const target = getTargetScene();
        if (target) target.lockedLayout = e.target.checked;
        notifyChange();
      }

      if (!activeEl) {
        return;
      }

      if (e.target.id === 'inspFontFamily') {
        updateElementProp(activeEl.id, { fontFamily: e.target.value });
      }
      if (e.target.id === 'inspFontWeight') {
        updateElementProp(activeEl.id, { fontWeight: e.target.value });
      }
      if (e.target.id === 'inspTextAlign') {
        updateElementProp(activeEl.id, { textAlign: e.target.value, align: e.target.value });
      }
      if (e.target.id === 'inspElementAnim') {
        updateElementProp(activeEl.id, { animation: e.target.value });
      }
      if (e.target.id === 'inspImageFit') {
        updateElementProp(activeEl.id, { fit: e.target.value });
      }
      if (e.target.id === 'inspVideoAutoplay') {
        updateElementProp(activeEl.id, { autoplay: e.target.checked });
      }
      if (e.target.id === 'inspVideoLoop') {
        updateElementProp(activeEl.id, { loop: e.target.checked });
      }
      if (e.target.id === 'inspVideoMute') {
        updateElementProp(activeEl.id, { muted: e.target.checked });
      }
    });
  }
}
