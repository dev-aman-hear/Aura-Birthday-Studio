/**
 * Birthday Studio - Scene Model
 * Supports Universal Elements (Text, Image, Shape, Video) with Dynamic/Fixed Positioning
 * and Semantic Asset Slot Management
 */

export class Scene {
  constructor(data = {}) {
    this.id = data.id || `scene_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.name = data.name || 'New Scene';
    this.template = data.template || 'hero'; // hero, reveal, photo_gallery, video_showcase, memory_timeline, message, collage, fullscreen_photo, final_wish, wish-wall, universal
    this.order = typeof data.order === 'number' ? data.order : 0;
    
    // Max 15 asset IDs allowed per scene
    this.assetIds = Array.isArray(data.assetIds) ? data.assetIds.slice(0, 15) : [];
    
    // Semantic Slot Assignments: { slotId: assetId | [assetId1, assetId2] }
    this.slots = typeof data.slots === 'object' && data.slots !== null ? { ...data.slots } : {};
    this.media = typeof data.media === 'object' && data.media !== null ? { ...data.media } : {};

    // Support elements list (with textElements alias for backwards compatibility)
    const rawElements = Array.isArray(data.elements) ? data.elements : (Array.isArray(data.textElements) ? data.textElements : []);
    this.elements = rawElements.map(el => Scene.normalizeElement(el));
    this.textElements = this.elements; // Backwards compatibility reference

    this.settings = {
      bgColor: '#1e1b2e',
      bgGradient: 'linear-gradient(135deg, #1e1b2e 0%, #0f0c1b 100%)',
      textColor: '#ffffff',
      fontStyle: 'inter',
      overlayOpacity: 0.2,
      displayMode: 'counter-and-wishes',
      maxDisplayed: 50,
      sort: 'newest',
      ...data.settings
    };
    this.transition = data.transition || 'fade';
    this.duration = data.duration || 6;
    this.lockedLayout = data.lockedLayout !== undefined ? data.lockedLayout : true;
    this.referenceWidth = data.referenceWidth || 1080;
    this.referenceHeight = data.referenceHeight || 1920;
  }

  static get MAX_ASSETS() {
    return 15;
  }

  static normalizeElement(el) {
    if (!el) return el;
    const mode = el.position?.mode || (typeof el.x === 'string' && el.x.includes('%') ? 'dynamic' : (el.positionMode || 'dynamic'));
    const xVal = el.position?.x !== undefined ? el.position.x : (el.x !== undefined ? parseFloat(el.x) : (mode === 'dynamic' ? 50 : 0));
    const yVal = el.position?.y !== undefined ? el.position.y : (el.y !== undefined ? parseFloat(el.y) : (mode === 'dynamic' ? 50 : 0));
    const anchor = el.position?.anchor || el.anchor || 'center';

    const widthVal = el.size?.width !== undefined ? el.size.width : (el.width !== undefined ? el.width : (mode === 'dynamic' ? 80 : 300));
    const heightVal = el.size?.height !== undefined ? el.size.height : (el.height !== undefined ? el.height : (mode === 'dynamic' ? 'auto' : 100));
    const sizeMode = el.size?.mode || mode;

    return {
      id: el.id || `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: el.type || 'text', // text, image, shape, video
      name: el.name || (el.type ? el.type.toUpperCase() : 'Element'),
      content: el.content !== undefined ? el.content : '',
      slotId: el.slotId || null, // Optional binding to semantic slot
      assetId: el.assetId || null,
      
      // Dynamic vs Fixed Positioning
      position: {
        mode: mode, // 'dynamic' | 'fixed'
        x: xVal,
        y: yVal,
        anchor: anchor // 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right'
      },
      size: {
        mode: sizeMode,
        width: widthVal,
        height: heightVal
      },

      // Typography & Text
      fontFamily: el.fontFamily || 'Outfit, sans-serif',
      fontSize: el.fontSize !== undefined ? el.fontSize : 32,
      fontWeight: el.fontWeight || '700',
      color: el.color || '#ffffff',
      align: el.align || 'center',
      letterSpacing: el.letterSpacing !== undefined ? el.letterSpacing : 0,
      lineHeight: el.lineHeight !== undefined ? el.lineHeight : 1.2,

      // Visual & Box Styles
      fillColor: el.fillColor || el.bgColor || 'transparent',
      border: el.border || 'none',
      borderRadius: el.borderRadius !== undefined ? el.borderRadius : 0,
      fit: el.fit || 'cover', // 'cover', 'contain', 'fill'
      opacity: el.opacity !== undefined ? el.opacity : 1,
      rotation: el.rotation !== undefined ? el.rotation : 0,
      zIndex: el.zIndex !== undefined ? el.zIndex : 1,
      visible: el.visible !== false,

      // Animation Specs
      animation: el.animation || 'fadeIn', // cinematicTextReveal, blur_reveal, ken_burns, pop, float, slide_up
      exitAnimation: el.exitAnimation || 'none',

      // Keep legacy x/y props synchronized for backwards compatibility
      x: xVal,
      y: yVal,
      width: widthVal,
      height: heightVal
    };
  }

  canAddAsset() {
    return this.assetIds.length < Scene.MAX_ASSETS;
  }

  getSlotAsset(slotId) {
    return this.slots[slotId] || null;
  }

  setSlotAsset(slotId, assetId) {
    if (!this.slots) this.slots = {};
    if (assetId) {
      this.slots[slotId] = assetId;
      if (!this.assetIds.includes(assetId)) {
        this.assetIds.push(assetId);
      }
    } else {
      delete this.slots[slotId];
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      template: this.template,
      order: this.order,
      assetIds: this.assetIds,
      slots: this.slots,
      media: this.media,
      elements: this.elements,
      textElements: this.elements,
      settings: this.settings,
      transition: this.transition,
      duration: this.duration,
      lockedLayout: this.lockedLayout,
      referenceWidth: this.referenceWidth,
      referenceHeight: this.referenceHeight
    };
  }
}


