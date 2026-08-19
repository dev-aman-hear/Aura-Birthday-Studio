/**
 * Birthday Studio - Text Element Sizing, Position & Style Engine
 * Text Control & Manipulation Helper (Section 6, Scene Data Architecture)
 */

export function getOrCreateTextElements(scene) {
  if (!scene) return [];
  if (Array.isArray(scene.elements) && scene.elements.length > 0) {
    scene.textElements = scene.elements;
    return scene.elements;
  }
  if (Array.isArray(scene.textElements) && scene.textElements.length > 0) {
    scene.elements = scene.textElements;
    return scene.textElements;
  }

  const settings = scene.settings || {};
  const defaultElements = [
    {
      id: 'title',
      name: 'Title / Heading',
      content: settings.titleText !== undefined ? settings.titleText : (scene.name || 'Scene Title'),
      fontFamily: settings.fontStyle || 'Outfit, sans-serif',
      fontSize: 32,
      fontWeight: '800',
      color: settings.textColor || '#ffffff',
      opacity: 1,
      align: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      x: 0,
      y: 0,
      width: 'auto',
      height: 'auto',
      rotation: 0,
      visible: true
    },
    {
      id: 'subtitle',
      name: 'Subtitle / Message',
      content: settings.subtitleText !== undefined ? settings.subtitleText : (settings.textContent !== undefined ? settings.textContent : 'Your celebration message here.'),
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      fontWeight: '400',
      color: '#e2e8f0',
      opacity: 0.9,
      align: 'center',
      lineHeight: 1.5,
      letterSpacing: 0,
      x: 0,
      y: 0,
      width: 'auto',
      height: 'auto',
      rotation: 0,
      visible: true
    },
    {
      id: 'badge',
      name: 'Badge / Label',
      content: settings.badgeText !== undefined ? settings.badgeText : '✨ SPECIAL CELEBRATION ✨',
      fontFamily: 'Outfit, sans-serif',
      fontSize: 13,
      fontWeight: '700',
      color: '#ffd700',
      opacity: 1,
      align: 'center',
      lineHeight: 1.2,
      letterSpacing: 1,
      x: 0,
      y: 0,
      width: 'auto',
      height: 'auto',
      rotation: 0,
      visible: true
    }
  ];

  scene.elements = defaultElements;
  scene.textElements = defaultElements;
  return scene.elements;
}

export function getTextElementStyle(el) {
  if (!el) return '';
  const vis = el.visible !== false;
  const op = (el.opacity !== undefined && el.opacity !== 1) ? `opacity: ${el.opacity};` : '';
  const rot = el.rotation || 0;
  const x = el.x || 0;
  const y = el.y || 0;

  const styles = [
    `display: ${vis ? 'inline-block' : 'none'}`,
    el.customFont ? `font-family: ${el.customFont}` : '',
    el.customSize ? `font-size: ${typeof el.customSize === 'number' ? `${el.customSize}px` : el.customSize}` : '',
    el.customWeight ? `font-weight: ${el.customWeight}` : '',
    el.customColor ? `color: ${el.customColor}` : '',
    el.align && el.align !== 'center' ? `text-align: ${el.align}` : '',
    el.customLineHeight ? `line-height: ${el.customLineHeight}` : '',
    el.customLetterSpacing !== undefined ? `letter-spacing: ${typeof el.customLetterSpacing === 'number' ? `${el.customLetterSpacing}px` : el.customLetterSpacing}` : '',
    op,
    (x || y || rot) ? `transform: translate(${x}px, ${y}px) rotate(${rot}deg)` : '',
    el.width && el.width !== 'auto' ? `width: ${typeof el.width === 'number' ? `${el.width}px` : el.width}` : '',
    el.height && el.height !== 'auto' ? `height: ${typeof el.height === 'number' ? `${el.height}px` : el.height}` : ''
  ].filter(Boolean);

  return styles.join('; ');
}


import { escapeHTML } from '../utils/Security.js';

export function renderTextElementHTML(scene, elementId, fallbackText = '', fallbackClass = '') {
  const elements = getOrCreateTextElements(scene);
  const el = elements.find(e => e.id === elementId);

  let content = fallbackText;
  if (el && el.content !== undefined && el.content !== null) {
    content = el.content;
  } else if (scene.settings && scene.settings[elementId + 'Text'] !== undefined && scene.settings[elementId + 'Text'] !== null) {
    content = scene.settings[elementId + 'Text'];
  }

  const style = el ? getTextElementStyle(el) : '';
  return `<span class="editable-text-element ${fallbackClass}" data-text-id="${elementId}" style="${style}">${escapeHTML(content)}</span>`;
}

export function updateTextElement(scene, elementId, updates = {}) {
  const elements = getOrCreateTextElements(scene);
  let el = elements.find(e => e.id === elementId);
  if (!el) {
    el = {
      id: elementId,
      name: elementId.charAt(0).toUpperCase() + elementId.slice(1),
      content: updates.content || '',
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      fontWeight: '400',
      color: '#ffffff',
      opacity: 1,
      align: 'center',
      lineHeight: 1.4,
      letterSpacing: 0,
      x: 0,
      y: 0,
      width: 'auto',
      height: 'auto',
      rotation: 0,
      visible: true
    };
    elements.push(el);
  }

  Object.assign(el, updates);
  if (updates.content !== undefined) {
    if (!scene.settings) scene.settings = {};
    if (elementId === 'title') {
      scene.settings.titleText = updates.content;
      scene.name = updates.content || scene.name;
    } else if (elementId === 'subtitle') {
      scene.settings.subtitleText = updates.content;
      scene.settings.textContent = updates.content;
      scene.settings.messageText = updates.content;
    } else if (elementId === 'badge') {
      scene.settings.badgeText = updates.content;
    } else if (elementId === 'signature') {
      scene.settings.signature = updates.content;
      scene.settings.signatureText = updates.content;
    } else if (elementId === 'scriptNote') {
      scene.settings.scriptNote = updates.content;
    }
  }
  return el;
}

export function resetTextElement(scene, elementId) {
  const elements = getOrCreateTextElements(scene);
  const idx = elements.findIndex(e => e.id === elementId);
  if (idx !== -1) {
    elements[idx] = {
      id: elementId,
      name: elementId === 'title' ? 'Title / Heading' : (elementId === 'subtitle' ? 'Subtitle / Message' : 'Badge / Label'),
      content: elementId === 'title' ? (scene.name || 'Scene Title') : (elementId === 'subtitle' ? 'Your celebration message here.' : '✨ SPECIAL CELEBRATION ✨'),
      fontFamily: 'Outfit, sans-serif',
      fontSize: elementId === 'title' ? 32 : (elementId === 'subtitle' ? 16 : 13),
      fontWeight: elementId === 'title' ? '800' : '400',
      color: elementId === 'badge' ? '#ffd700' : '#ffffff',
      opacity: 1,
      align: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      x: 0,
      y: 0,
      width: 'auto',
      height: 'auto',
      rotation: 0,
      visible: true
    };
  }
}
