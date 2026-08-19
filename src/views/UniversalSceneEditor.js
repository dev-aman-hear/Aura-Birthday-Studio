/**
 * Birthday Studio - Universal Scene Editor
 * Single unified scene editor for every scene and template.
 * Automatically detects element types:
 * - Text → Text controls (content, font, size, weight, color, align, line height, letter spacing, rotation, opacity, position)
 * - Image → Image controls (src/media selection, fit, size, radius, border, rotation, opacity, position)
 * - Video → Video controls (video url/src, autoplay, loop, mute, size, radius, rotation, opacity, position)
 * - Shape → Shape controls (shape type/icon, fill color, border, size, radius, rotation, opacity, position)
 * 
 * Supports:
 * - Dynamic position (% X/Y, responsive size, anchor points)
 * - Fixed position (exact px X/Y, exact size)
 * - Layer order (Bring Forward, Send Backward, Bring to Front, Send to Back)
 * - Element Operations (Click, Drag, Resize, Rotate, Duplicate, Delete, Add)
 */

import { SCENE_TEMPLATES } from '../templates/TemplateRegistry.js';
import { sceneRepository } from '../services/SceneRepository.js';
import { AssetPickerModal } from './AssetPickerModal.js';
import { SceneAssetsPanel } from './editor/SceneAssetsPanel.js';
import { Toast } from '../utils/Toast.js';


export class UniversalSceneEditor {
  constructor(options = {}) {
    this.project = options.project;
    this.scene = options.scene;
    this.allAssets = options.allAssets || [];
    this.onProjectModified = options.onProjectModified || (() => {});
    this.selectedElementId = null;
  }

  setSelectedElementId(elementId) {
    this.selectedElementId = elementId;
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
    this.scene.elements = [];
    return this.scene.elements;
  }

  render() {
    const container = document.createElement('aside');
    container.className = 'scene-editor-panel universal-scene-editor';
    container.id = 'sceneEditorRoot';

    if (!this.scene) {
      container.innerHTML = `
        <div class="no-scene-selected" style="padding:30px; text-align:center; color:var(--text-muted);">
          <p>Select a scene from the timeline to edit properties.</p>
        </div>
      `;
      return container;
    }

    const elements = this.getElementsList();

    let activeEl = elements.find(e => e.id === this.selectedElementId);
    if (!activeEl && elements.length > 0) {
      activeEl = elements[0];
      this.selectedElementId = activeEl.id;
    }

    container.innerHTML = `
      <div class="panel-header" style="padding:14px 16px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:1.05rem; font-weight:800; color:var(--accent-gold); display:flex; align-items:center; gap:8px;">
          <span>⚡ Scene Editor</span>
        </h3>
        <span class="scene-limit-badge" style="font-size:0.75rem; color:var(--text-muted); background:var(--surface); padding:2px 8px; border-radius:12px; border:1px solid var(--border);">
          ${elements.length} Elements
        </span>
      </div>

      <div class="editor-scroll-body" style="padding:16px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:14px;">
        <!-- QUICK ADD ELEMENTS TOOLBAR -->
        <button id="btnAddAssetPicker" style="display:none;" aria-hidden="true"></button>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; background:var(--surface-elevated); padding:8px; border-radius:var(--radius-md); border:1px solid var(--border);">
          <button class="btn btn-secondary btn-xs" id="btnEditorAddText" style="justify-content:center;">🔤 + Text</button>
          <button class="btn btn-secondary btn-xs" id="btnEditorAddImage" style="justify-content:center;">🖼️ + Image</button>
          <button class="btn btn-secondary btn-xs" id="btnEditorAddShape" style="justify-content:center;">🎨 + Shape</button>
          <button class="btn btn-secondary btn-xs" id="btnEditorAddVideo" style="justify-content:center;">🎬 + Video</button>
        </div>

        <!-- ELEMENT SELECTION & LAYER REORDERING -->
        <div class="form-group" style="background:var(--surface-elevated); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin:0;">ACTIVE CANVAS ELEMENT</label>
            ${activeEl ? `
              <div style="display:flex; gap:4px;">
                <button class="btn btn-ghost btn-compact btn-icon" id="btnLayerBringFront" title="Bring to Front (Highest Layer)" style="padding:2px 6px; font-size:0.75rem;">⏫</button>
                <button class="btn btn-ghost btn-compact btn-icon" id="btnLayerUp" title="Bring Forward" style="padding:2px 6px; font-size:0.75rem;">▲</button>
                <button class="btn btn-ghost btn-compact btn-icon" id="btnLayerDown" title="Send Backward" style="padding:2px 6px; font-size:0.75rem;">▼</button>
                <button class="btn btn-ghost btn-compact btn-icon" id="btnLayerSendBack" title="Send to Back (Lowest Layer)" style="padding:2px 6px; font-size:0.75rem;">⏬</button>
              </div>
            ` : ''}
          </div>

          <select class="form-input" id="edActiveElementSelect" style="font-weight:600; width:100%;">
            ${elements.length > 0 ? elements.map((el, idx) => `
              <option value="${el.id}" ${el.id === this.selectedElementId ? 'selected' : ''}>
                ${idx + 1}. [${(el.type || 'TEXT').toUpperCase()}] ${el.name || el.content?.substring(0, 20) || el.id}
              </option>
            `).join('') : '<option value="">No elements in scene</option>'}
          </select>

          ${activeEl ? `
            <div style="display:flex; gap:8px; margin-top:10px;">
              <button class="btn btn-secondary btn-xs" id="btnDuplicateActiveEl" style="flex:1;">📋 Duplicate</button>
              <button class="btn btn-ghost btn-xs btn-danger" id="btnDeleteActiveEl" style="color:var(--danger);">🗑️ Delete</button>
            </div>
          ` : ''}
        </div>

        ${activeEl ? this.renderElementPropertiesPanel(activeEl) : `
          <div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.85rem; background:var(--surface-elevated); border-radius:var(--radius-md); border:1px solid var(--border);">
            No element selected. Click an element on canvas or use '+ Text / Image / Shape' buttons above.
          </div>
        `}

        <!-- SCENE SETTINGS & TIMING -->
        <details class="editor-section" style="background:var(--surface-elevated); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border);">
          <summary style="font-size:0.8rem; font-weight:700; color:var(--text-muted); cursor:pointer; margin-bottom:10px;">⚙️ SCENE SETTINGS & TIMING</summary>
          
          <div class="form-group" style="margin-top:8px;">
            <label>Scene Name</label>
            <input type="text" class="form-input" id="edSceneName" value="${this.scene.name}" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Transition</label>
              <select class="form-input" id="edSceneTransition">
                <option value="fade" ${this.scene.transition === 'fade' ? 'selected' : ''}>Fade</option>
                <option value="slide" ${this.scene.transition === 'slide' ? 'selected' : ''}>Slide</option>
                <option value="zoom" ${this.scene.transition === 'zoom' ? 'selected' : ''}>Zoom</option>
                <option value="flip" ${this.scene.transition === 'flip' ? 'selected' : ''}>Flip</option>
              </select>
            </div>

            <div class="form-group">
              <label>Duration (Seconds)</label>
              <input type="number" class="form-input" id="edSceneDuration" min="2" max="30" value="${this.scene.duration || 6}" />
            </div>
          </div>
        </details>
      </div>
    `;

    this.attachEvents(container, activeEl);
    return container;
  }

  renderElementPropertiesPanel(el) {
    const elType = (el.type || 'text').toLowerCase();
    const posMode = el.position?.mode || 'dynamic';
    const posX = el.position?.x !== undefined ? el.position.x : (el.x !== undefined ? el.x : 50);
    const posY = el.position?.y !== undefined ? el.position.y : (el.y !== undefined ? el.y : 50);
    const anchor = el.position?.anchor || 'center';
    const widthVal = el.size?.width !== undefined ? el.size.width : (el.width !== undefined ? el.width : 80);
    const heightVal = el.size?.height !== undefined ? el.size.height : (el.height !== undefined ? el.height : 'auto');

    return `
      <!-- SECTION 1: TYPE SPECIFIC CONTROLS -->
      <details open class="editor-section" style="background:var(--surface-elevated); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border);">
        <summary style="font-size:0.8rem; font-weight:700; color:var(--accent-gold); cursor:pointer; margin-bottom:10px;">
          <span>✏️ ${elType.toUpperCase()} PROPERTIES</span>
        </summary>

        <!-- 1A. TEXT CONTROLS -->
        ${elType === 'text' ? `
          <div class="form-group">
            <label>Text Content / Placeholders</label>
            <textarea class="form-input" id="edElContent" rows="2" style="resize:vertical;">${el.content || ''}</textarea>
            <div style="font-size:0.7rem; color:var(--text-muted); margin-top:3px;">
              Placeholders: {{recipientName}}, {{senderName}}, {{occasion}}, {{message}}
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Font Family</label>
              <select class="form-input" id="edElFontFamily">
                <option value="Outfit, sans-serif" ${el.fontFamily?.includes('Outfit') ? 'selected' : ''}>Outfit (Modern)</option>
                <option value="Inter, sans-serif" ${el.fontFamily?.includes('Inter') ? 'selected' : ''}>Inter (Sans)</option>
                <option value="Playfair Display, serif" ${el.fontFamily?.includes('Playfair') ? 'selected' : ''}>Playfair (Serif)</option>
                <option value="Cinzel, serif" ${el.fontFamily?.includes('Cinzel') ? 'selected' : ''}>Cinzel (Classic)</option>
                <option value="Great Vibes, cursive" ${el.fontFamily?.includes('Great Vibes') ? 'selected' : ''}>Great Vibes (Cursive)</option>
                <option value="Montserrat, sans-serif" ${el.fontFamily?.includes('Montserrat') ? 'selected' : ''}>Montserrat (Bold)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Font Weight</label>
              <select class="form-input" id="edElFontWeight">
                <option value="300" ${el.fontWeight === '300' ? 'selected' : ''}>Light (300)</option>
                <option value="400" ${el.fontWeight === '400' ? 'selected' : ''}>Regular (400)</option>
                <option value="600" ${el.fontWeight === '600' ? 'selected' : ''}>SemiBold (600)</option>
                <option value="700" ${el.fontWeight === '700' ? 'selected' : ''}>Bold (700)</option>
                <option value="800" ${el.fontWeight === '800' || el.fontWeight === '900' ? 'selected' : ''}>ExtraBold (800)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Font Size (px)</label>
              <input type="number" class="form-input" id="edElFontSize" min="10" max="140" value="${el.fontSize || 32}" />
            </div>

            <div class="form-group">
              <label>Text Color</label>
              <input type="color" class="form-input" id="edElColor" value="${el.color && el.color.startsWith('#') ? el.color : '#ffffff'}" style="height:38px; cursor:pointer;" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Alignment</label>
              <div style="display:flex; gap:4px;">
                <button type="button" class="btn ${el.align === 'left' ? 'btn-primary' : 'btn-secondary'} btn-xs btn-align-el" data-align="left" style="flex:1;">⬅️ Left</button>
                <button type="button" class="btn ${el.align === 'center' || !el.align ? 'btn-primary' : 'btn-secondary'} btn-xs btn-align-el" data-align="center" style="flex:1;">↔️ Center</button>
                <button type="button" class="btn ${el.align === 'right' ? 'btn-primary' : 'btn-secondary'} btn-xs btn-align-el" data-align="right" style="flex:1;">➡️ Right</button>
              </div>
            </div>

            <div class="form-group">
              <label>Line Height</label>
              <input type="number" step="0.1" class="form-input" id="edElLineHeight" min="0.8" max="3" value="${el.lineHeight || 1.2}" />
            </div>
          </div>
        ` : ''}

        <!-- 1B. IMAGE CONTROLS -->
        ${elType === 'image' ? `
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="margin:0;">Image Source / Placeholder</label>
              <button type="button" class="btn btn-primary btn-xs" id="btnEditorPickImage" style="padding:2px 8px; font-size:0.75rem;">
                🖼️ Choose Asset
              </button>
            </div>
            <input type="text" class="form-input" id="edElContent" value="${el.content || '{{photo1}}'}" placeholder="{{photo1}}, {{photo2}} or Image URL" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Object Fit</label>
              <select class="form-input" id="edElFit">
                <option value="cover" ${el.fit === 'cover' || !el.fit ? 'selected' : ''}>Cover (Crop to fill)</option>
                <option value="contain" ${el.fit === 'contain' ? 'selected' : ''}>Contain (Fit entire)</option>
                <option value="fill" ${el.fit === 'fill' ? 'selected' : ''}>Fill (Stretch)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Border Radius (px)</label>
              <input type="number" class="form-input" id="edElBorderRadius" min="0" max="100" value="${el.borderRadius || 16}" />
            </div>
          </div>
        ` : ''}

        <!-- 1C. VIDEO CONTROLS -->
        ${elType === 'video' ? `
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="margin:0;">Video Source / Placeholder</label>
              <button type="button" class="btn btn-primary btn-xs" id="btnEditorPickVideo" style="padding:2px 8px; font-size:0.75rem;">
                🎬 Choose Asset
              </button>
            </div>
            <input type="text" class="form-input" id="edElContent" value="${el.content || '{{video1}}'}" placeholder="{{video1}} or Video URL" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Border Radius (px)</label>
              <input type="number" class="form-input" id="edElBorderRadius" min="0" max="100" value="${el.borderRadius || 16}" />
            </div>
          </div>
        ` : ''}


        <!-- 1D. SHAPE CONTROLS -->
        ${elType === 'shape' ? `
          <div class="form-group">
            <label>Shape Icon / Content</label>
            <input type="text" class="form-input" id="edElContent" value="${el.content || '⭐'}" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fill Color</label>
              <input type="color" class="form-input" id="edElFillColor" value="${el.fillColor && el.fillColor.startsWith('#') ? el.fillColor : '#ffd700'}" style="height:38px; cursor:pointer;" />
            </div>

            <div class="form-group">
              <label>Border Radius (px)</label>
              <input type="number" class="form-input" id="edElBorderRadius" min="0" max="100" value="${el.borderRadius || 50}" />
            </div>
          </div>
        ` : ''}

        <!-- ENTRANCE ANIMATION -->
        <div class="form-group" style="margin-top:10px;">
          <label>Entrance Animation</label>
          <select class="form-input" id="edElAnimation">
            <option value="fadeIn" ${el.animation === 'fadeIn' ? 'selected' : ''}>Fade In</option>
            <option value="cinematicTextReveal" ${el.animation === 'cinematicTextReveal' ? 'selected' : ''}>Cinematic Text Reveal</option>
            <option value="blur_reveal" ${el.animation === 'blur_reveal' ? 'selected' : ''}>Blur Reveal</option>
            <option value="ken_burns" ${el.animation === 'ken_burns' ? 'selected' : ''}>Ken Burns Zoom/Pan</option>
            <option value="pop" ${el.animation === 'pop' ? 'selected' : ''}>Pop Bouncy</option>
            <option value="float" ${el.animation === 'float' ? 'selected' : ''}>Float Gentle</option>
            <option value="slide_up" ${el.animation === 'slide_up' ? 'selected' : ''}>Slide Up</option>
          </select>
        </div>
      </details>

      <!-- SECTION 2: POSITION SYSTEM (DYNAMIC % VS FIXED PX) -->
      <details open class="editor-section" style="background:var(--surface-elevated); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border);">
        <summary style="font-size:0.8rem; font-weight:700; color:var(--text-muted); cursor:pointer; margin-bottom:10px;">
          <span>📐 POSITION & RESPONSIVE SCALING</span>
        </summary>

        <div class="form-group">
          <label>Positioning Mode</label>
          <select class="form-input" id="edElPosMode">
            <option value="dynamic" ${posMode === 'dynamic' ? 'selected' : ''}>🌐 Dynamic (Responsive %)</option>
            <option value="fixed" ${posMode === 'fixed' ? 'selected' : ''}>📍 Fixed Exact (Exact px)</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>X Position (${posMode === 'dynamic' ? '%' : 'px'})</label>
            <input type="number" class="form-input" id="edElPosX" value="${posX}" />
          </div>

          <div class="form-group">
            <label>Y Position (${posMode === 'dynamic' ? '%' : 'px'})</label>
            <input type="number" class="form-input" id="edElPosY" value="${posY}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Width (${posMode === 'dynamic' ? '%' : 'px'})</label>
            <input type="text" class="form-input" id="edElWidth" value="${widthVal}" placeholder="e.g. 80 or auto" />
          </div>

          <div class="form-group">
            <label>Height (${posMode === 'dynamic' ? '%' : 'px'})</label>
            <input type="text" class="form-input" id="edElHeight" value="${heightVal}" placeholder="e.g. 50 or auto" />
          </div>
        </div>

        <div class="form-group">
          <label>Anchor Point</label>
          <select class="form-input" id="edElAnchor">
            <option value="center" ${anchor === 'center' ? 'selected' : ''}>🎯 Center</option>
            <option value="top-left" ${anchor === 'top-left' ? 'selected' : ''}>↖️ Top Left</option>
            <option value="top-center" ${anchor === 'top-center' ? 'selected' : ''}>⬆️ Top Center</option>
            <option value="top-right" ${anchor === 'top-right' ? 'selected' : ''}>↗️ Top Right</option>
            <option value="center-left" ${anchor === 'center-left' ? 'selected' : ''}>⬅️ Center Left</option>
            <option value="center-right" ${anchor === 'center-right' ? 'selected' : ''}>➡️ Center Right</option>
            <option value="bottom-left" ${anchor === 'bottom-left' ? 'selected' : ''}>↙️ Bottom Left</option>
            <option value="bottom-center" ${anchor === 'bottom-center' ? 'selected' : ''}>⬇️ Bottom Center</option>
            <option value="bottom-right" ${anchor === 'bottom-right' ? 'selected' : ''}>↘️ Bottom Right</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Rotation (${el.rotation || 0}°)</label>
            <input type="range" class="form-input" id="edElRotation" min="-180" max="180" value="${el.rotation || 0}" />
          </div>

          <div class="form-group">
            <label>Opacity (${Math.round((el.opacity !== undefined ? el.opacity : 1) * 100)}%)</label>
            <input type="range" class="form-input" id="edElOpacity" min="0" max="1" step="0.05" value="${el.opacity !== undefined ? el.opacity : 1}" />
          </div>
        </div>
      </details>
    `;
  }

  attachEvents(container, activeEl) {
    // Select Active Element
    container.addEventListener('change', (e) => {
      if (e.target.id === 'edActiveElementSelect') {
        this.selectedElementId = e.target.value;
        const newRoot = this.render();
        container.replaceWith(newRoot);
        return;
      }

      if (!activeEl) return;

      if (e.target.id === 'edElFontFamily') {
        activeEl.fontFamily = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edElFontWeight') {
        activeEl.fontWeight = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edElFit') {
        activeEl.fit = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edElAnimation') {
        activeEl.animation = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edElPosMode') {
        if (!activeEl.position) activeEl.position = {};
        activeEl.position.mode = e.target.value;
        this.onProjectModified();
        const newRoot = this.render();
        container.replaceWith(newRoot);
      }

      if (e.target.id === 'edElAnchor') {
        if (!activeEl.position) activeEl.position = {};
        activeEl.position.anchor = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edSceneName') {
        this.scene.name = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edSceneTransition') {
        this.scene.transition = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edSceneDuration') {
        this.scene.duration = parseInt(e.target.value, 10) || 6;
        this.onProjectModified();
      }
    });

    // Real-time Input
    container.addEventListener('input', (e) => {
      if (!activeEl) return;

      if (e.target.id === 'edElContent') {
        activeEl.content = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edElFontSize') {
        activeEl.fontSize = parseInt(e.target.value, 10) || 32;
        this.onProjectModified();
      }

      if (e.target.id === 'edElColor') {
        activeEl.color = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edElLineHeight') {
        activeEl.lineHeight = parseFloat(e.target.value) || 1.2;
        this.onProjectModified();
      }

      if (e.target.id === 'edElBorderRadius') {
        activeEl.borderRadius = parseInt(e.target.value, 10) || 0;
        this.onProjectModified();
      }

      if (e.target.id === 'edElFillColor') {
        activeEl.fillColor = e.target.value;
        this.onProjectModified();
      }

      if (e.target.id === 'edElPosX') {
        if (!activeEl.position) activeEl.position = {};
        activeEl.position.x = parseFloat(e.target.value) || 0;
        activeEl.x = activeEl.position.x;
        this.onProjectModified();
      }

      if (e.target.id === 'edElPosY') {
        if (!activeEl.position) activeEl.position = {};
        activeEl.position.y = parseFloat(e.target.value) || 0;
        activeEl.y = activeEl.position.y;
        this.onProjectModified();
      }

      if (e.target.id === 'edElWidth') {
        const val = e.target.value.trim();
        if (!activeEl.size) activeEl.size = {};
        activeEl.size.width = isNaN(Number(val)) ? val : Number(val);
        activeEl.width = activeEl.size.width;
        this.onProjectModified();
      }

      if (e.target.id === 'edElHeight') {
        const val = e.target.value.trim();
        if (!activeEl.size) activeEl.size = {};
        activeEl.size.height = isNaN(Number(val)) ? val : Number(val);
        activeEl.height = activeEl.size.height;
        this.onProjectModified();
      }

      if (e.target.id === 'edElRotation') {
        activeEl.rotation = parseInt(e.target.value, 10) || 0;
        this.onProjectModified();
      }

      if (e.target.id === 'edElOpacity') {
        activeEl.opacity = parseFloat(e.target.value);
        this.onProjectModified();
      }
    });

    // Button Clicks
    container.addEventListener('click', (e) => {
      // Pick Asset for Active Element
      if (e.target.closest('#btnEditorPickImage') || e.target.closest('#btnEditorPickVideo')) {
        if (activeEl) {
          const modal = new AssetPickerModal({
            allAssets: this.allAssets,
            targetScene: this.scene,
            onSelectAsset: (asset) => {
              activeEl.assetId = asset.id;
              activeEl.content = asset.renderUrl || asset.thumbnail || asset.url || asset.id;
              if (!this.scene.assetIds) this.scene.assetIds = [];
              if (!this.scene.assetIds.includes(asset.id)) {
                this.scene.assetIds.push(asset.id);
              }
              this.onProjectModified();
              Toast.show(`Assigned ${asset.name}`, 'success');
              const newRoot = this.render();
              container.replaceWith(newRoot);
            }
          });
          document.body.appendChild(modal.render());
        }
        return;
      }

      // Add Elements Toolbar
      if (e.target.closest('#btnEditorAddText')) {
        this.addNewElement('text', 'New Text Element');
        return;
      }

      if (e.target.closest('#btnEditorAddImage')) {
        this.addNewElement('image', '{{photo1}}');
        return;
      }

      if (e.target.closest('#btnEditorAddShape')) {
        this.addNewElement('shape', '⭐');
        return;
      }

      if (e.target.closest('#btnEditorAddVideo')) {
        this.addNewElement('video', '{{video1}}');
        return;
      }


      // Duplicate Element
      if (e.target.closest('#btnDuplicateActiveEl')) {
        if (activeEl) {
          const cloned = JSON.parse(JSON.stringify(activeEl));
          cloned.id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
          cloned.name = `${cloned.name || 'Element'} (Copy)`;
          if (cloned.position) {
            cloned.position.x = (cloned.position.x || 50) + 4;
            cloned.position.y = (cloned.position.y || 50) + 4;
          }
          const elements = this.getElementsList();
          elements.push(cloned);
          this.selectedElementId = cloned.id;
          this.onProjectModified();
          Toast.show('Element duplicated', 'info');
          const newRoot = this.render();
          container.replaceWith(newRoot);
        }
        return;
      }

      // Delete Element
      if (e.target.closest('#btnDeleteActiveEl')) {
        if (activeEl && this.scene) {
          this.scene.elements = this.getElementsList().filter(el => el.id !== activeEl.id);
          this.scene.textElements = this.scene.elements;
          this.selectedElementId = this.scene.elements[0]?.id || null;
          this.onProjectModified();
          Toast.show('Element removed', 'info');
          const newRoot = this.render();
          container.replaceWith(newRoot);
        }
        return;
      }

      // Text Alignment Buttons
      const alignBtn = e.target.closest('.btn-align-el');
      if (alignBtn && activeEl) {
        activeEl.align = alignBtn.dataset.align;
        this.onProjectModified();
        const newRoot = this.render();
        container.replaceWith(newRoot);
        return;
      }

      // Layer Reordering
      if (e.target.closest('#btnLayerBringFront') && activeEl) {
        activeEl.zIndex = 100;
        this.onProjectModified();
        Toast.show('Brought to front', 'info');
        return;
      }

      if (e.target.closest('#btnLayerUp') && activeEl) {
        activeEl.zIndex = (activeEl.zIndex || 1) + 1;
        this.onProjectModified();
        Toast.show('Moved forward', 'info');
        return;
      }

      if (e.target.closest('#btnLayerDown') && activeEl) {
        activeEl.zIndex = Math.max(1, (activeEl.zIndex || 1) - 1);
        this.onProjectModified();
        Toast.show('Moved backward', 'info');
        return;
      }

      if (e.target.closest('#btnLayerSendBack') && activeEl) {
        activeEl.zIndex = 1;
        this.onProjectModified();
        Toast.show('Sent to back', 'info');
        return;
      }
    });
  }

  addNewElement(type, defaultContent) {
    if (!this.scene) return;
    const elements = this.getElementsList();

    const newId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newEl = {
      id: newId,
      type: type,
      name: `${type.toUpperCase()} Element`,
      content: defaultContent,
      position: { mode: 'dynamic', x: 50, y: 50, anchor: 'center' },
      size: { mode: 'dynamic', width: type === 'text' ? 80 : 60, height: type === 'image' ? 45 : 'auto' },
      fontSize: type === 'text' ? 32 : (type === 'shape' ? 48 : undefined),
      fontWeight: '700',
      color: '#ffffff',
      fillColor: type === 'shape' ? 'rgba(255, 215, 0, 0.2)' : undefined,
      borderRadius: type === 'shape' ? 50 : 16,
      animation: 'fadeIn',
      zIndex: elements.length + 1,
      opacity: 1,
      rotation: 0
    };

    elements.push(newEl);
    this.scene.elements = elements;
    this.scene.textElements = elements;
    this.selectedElementId = newId;

    this.onProjectModified();
    Toast.show(`Added new ${type} element`, 'success');

    const editorRoot = document.getElementById('sceneEditorRoot');
    if (editorRoot) {
      const newRoot = this.render();
      editorRoot.replaceWith(newRoot);
    }
  }
}
