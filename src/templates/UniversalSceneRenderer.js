/**
 * Birthday Studio - Universal Scene Renderer Engine
 * Renders fully customizable scenes combining TEMPLATE (design & animation) + CONTENT (user text & media)
 * Supports Dynamic (%) vs Fixed (px) Positioning, Layer Ordering, and Cinematic Animations
 */

import { renderHeroTemplate } from './HeroTemplate.js';
import { renderRevealTemplate } from './RevealTemplate.js';
import { renderGalleryTemplate } from './GalleryTemplate.js';
import { renderVideoTemplate } from './VideoTemplate.js';
import { renderTimelineTemplate } from './TimelineTemplate.js';
import { renderMessageTemplate } from './MessageTemplate.js';
import { renderCollageTemplate } from './CollageTemplate.js';
import { renderFullscreenTemplate } from './FullscreenTemplate.js';
import { renderWishTemplate } from './WishTemplate.js';
import { renderWishWallSceneTemplate } from './WishWallSceneTemplate.js';
import {
  renderSpecialCinematicIntro,
  renderSpecialChildhoodMemories,
  renderSpecialMemorySequence,
  renderSpecialCollageGallery,
  renderSpecialChaosMontage,
  renderSpecialLetterReveal,
  renderSpecialFakeEnding,
  renderSpecial3DGiftReveal,
  renderSpecialBirthdayReveal,
  renderSpecialBonusMemories,
  renderSpecialEmotionalFinale
} from './special/SpecialSceneTemplates.js';
import { PresetService } from '../services/PresetService.js';
import { StyleRegistry } from '../data/styles/StyleRegistry.js';
import { resolveTemplateId } from './TemplateRegistry.js';
import { escapeHTML, sanitizeUrl } from '../utils/Security.js';

export class UniversalSceneRenderer {
  /**
   * Renders a scene using the Universal Engine
   */
  static renderScene(scene, project = {}, assets = [], options = {}) {
    if (!scene) return '<div class="empty-scene">No scene provided</div>';

    const style = StyleRegistry.getStyleById(
      options.styleId || project?.theme || project?.settings?.styleConfig?.id || scene.settings?.styleId
    );
    const styleCssVars = StyleRegistry.getStyleInlineCssString(style);

    const elements = Array.isArray(scene.elements) && scene.elements.length > 0
      ? scene.elements
      : (Array.isArray(scene.textElements) ? scene.textElements : []);

    // Build replacement map from project personalizations
    const recName = project?.recipient?.name || 'Recipient Name';
    const sndName = project?.creatorDisplayName || project?.creator?.name || 'Your Name';
    const replacements = {
      name: recName,
      recipientName: recName,
      recipient: recName,
      sender: sndName,
      senderName: sndName,
      creatorName: sndName,
      occasion: project?.occasion || 'Birthday',
      message: project?.recipient?.description || 'Wishing you all the happiness in the world!',
      customMessage: project?.recipient?.description || 'Wishing you all the happiness in the world!',
      age: project?.recipient?.age ? `${project.recipient.age}` : '',
      date: project?.birthdayDate || '15 • 08 • 2026',
      birthdayDate: project?.birthdayDate || '15 August 2026',
      photo1: assets.find(a => a.id === scene.slots?.hero_image || a.id === scene.slots?.hero_photo || a.id === scene.slots?.fullscreen_image || a.id === scene.slots?.reveal_photo || a.id === scene.slots?.celebration_photo || a.type === 'image')?.renderUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
      photo2: assets.filter(a => a.type === 'image')[1]?.renderUrl || 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      photo3: assets.filter(a => a.type === 'image')[2]?.renderUrl || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      video1: assets.find(a => a.id === scene.slots?.main_video || a.type === 'video')?.renderUrl || '',
      signature: project?.signature || `— With love, ${sndName}`,
      ...(project?.templateVariables || {})
    };

    // A scene is rendered as custom element canvas ONLY IF it has custom elements
    // AND is a universal/custom canvas template, NOT a structured template like hero/reveal/special!
    const isCustomCanvas = Array.isArray(scene.elements) && scene.elements.length > 0 &&
      (!scene.template || scene.template === 'universal' || scene.template === 'custom' || scene.template === 'blank');

    if (isCustomCanvas) {
      return this.renderCustomElementsCanvas(scene, scene.elements, replacements, assets, options, style, styleCssVars);
    }

    // Otherwise fallback to structured cinematic scene templates
    const innerHtml = this.renderLegacyTemplate(scene, project, assets, options);
    return `
      <div class="universal-scene-viewport theme-wrapper theme-${style.id}" style="width:100%; height:100%; position:relative; overflow:hidden; container-type:inline-size; container-name:sceneCanvas; ${styleCssVars}">
        ${innerHtml}
      </div>
    `;
  }

  /**
   * Universal Canvas Renderer for Scenes with Custom Elements
   */
  static renderCustomElementsCanvas(scene, rawElements, replacements, assets, options, style, styleCssVars) {
    const bg = scene.settings?.bgGradient || scene.settings?.bgColor || style?.background?.gradient || 'linear-gradient(135deg, #1e1b2e 0%, #0f0c1b 100%)';
    const overlay = style?.background?.overlayPattern && style.background.overlayPattern !== 'none' ? style.background.overlayPattern : '';
    const sortedElements = [...rawElements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

    const elementsHtml = sortedElements.map(el => {
      if (el.visible === false) return '';

      // Compute text/image/shape content with interpolated variables
      let rawContent = el.content || '';
      let content = PresetService.interpolate(rawContent, replacements);

      // Asset resolution for image/video elements
      if ((el.type === 'image' || el.type === 'video') && (!content || content.startsWith('asset_'))) {
        const foundAsset = assets.find(a => a.id === content || a.id === el.assetId);
        if (foundAsset?.renderUrl) {
          content = foundAsset.renderUrl;
        } else if (assets.length > 0) {
          content = assets[0].renderUrl || replacements.photo1;
        } else {
          content = replacements.photo1;
        }
      }

      // Compute Positioning Style (Dynamic % vs Fixed px)
      const mode = el.position?.mode || (typeof el.x === 'string' && el.x.includes('%') ? 'dynamic' : 'dynamic');
      let posX = el.position?.x !== undefined ? el.position.x : (el.x !== undefined ? el.x : null);
      let posY = el.position?.y !== undefined ? el.position.y : (el.y !== undefined ? el.y : null);
      const anchor = el.position?.anchor || 'center';

      // Fallback default coordinates if not explicitly positioned
      if (posX === null || posX === undefined || (posX === 0 && posY === 0 && !el.isCustomPositioned)) {
        if (el.role === 'badge' || el.name?.toLowerCase().includes('badge')) { posX = 50; posY = 18; }
        else if (el.role === 'title' || el.name?.toLowerCase().includes('title') || el.name?.toLowerCase().includes('heading')) { posX = 50; posY = 38; }
        else if (el.role === 'subtitle' || el.name?.toLowerCase().includes('sub') || el.name?.toLowerCase().includes('desc')) { posX = 50; posY = 62; }
        else { posX = 50; posY = 50; }
      }

      let transformStr = '';
      let posStyle = '';

      if (mode === 'dynamic') {
        const xPct = typeof posX === 'number' ? `${posX}%` : posX;
        const yPct = typeof posY === 'number' ? `${posY}%` : posY;

        let anchorTranslate = 'translate(-50%, -50%)';
        if (anchor === 'top-left') anchorTranslate = 'translate(0, 0)';
        if (anchor === 'top-center') anchorTranslate = 'translate(-50%, 0)';
        if (anchor === 'top-right') anchorTranslate = 'translate(-100%, 0)';
        if (anchor === 'center-left') anchorTranslate = 'translate(0, -50%)';
        if (anchor === 'center-right') anchorTranslate = 'translate(-100%, -50%)';
        if (anchor === 'bottom-left') anchorTranslate = 'translate(0, -100%)';
        if (anchor === 'bottom-center') anchorTranslate = 'translate(-50%, -100%)';
        if (anchor === 'bottom-right') anchorTranslate = 'translate(-100%, -100%)';

        transformStr = `${anchorTranslate} rotate(${el.rotation || 0}deg)`;
        posStyle = `left: ${xPct}; top: ${yPct}; transform: ${transformStr};`;
      } else {
        const xPx = typeof posX === 'number' ? `${posX}px` : posX;
        const yPx = typeof posY === 'number' ? `${posY}px` : posY;
        transformStr = `rotate(${el.rotation || 0}deg)`;
        posStyle = `left: ${xPx}; top: ${yPx}; transform: ${transformStr};`;
      }

      // Compute Size Style
      let widthStyle = 'width: auto;';
      if (el.size?.width !== undefined || el.width !== undefined) {
        const w = el.size?.width !== undefined ? el.size.width : el.width;
        widthStyle = `width: ${typeof w === 'number' ? (mode === 'dynamic' ? `${w}%` : `${w}px`) : w};`;
      }

      let heightStyle = 'height: auto;';
      if (el.size?.height !== undefined || el.height !== undefined) {
        const h = el.size?.height !== undefined ? el.size.height : el.height;
        if (h && h !== 'auto') {
          heightStyle = `height: ${typeof h === 'number' ? (mode === 'dynamic' ? `${h}%` : `${h}px`) : h};`;
        }
      }

      // Animation & Visual Styles
      const animClass = el.animation ? `anim-${el.animation}` : 'anim-fadeIn';
      const zIndexStyle = `z-index: ${el.zIndex || 1};`;
      const opacityStyle = `opacity: ${el.opacity !== undefined ? el.opacity : 1};`;
      const commonStyle = `position: absolute; ${posStyle} ${widthStyle} ${heightStyle} ${zIndexStyle} ${opacityStyle}`;

      // Render Element by Type
      switch (el.type) {
        case 'image': {
          const fit = el.fit || 'cover';
          const radius = el.borderRadius ? `${el.borderRadius}px` : (style?.elements?.cardRadius || '12px');
          const safeUrl = sanitizeUrl(content, replacements.photo1);
          return `
            <div class="universal-element element-image" data-element-id="${el.id}" data-text-id="${el.id}" style="${commonStyle}">
              <div class="element-anim-wrapper ${animClass}" style="width:100%; height:100%; position:relative;">
                <img src="${safeUrl}" alt="${escapeHTML(el.name || 'Image')}" style="width:100%; height:100%; object-fit:${fit}; border-radius:${radius}; box-shadow: 0 10px 30px rgba(0,0,0,0.3); pointer-events:none; display:block;" />
              </div>
            </div>
          `;
        }
        case 'video': {
          const radius = el.borderRadius ? `${el.borderRadius}px` : (style?.elements?.cardRadius || '12px');
          const safeUrl = sanitizeUrl(content, '');
          return `
            <div class="universal-element element-video" data-element-id="${el.id}" data-text-id="${el.id}" style="${commonStyle}">
              <div class="element-anim-wrapper ${animClass}" style="width:100%; height:100%; position:relative;">
                <video src="${safeUrl}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover; border-radius:${radius}; pointer-events:none; display:block;"></video>
              </div>
            </div>
          `;
        }
        case 'shape': {
          const fill = el.fillColor || style?.colors?.surface || 'rgba(255,255,255,0.1)';
          const border = el.border || `1px solid ${style?.colors?.border || 'rgba(255,255,255,0.2)'}`;
          const radius = el.borderRadius !== undefined ? `${el.borderRadius}px` : '50%';
          return `
            <div class="universal-element element-shape" data-element-id="${el.id}" data-text-id="${el.id}" style="${commonStyle} cursor:pointer;">
              <div class="element-anim-wrapper ${animClass}" style="width:100%; height:100%; background:${fill}; border:${border}; border-radius:${radius}; display:flex; align-items:center; justify-content:center; font-size:${el.fontSize || 32}px;">
                ${escapeHTML(content)}
              </div>
            </div>
          `;
        }
        case 'text':
        default: {
          const isTitleRole = el.role === 'title' || el.role === 'heading' || el.role === 'badge' || (!el.role && (el.name?.toLowerCase().includes('title') || el.name?.toLowerCase().includes('heading') || el.name?.toLowerCase().includes('badge')));
          const isSubtitleOrBody = el.role === 'subtitle' || el.role === 'body' || el.role === 'description' || el.role === 'message' || (!el.role && (el.name?.toLowerCase().includes('sub') || el.name?.toLowerCase().includes('desc') || el.name?.toLowerCase().includes('msg') || el.name?.toLowerCase().includes('message')));

          let font = el.customFont || el.fontFamily;
          if (!font || font === 'inherit' || font.includes('sans-serif') || font.includes('serif')) {
            font = isSubtitleOrBody
              ? (style?.typography?.bodyFont || "'Inter', sans-serif")
              : (style?.typography?.headingFont || "'Outfit', sans-serif");
          }

          const rawSize = typeof el.fontSize === 'number' ? el.fontSize : (parseInt(el.fontSize, 10) || (isTitleRole ? 32 : 16));
          const weight = el.fontWeight || (isTitleRole ? '800' : '400');
          const color = el.color || (isTitleRole ? style?.colors?.text : style?.colors?.textMuted) || '#ffffff';
          const align = el.align || 'center';
          const letterSpacing = el.letterSpacing !== undefined && el.letterSpacing !== '' 
            ? `${el.letterSpacing}px` 
            : (isTitleRole ? (style?.typography?.headingLetterSpacing || '0px') : 'normal');
          const lineHeight = el.lineHeight || (isTitleRole ? 1.15 : 1.45);

          const minSize = Math.max(12, Math.round(rawSize * 0.5));
          const maxSize = Math.round(rawSize * 1.3);
          const fluidFontSize = options.isRawFontSize 
            ? `${rawSize}px` 
            : `clamp(${minSize}px, calc(${minSize}px + (${rawSize - minSize}) * ((100cqi - 280px) / 440)), ${maxSize}px)`;

          const textBoundingStyle = `box-sizing: border-box; max-width: 92%; overflow-wrap: break-word; word-break: break-word;`;

          return `
            <div class="universal-element element-text" data-element-id="${el.id}" data-text-id="${el.id}" style="${commonStyle} ${textBoundingStyle} font-family:${font}; font-size:${fluidFontSize}; font-weight:${weight}; color:${color}; text-align:${align}; letter-spacing:${letterSpacing}; line-height:${lineHeight}; cursor:pointer;">
              <div class="element-anim-wrapper ${animClass}" style="width:100%; height:100%;">
                ${escapeHTML(content)}
              </div>
            </div>
          `;
        }
      }
    }).join('');

    const overlayDiv = overlay ? `<div class="viewport-theme-overlay" style="position:absolute; inset:0; background:${overlay}; pointer-events:none; z-index:0;"></div>` : '';

    return `
      <div class="universal-scene-viewport theme-wrapper theme-${style?.id || 'default'}" style="width:100%; height:100%; position:relative; background:${bg}; overflow:hidden; container-type:inline-size; container-name:sceneCanvas; ${styleCssVars || ''}">
        ${overlayDiv}
        ${elementsHtml}
      </div>
    `;
  }

  /**
   * Internal router for structured legacy and special templates
   */
  static renderLegacyTemplate(scene, project, assets, options) {
    const rawTemplateId = scene.template || 'hero';
    const templateId = resolveTemplateId(rawTemplateId);

    switch (templateId) {
      case 'hero':
        return renderHeroTemplate(scene, project, assets, options);
      case 'reveal':
        return renderRevealTemplate(scene, project, assets, options);
      case 'photo_gallery':
        return renderGalleryTemplate(scene, project, assets, options);
      case 'video_showcase':
        return renderVideoTemplate(scene, project, assets, options);
      case 'memory_timeline':
        return renderTimelineTemplate(scene, project, assets, options);
      case 'message':
        return renderMessageTemplate(scene, project, assets, options);
      case 'collage':
        return renderCollageTemplate(scene, project, assets, options);
      case 'fullscreen_photo':
        return renderFullscreenTemplate(scene, project, assets, options);
      case 'final_wish':
        return renderWishTemplate(scene, project, assets, options);
      case 'wish-wall':
        return renderWishWallSceneTemplate(scene, project, assets, options);
      // Canonical 11 Special & Cinematic Animation Templates
      case 'special_cinematic_intro':
        return renderSpecialCinematicIntro(scene, project, assets, options);
      case 'special_childhood_memories':
        return renderSpecialChildhoodMemories(scene, project, assets, options);
      case 'special_memory_sequence':
        return renderSpecialMemorySequence(scene, project, assets, options);
      case 'special_collage_gallery':
        return renderSpecialCollageGallery(scene, project, assets, options);
      case 'special_chaos_montage':
        return renderSpecialChaosMontage(scene, project, assets, options);
      case 'special_letter_reveal':
        return renderSpecialLetterReveal(scene, project, assets, options);
      case 'special_fake_ending':
        return renderSpecialFakeEnding(scene, project, assets, options);
      case 'special_3d_gift_reveal':
        return renderSpecial3DGiftReveal(scene, project, assets, options);
      case 'special_birthday_reveal':
        return renderSpecialBirthdayReveal(scene, project, assets, options);
      case 'special_bonus_memories':
        return renderSpecialBonusMemories(scene, project, assets, options);
      case 'special_emotional_finale':
        return renderSpecialEmotionalFinale(scene, project, assets, options);
      default:
        return renderHeroTemplate(scene, project, assets, options);
    }
  }
}
