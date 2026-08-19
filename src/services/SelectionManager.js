/**
 * Birthday Studio - Selection Manager & Visual Canvas Interaction Engine
 * Supports Locked Preset Layouts (Composition Protection with Text & Media Personalization)
 * and Freeform Mode for Custom/Blank Projects.
 */

export class SelectionManager {
  constructor(options = {}) {
    this.canvasViewport = options.canvasViewport || null;
    this.scene = options.scene || null;
    this.onProjectModified = options.onProjectModified || (() => {});
    this.onSelectElement = options.onSelectElement || (() => {});
    this.onOpenAssetPicker = options.onOpenAssetPicker || (() => {});
    this.selectedElementId = null;
    this.copiedElement = null;
    this.isDragging = false;
    this.isResizing = false;
    this.isRotating = false;
    this.activeHandle = null;
    this.dragStart = { x: 0, y: 0 };
    this.elementStart = { x: 0, y: 0, width: 0, height: 0, rotation: 0 };

    this.bindGlobalKeyboardShortcuts();
  }

  isLayoutLocked() {
    return this.scene?.lockedLayout !== false;
  }

  setScene(scene, viewport) {
    this.scene = scene;
    this.canvasViewport = viewport;
    this.renderSelectionOverlay();
  }

  selectElement(elementId) {
    this.selectedElementId = elementId;
    this.renderSelectionOverlay();
    this.onSelectElement(elementId);
  }

  clearSelection() {
    this.selectedElementId = null;
    const overlay = this.canvasViewport?.querySelector('#canvasSelectionOverlay');
    if (overlay) overlay.remove();
    this.removeSnapGuides();
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
    return [];
  }

  getSelectedElement() {
    if (!this.scene || !this.selectedElementId) return null;
    const elements = this.getElementsList();
    let el = elements.find(e => e.id === this.selectedElementId);
    if (!el) {
      const s = this.scene.settings || {};
      const fallbackVal = s[this.selectedElementId + 'Text'] || s[this.selectedElementId] || '';
      el = {
        id: this.selectedElementId,
        type: 'text',
        name: this.selectedElementId.charAt(0).toUpperCase() + this.selectedElementId.slice(1),
        content: fallbackVal,
        text: fallbackVal,
        fontFamily: 'Outfit, sans-serif',
        fontSize: 32,
        fontWeight: '700',
        color: '#ffffff',
        visible: true
      };
      if (!Array.isArray(this.scene.elements)) this.scene.elements = [];
      this.scene.elements.push(el);
    }
    return el;
  }

  renderSelectionOverlay() {
    if (!this.canvasViewport) return;

    // Remove existing overlay
    const oldOverlay = this.canvasViewport.querySelector('#canvasSelectionOverlay');
    if (oldOverlay) oldOverlay.remove();

    const selectedEl = this.getSelectedElement();
    if (!selectedEl) return;

    // Find DOM node matching element
    const domNode = this.canvasViewport.querySelector(`[data-element-id="${selectedEl.id}"], [data-text-id="${selectedEl.id}"]`);
    if (!domNode) return;

    const viewportRect = this.canvasViewport.getBoundingClientRect();
    const nodeRect = domNode.getBoundingClientRect();

    // Calculate relative coordinates in viewport space
    const relativeLeft = nodeRect.left - viewportRect.left;
    const relativeTop = nodeRect.top - viewportRect.top;
    const width = nodeRect.width;
    const height = nodeRect.height;
    const isLocked = this.isLayoutLocked();

    const overlay = document.createElement('div');
    overlay.className = `canvas-selection-box ${isLocked ? 'locked-layout-box' : ''}`;
    overlay.id = 'canvasSelectionOverlay';
    overlay.style.cssText = `
      position: absolute;
      left: ${relativeLeft}px;
      top: ${relativeTop}px;
      width: ${width}px;
      height: ${height}px;
      border: ${isLocked ? '2px dashed var(--accent, #7f5af0)' : '2px solid var(--accent, #7f5af0)'};
      border-radius: ${isLocked ? '8px' : '0'};
      box-shadow: ${isLocked ? '0 0 16px rgba(127, 90, 240, 0.35)' : 'none'};
      box-sizing: border-box;
      pointer-events: auto;
      z-index: 9999;
      transform-origin: center center;
    `;

    // Floating Quick Toolbar above bounding box
    const toolbar = document.createElement('div');
    toolbar.className = 'canvas-quick-toolbar';
    toolbar.style.pointerEvents = 'auto';

    if (isLocked) {
      if (selectedEl.type === 'text') {
        toolbar.innerHTML = `
          <button class="btn-quick-action primary" id="btnQuickTextEdit" title="Edit Text Inline (Double-click or click here)">✍️ Edit Text</button>
        `;
      } else if (selectedEl.type === 'image' || selectedEl.type === 'photo') {
        toolbar.innerHTML = `
          <button class="btn-quick-action primary" id="btnQuickMediaReplace" title="Replace Photo in Frame">🖼️ Replace Photo</button>
        `;
      } else if (selectedEl.type === 'video') {
        toolbar.innerHTML = `
          <button class="btn-quick-action primary" id="btnQuickMediaReplace" title="Replace Video in Frame">🎬 Replace Video</button>
        `;
      } else {
        toolbar.innerHTML = `
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted); padding:2px 8px;">🔒 Template Composition</span>
        `;
      }
    } else {
      toolbar.innerHTML = `
        ${selectedEl.type === 'text' ? '<button class="btn-quick-action" id="btnQuickTextEdit" title="Edit Text Inline">✍️ Edit</button>' : ''}
        <button class="btn-quick-action" id="btnQuickCopy" title="Copy Element (Ctrl+C)">📋 Copy</button>
        <button class="btn-quick-action" id="btnQuickFront" title="Bring to Front">🔼 Front</button>
        <button class="btn-quick-action" id="btnQuickBack" title="Send to Back">🔽 Back</button>
        <button class="btn-quick-action btn-danger" id="btnQuickDelete" title="Delete Element">🗑️</button>
      `;

      // 8 Resize Handles + 1 Rotation Handle for unlocked mode
      const handlesHtml = `
        <div class="selection-handle handle-rot" data-handle="rot" title="Rotate Element">🔄</div>
        <div class="selection-handle handle-nw" data-handle="nw"></div>
        <div class="selection-handle handle-n" data-handle="n"></div>
        <div class="selection-handle handle-ne" data-handle="ne"></div>
        <div class="selection-handle handle-e" data-handle="e"></div>
        <div class="selection-handle handle-se" data-handle="se"></div>
        <div class="selection-handle handle-s" data-handle="s"></div>
        <div class="selection-handle handle-sw" data-handle="sw"></div>
        <div class="selection-handle handle-w" data-handle="w"></div>
      `;
      overlay.insertAdjacentHTML('beforeend', handlesHtml);
    }

    overlay.appendChild(toolbar);

    this.attachOverlayEvents(overlay, domNode, selectedEl, isLocked);
    this.canvasViewport.appendChild(overlay);
  }

  attachOverlayEvents(overlay, domNode, selectedEl, isLocked) {
    // Quick Toolbar buttons
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.target.closest('button');
      if (!btn) return;

      if (btn.id === 'btnQuickTextEdit') {
        this.enableInlineTextEdit(domNode, selectedEl);
      } else if (btn.id === 'btnQuickMediaReplace') {
        this.onOpenAssetPicker(selectedEl);
      } else if (btn.id === 'btnQuickCopy') {
        this.copySelectedElement();
      } else if (btn.id === 'btnQuickFront') {
        selectedEl.zIndex = (selectedEl.zIndex || 1) + 5;
        this.onProjectModified();
      } else if (btn.id === 'btnQuickBack') {
        selectedEl.zIndex = Math.max(1, (selectedEl.zIndex || 1) - 1);
        this.onProjectModified();
      } else if (btn.id === 'btnQuickDelete') {
        this.deleteSelectedElement();
      }
    });

    // Double click to enter direct inline text editing or media replacement
    overlay.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (selectedEl.type === 'text') {
        this.enableInlineTextEdit(domNode, selectedEl);
      } else if (selectedEl.type === 'image' || selectedEl.type === 'photo' || selectedEl.type === 'video') {
        this.onOpenAssetPicker(selectedEl);
      }
    });

    if (isLocked) {
      // Locked composition: Drag, resize, rotate are intentionally disabled
      return;
    }

    // Handle Drag & Drop to Move / Resize / Rotate (Desktop Mouse & Mobile Touch for unlocked scenes)
    const onStart = (clientX, clientY, targetHandle) => {
      this.dragStart = { x: clientX, y: clientY };

      const mode = selectedEl.position?.mode || 'dynamic';
      const posX = selectedEl.position?.x !== undefined ? selectedEl.position.x : (selectedEl.x !== undefined ? selectedEl.x : 50);
      const posY = selectedEl.position?.y !== undefined ? selectedEl.position.y : (selectedEl.y !== undefined ? selectedEl.y : 50);

      this.elementStart = {
        x: posX,
        y: posY,
        mode: mode,
        width: domNode.offsetWidth,
        height: domNode.offsetHeight,
        rotation: selectedEl.rotation || 0
      };

      if (targetHandle) {
        const type = targetHandle.dataset.handle;
        if (type === 'rot') {
          this.isRotating = true;
        } else {
          this.isResizing = true;
          this.activeHandle = type;
        }
      } else {
        this.isDragging = true;
      }
    };

    const onMove = (clientX, clientY) => {
      const dx = clientX - this.dragStart.x;
      const dy = clientY - this.dragStart.y;
      const viewportRect = this.canvasViewport.getBoundingClientRect();

      if (this.isDragging) {
        if (this.elementStart.mode === 'dynamic') {
          const dxPct = (dx / viewportRect.width) * 100;
          const dyPct = (dy / viewportRect.height) * 100;

          let newX = Math.round(this.elementStart.x + dxPct);
          let newY = Math.round(this.elementStart.y + dyPct);

          // Snap to canvas center
          if (Math.abs(newX - 50) < 3) {
            newX = 50;
            this.showGuide('v', 50);
          } else {
            this.hideGuide('v');
          }

          if (Math.abs(newY - 50) < 3) {
            newY = 50;
            this.showGuide('h', 50);
          } else {
            this.hideGuide('h');
          }

          if (!selectedEl.position) selectedEl.position = {};
          selectedEl.position.x = newX;
          selectedEl.position.y = newY;
          selectedEl.x = newX;
          selectedEl.y = newY;
        } else {
          const newX = Math.round(this.elementStart.x + dx);
          const newY = Math.round(this.elementStart.y + dy);

          if (!selectedEl.position) selectedEl.position = {};
          selectedEl.position.x = newX;
          selectedEl.position.y = newY;
          selectedEl.x = newX;
          selectedEl.y = newY;
        }
        this.renderSelectionOverlay();
      } else if (this.isResizing) {
        if (!selectedEl.size) selectedEl.size = {};
        if (this.activeHandle.includes('e')) {
          const w = Math.max(40, this.elementStart.width + dx);
          selectedEl.width = w;
          selectedEl.size.width = w;
        }
        if (this.activeHandle.includes('s')) {
          const h = Math.max(20, this.elementStart.height + dy);
          selectedEl.height = h;
          selectedEl.size.height = h;
        }
        this.renderSelectionOverlay();

      } else if (this.isRotating) {
        const rect = overlay.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radians = Math.atan2(clientY - centerY, clientX - centerX);
        let degrees = Math.round(radians * (180 / Math.PI)) + 90;
        selectedEl.rotation = degrees;
        this.renderSelectionOverlay();
      }
    };

    const onEnd = () => {
      if (this.isDragging || this.isResizing || this.isRotating) {
        this.isDragging = false;
        this.isResizing = false;
        this.isRotating = false;
        this.activeHandle = null;
        this.removeSnapGuides();
        this.onProjectModified();
      }
    };

    // Mouse Listeners
    overlay.addEventListener('mousedown', (e) => {
      const handle = e.target.closest('.selection-handle');
      if (handle) e.stopPropagation();
      onStart(e.clientX, e.clientY, handle);

      const onMouseMove = (moveEvt) => onMove(moveEvt.clientX, moveEvt.clientY);
      const onMouseUp = () => {
        onEnd();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // Touch Listeners for Mobile
    overlay.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const handle = e.target.closest('.selection-handle');
        onStart(touch.clientX, touch.clientY, handle);

        const onTouchMove = (touchEvt) => {
          if (touchEvt.touches.length === 1) {
            onMove(touchEvt.touches[0].clientX, touchEvt.touches[0].clientY);
          }
        };

        const onTouchEnd = () => {
          onEnd();
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onTouchEnd);
        };

        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);
      }
    });
  }

  showGuide(orientation, posPct) {
    if (!this.canvasViewport) return;
    let guide = this.canvasViewport.querySelector(`#snapGuide_${orientation}`);
    if (!guide) {
      guide = document.createElement('div');
      guide.id = `snapGuide_${orientation}`;
      guide.style.cssText = `
        position: absolute;
        background: #00ffffff;
        box-shadow: 0 0 8px #00ffff;
        pointer-events: none;
        z-index: 9998;
      `;
      this.canvasViewport.appendChild(guide);
    }
    if (orientation === 'v') {
      guide.style.cssText += `left: ${posPct}%; top: 0; width: 2px; height: 100%;`;
    } else {
      guide.style.cssText += `left: 0; top: ${posPct}%; width: 100%; height: 2px;`;
    }
  }

  hideGuide(orientation) {
    const guide = this.canvasViewport?.querySelector(`#snapGuide_${orientation}`);
    if (guide) guide.remove();
  }

  removeSnapGuides() {
    this.hideGuide('v');
    this.hideGuide('h');
  }

  enableInlineTextEdit(domNode, selectedEl) {
    if (!domNode || !selectedEl) return;

    // Target the inner editable element or the domNode itself
    const editableTarget = domNode.querySelector('.element-anim-wrapper') || domNode;

    // Temporarily hide selection overlay during active text editing
    const overlay = this.canvasViewport?.querySelector('#canvasSelectionOverlay');
    if (overlay) overlay.style.display = 'none';

    const originalContent = selectedEl.content !== undefined ? selectedEl.content : (selectedEl.text || editableTarget.textContent);
    editableTarget.textContent = originalContent;
    editableTarget.contentEditable = 'true';
    editableTarget.style.outline = '2px dashed var(--accent, #7f5af0)';
    editableTarget.style.cursor = 'text';
    editableTarget.focus();

    const range = document.createRange();
    range.selectNodeContents(editableTarget);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    let isSaved = false;

    const commitChange = () => {
      if (isSaved) return;
      isSaved = true;
      editableTarget.contentEditable = 'false';
      editableTarget.style.outline = '';
      editableTarget.style.cursor = '';
      
      const newText = editableTarget.textContent;
      if (newText !== undefined && newText !== originalContent) {
        selectedEl.content = newText;
        selectedEl.text = newText;
        if (!this.scene.settings) this.scene.settings = {};
        if (selectedEl.id === 'title') {
          this.scene.settings.titleText = newText;
          this.scene.name = newText || this.scene.name;
        } else if (selectedEl.id === 'subtitle') {
          this.scene.settings.subtitleText = newText;
          this.scene.settings.textContent = newText;
          this.scene.settings.messageText = newText;
        } else if (selectedEl.id === 'badge') {
          this.scene.settings.badgeText = newText;
        } else if (selectedEl.id === 'signature') {
          this.scene.settings.signature = newText;
          this.scene.settings.signatureText = newText;
        } else if (selectedEl.id === 'scriptNote') {
          this.scene.settings.scriptNote = newText;
        }
        this.onProjectModified();
      }
      if (overlay) overlay.style.display = '';
      this.renderSelectionOverlay();
      cleanup();
    };

    const cancelChange = () => {
      if (isSaved) return;
      isSaved = true;
      editableTarget.contentEditable = 'false';
      editableTarget.style.outline = '';
      editableTarget.style.cursor = '';
      editableTarget.textContent = originalContent;
      if (overlay) overlay.style.display = '';
      this.renderSelectionOverlay();
      cleanup();
    };

    const onKeyDown = (e) => {
      // Stop propagation so global shortcuts NEVER intercept typing/backspace
      e.stopPropagation();

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commitChange();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelChange();
      }
    };

    const cleanup = () => {
      editableTarget.removeEventListener('blur', commitChange);
      editableTarget.removeEventListener('keydown', onKeyDown);
    };

    editableTarget.addEventListener('blur', commitChange);
    editableTarget.addEventListener('keydown', onKeyDown);
  }

  copySelectedElement() {
    const el = this.getSelectedElement();
    if (el) {
      this.copiedElement = JSON.parse(JSON.stringify(el));
    }
  }

  pasteCopiedElement() {
    if (!this.copiedElement || !this.scene) return;
    const newEl = JSON.parse(JSON.stringify(this.copiedElement));
    newEl.id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    newEl.name = `${newEl.name || 'Element'} (Copy)`;
    
    if (newEl.position) {
      newEl.position.x = (newEl.position.x || 50) + 4;
      newEl.position.y = (newEl.position.y || 50) + 4;
    }
    newEl.x = (newEl.x || 0) + 15;
    newEl.y = (newEl.y || 0) + 15;

    const elements = this.getElementsList();
    elements.push(newEl);
    this.selectElement(newEl.id);
    this.onProjectModified();
  }

  deleteSelectedElement() {
    if (!this.scene || !this.selectedElementId) return;
    if (Array.isArray(this.scene.elements)) {
      this.scene.elements = this.scene.elements.filter(e => e.id !== this.selectedElementId);
    }
    if (Array.isArray(this.scene.textElements)) {
      this.scene.textElements = this.scene.textElements.filter(e => e.id !== this.selectedElementId);
    }
    this.clearSelection();
    this.onProjectModified();
  }

  bindGlobalKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Never intercept when user is typing inside text inputs, textareas, or contenteditables
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable || document.querySelector('[contenteditable="true"]:focus')) {
        return;
      }

      const selectedEl = this.getSelectedElement();

      // Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedEl) {
          e.preventDefault();
          this.copySelectedElement();
        }
      }

      // Ctrl+V / Cmd+V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (this.copiedElement && !this.isLayoutLocked()) {
          e.preventDefault();
          this.pasteCopiedElement();
        }
      }

      // Delete (Only allowed in unlocked mode when canvas element is selected)
      if ((e.key === 'Delete') && selectedEl && !this.isLayoutLocked()) {
        e.preventDefault();
        this.deleteSelectedElement();
      }

      // Arrow Keys for small position adjustments (Only in unlocked mode)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedEl && !this.isLayoutLocked()) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        const posObj = selectedEl.position || selectedEl;
        if (e.key === 'ArrowUp') posObj.y = (posObj.y || 0) - step;
        if (e.key === 'ArrowDown') posObj.y = (posObj.y || 0) + step;
        if (e.key === 'ArrowLeft') posObj.x = (posObj.x || 0) - step;
        if (e.key === 'ArrowRight') posObj.x = (posObj.x || 0) + step;

        this.renderSelectionOverlay();
        this.onProjectModified();
      }
    });
  }
}
