/**
 * Birthday Studio - Special Scene Templates
 * Exact 1-to-1 HTML DOM structures matching the 15th Aug Short Film Project
 * Fully editable and reactive with live scene.settings configuration.
 */

import { PresetService } from '../../services/PresetService.js';
import { resolveGiftContent } from '../../animations/SpecialAnimationEngine.js';

export function renderSpecialCinematicIntro(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const dateStr = scene.settings?.dateHeader || replacements.date || '15 August';
  const l1 = PresetService.interpolate(scene.settings?.line1 || 'A DAY LIKE ANY OTHER...', replacements);
  const l2 = PresetService.interpolate(scene.settings?.line2 || "EXCEPT IT WASN'T.", replacements);
  const l3 = PresetService.interpolate(scene.settings?.line3 || 'SOMEONE SPECIAL CAME INTO THIS WORLD.', replacements);
  const l4 = PresetService.interpolate(scene.settings?.ctaSubtext || scene.settings?.line4 || 'YOUR STORY STARTS HERE.', replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'BEGIN', replacements);

  return `
    <div class="special-scene-viewport" id="scene-1">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>
      <canvas class="special-scene-canvas-overlay" id="specialIntroCanvas"></canvas>

      <div class="intro-text-sequence" id="intro-sequence">
        <p class="cinematic-date-text" id="intro-line-1">${dateStr}</p>
        <p class="cinematic-line" id="intro-line-2">${l1}</p>
        <p class="cinematic-line highlight" id="intro-line-3">${l2}</p>
        <p class="cinematic-line" id="intro-line-4">${l3}</p>
        <p class="cinematic-cta-line" id="intro-line-5">${l4}</p>
        <button id="btn-begin-experience" class="btn-begin-cinematic" aria-label="Begin Interactive Experience">${btnText}</button>
      </div>
    </div>
  `;
}

export function renderSpecialChildhoodMemories(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const introL1 = PresetService.interpolate(scene.settings?.introLine1 || 'Before I knew it...', replacements);
  const introL2 = PresetService.interpolate(scene.settings?.introLine2 || 'You became part of my world.', replacements);
  const outroL1 = PresetService.interpolate(scene.settings?.outroLine1 || 'Years passed.', replacements);
  const outroL2 = PresetService.interpolate(scene.settings?.outroLine2 || 'And you grew up.', replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'CONTINUE →', replacements);

  return `
    <div class="special-scene-viewport" id="scene-2">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>

      <div class="scene2-container">
        <!-- Stage 1: Intro Paced Thoughts -->
        <div class="scene2-text-overlay active" id="scene2-intro-container">
          <p class="scene2-line" id="scene2-intro-line1">${introL1}</p>
          <p class="scene2-line highlight" id="scene2-intro-line2">${introL2}</p>
        </div>

        <!-- Stage 2: Memory Viewport Frame -->
        <div class="scene2-memory-stage" id="scene2-memory-stage">
          <div class="scene2-viewport" id="scene2-viewport">
            <div class="scene2-image-container" id="scene2-image-container"></div>
            <div class="scene2-vignette-inner"></div>
          </div>
          <div class="scene2-caption-box" id="scene2-caption-box">
            <p class="scene2-caption-text" id="scene2-caption-text"></p>
          </div>
          <div class="scene2-dots-indicator" id="scene2-dots-indicator" role="tablist"></div>
        </div>

        <!-- Stage 3: Outro Paced Thoughts -->
        <div class="scene2-text-overlay" id="scene2-outro-container">
          <p class="scene2-line" id="scene2-outro-line1">${outroL1}</p>
          <p class="scene2-line highlight" id="scene2-outro-line2">${outroL2}</p>
        </div>

        <button id="btn-scene2-continue" class="btn-scene-action scene2-continue-btn">${btnText}</button>
      </div>
    </div>
  `;
}

export function renderSpecialMemorySequence(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const introL1 = PresetService.interpolate(scene.settings?.introLine1 || 'Some moments become memories.', replacements);
  const introL2 = PresetService.interpolate(scene.settings?.introLine2 || 'And some memories stay forever.', replacements);
  const outroL1 = PresetService.interpolate(scene.settings?.outroLine1 || 'Some memories become part of who we are.', replacements);
  const outroL2 = PresetService.interpolate(scene.settings?.outroLine2 || "And there are some things I've never said.", replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'NEXT →', replacements);

  return `
    <div class="special-scene-viewport" id="scene-3">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>

      <div class="scene3-container">
        <div class="scene3-text-overlay active" id="scene3-intro-container">
          <p class="scene3-intro-line" id="scene3-intro-line1">${introL1}</p>
          <p class="scene3-intro-line highlight" id="scene3-intro-line2">${introL2}</p>
        </div>

        <div class="scene3-stage" id="scene3-stage">
          <div class="scene3-header">
            <div class="scene3-header-left">
              <span class="scene3-year-badge" id="scene3-year-badge">2010</span>
              <h2 class="scene3-memory-title" id="scene3-memory-title">WHERE IT ALL BEGAN</h2>
            </div>
            <span class="scene3-chapter-counter" id="scene3-chapter-counter">01 / 08</span>
          </div>

          <div class="scene3-media-wrapper">
            <button class="scene3-nav-btn" id="scene3-btn-prev" aria-label="Previous Memory">‹</button>
            <div class="scene3-viewport" id="scene3-viewport">
              <div class="scene3-media-container" id="scene3-media-container"></div>
            </div>
            <button class="scene3-nav-btn" id="scene3-btn-next" aria-label="Next Memory">›</button>
          </div>

          <div class="scene3-caption-box">
            <p class="scene3-caption-text" id="scene3-caption-text"></p>
          </div>

          <div class="scene3-timeline-track" id="scene3-timeline-track">
            <div class="timeline-line"></div>
            <div class="timeline-nodes-container" id="scene3-timeline-nodes" style="display:flex; justify-content:space-between; width:100%; position:relative; z-index:5;"></div>
          </div>
        </div>

        <div class="scene3-text-overlay" id="scene3-outro-container">
          <p class="scene3-intro-line" id="scene3-outro-line1">${outroL1}</p>
          <p class="scene3-intro-line highlight" id="scene3-outro-line2">${outroL2}</p>
        </div>

        <button id="btn-scene3-next" class="btn-scene-action scene3-continue-btn">${btnText}</button>
      </div>
    </div>
  `;
}

export function renderSpecialCollageGallery(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const title = PresetService.interpolate(scene.settings?.titleText || scene.settings?.title || 'UNFORGETTABLE MOMENTS', replacements);
  const subtitle = PresetService.interpolate(scene.settings?.subtitleText || scene.settings?.subtitle || 'Some people become memories. Some people become home.', replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'NEXT →', replacements);

  return `
    <div class="special-scene-viewport" id="scene-4">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>

      <div class="scene4-container">
        <div class="scene4-header">
          <h2 class="scene4-title" id="scene4-title">${title}</h2>
          <p class="scene4-subtitle" id="scene4-subtitle">${subtitle}</p>
        </div>

        <div class="scene4-photo-stage">
          <div class="scene4-viewport" id="scene4-viewport">
            <div class="scene4-photo-container" id="scene4-photo-container"></div>
          </div>
        </div>

        <div class="scene4-caption-box">
          <p class="scene4-caption-text" id="scene4-caption-text"></p>
        </div>

        <div class="scene4-dots-indicator" id="scene4-dots-indicator" role="tablist"></div>
        <button id="btn-scene4-next" class="btn-scene-action scene4-continue-btn">${btnText}</button>
      </div>
    </div>
  `;
}

export function renderSpecialChaosMontage(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const introL1 = PresetService.interpolate(scene.settings?.introLine1 || "Let's talk about the real you.", replacements);
  const introL2 = PresetService.interpolate(scene.settings?.introLine2 || "Because let's be honest...", replacements);
  const introL3 = PresetService.interpolate(scene.settings?.introLine3 || 'You can be a little chaotic. 😜', replacements);
  const outroL1 = PresetService.interpolate(scene.settings?.outroLine1 || 'Okay. Maybe I exaggerate a little.', replacements);
  const outroL2 = PresetService.interpolate(scene.settings?.outroLine2 || 'Or maybe not. 😜', replacements);
  const bridgeL1 = PresetService.interpolate(scene.settings?.bridgeLine1 || "Okay... I'll stop embarrassing you. Probably.", replacements);
  const bridgeL2 = PresetService.interpolate(scene.settings?.bridgeLine2 || 'But there is something I actually wanted to give you.', replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'NEXT →', replacements);

  return `
    <div class="special-scene-viewport" id="scene-5">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>

      <div class="scene5-container">
        <div class="scene5-text-overlay active" id="scene5-intro-container">
          <p class="scene5-intro-line" id="scene5-intro-line1">${introL1}</p>
          <p class="scene5-intro-line highlight" id="scene5-intro-line2">${introL2}</p>
          ${scene.settings?.introLine3 ? `<p class="scene5-intro-line" id="scene5-intro-line3">${introL3}</p>` : ''}
        </div>

        <div class="scene5-card-stage" id="scene5-card-stage">
          <div class="scene5-viewport" id="scene5-viewport">
            <div class="scene5-media-container" id="scene5-media-container"></div>
          </div>
          <div class="scene5-card-content">
            <h3 class="scene5-card-title" id="scene5-card-title">24/7 TROUBLE GENERATOR</h3>
            <p class="scene5-card-subtitle" id="scene5-card-subtitle">Causes drama, then blames the nearest person.</p>
          </div>
        </div>

        <div class="scene5-text-overlay" id="scene5-outro-container">
          <p class="scene5-intro-line" id="scene5-outro-line1">${outroL1}</p>
          <p class="scene5-intro-line highlight" id="scene5-outro-line2">${outroL2}</p>
        </div>

        <div class="scene5-text-overlay" id="scene5-bridge-container">
          <p class="scene5-intro-line" id="scene5-bridge-line1">${bridgeL1}</p>
          <p class="scene5-intro-line highlight" id="scene5-bridge-line2">${bridgeL2}</p>
        </div>

        <button id="btn-scene5-next" class="btn-scene-action scene5-continue-btn">${btnText}</button>
      </div>
    </div>
  `;
}

export function renderSpecialLetterReveal(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const tag = PresetService.interpolate(scene.settings?.envelopeTag || scene.settings?.tag || 'For You', replacements);
  const subtag = PresetService.interpolate(scene.settings?.envelopeSubtag || scene.settings?.subtag || 'Something I wanted to say.', replacements);
  const salutation = PresetService.interpolate(scene.settings?.salutation || 'Dear {{recipientName}},', replacements);
  
  let rawParagraphs = scene.settings?.paragraphs;
  if (typeof rawParagraphs === 'string') {
    rawParagraphs = rawParagraphs.split('\n\n').filter(p => p.trim());
  } else if (!Array.isArray(rawParagraphs) || rawParagraphs.length === 0) {
    rawParagraphs = [
      scene.settings?.paragraph1 || "I don't say this enough, but having you in my life is one of the greatest gifts.",
      scene.settings?.paragraph2 || "From all the shared memories to the late-night talks, you make everything so much brighter.",
      scene.settings?.paragraph3 || 'Never forget who you are. Keep smiling, keep dreaming, and never stop being your authentic, wonderful self.',
      scene.settings?.paragraph4 || 'I will always be in your corner, cheering for you through everything life brings.'
    ];
  }
  
  const paragraphs = rawParagraphs.map(p => PresetService.interpolate(p, replacements));
  const closing = PresetService.interpolate(scene.settings?.closing || scene.settings?.closingLine || 'With all my love,', replacements);
  const finalSentence = PresetService.interpolate(scene.settings?.finalSentence || 'Always in my thoughts and heart.', replacements);
  const signature = PresetService.interpolate(scene.settings?.signature || '— With love, {{senderName}}', replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'CONTINUE →', replacements);

  return `
    <div class="special-scene-viewport" id="scene-6">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>

      <div class="scene6-container">
        <!-- Stage 1: 3D Envelope -->
        <div class="scene6-envelope-stage" id="scene6-envelope-stage">
          <p class="scene6-envelope-tag" id="scene6-envelope-tag">${tag}</p>
          <p class="scene6-envelope-subtag" id="scene6-envelope-subtag">${subtag}</p>
          <div class="scene6-envelope-3d" id="scene6-envelope-3d" role="button" aria-label="Open Birthday Letter">
            <div class="envelope-back"></div>
            <div class="envelope-flap"></div>
            <div class="envelope-pocket"></div>
            <div class="envelope-seal">💌</div>
          </div>
          <button id="btn-open-letter" class="btn-begin-cinematic scene6-open-btn">OPEN LETTER</button>
        </div>

        <!-- Stage 2: Physical Paper Letter -->
        <div class="scene6-letter-paper" id="scene6-letter-paper" aria-live="polite">
          <div class="letter-paper-inner">
            <p class="scene6-salutation" id="scene6-salutation">${salutation}</p>
            <div id="scene6-paragraphs-container">
              ${paragraphs.map((p, idx) => `<p class="scene6-p" id="scene6-p${idx + 1}">${p}</p>`).join('')}
            </div>
            <div class="scene6-closing-box" id="scene6-closing-box">
              <p class="scene6-closing-line" id="scene6-closing-line">${closing}</p>
              <p class="scene6-final-sentence" id="scene6-final-sentence">${finalSentence}</p>
              <p class="scene6-signature" id="scene6-signature">${signature}</p>
            </div>
          </div>
        </div>

        <button id="btn-scene6-next" class="btn-scene-action scene6-continue-btn">${btnText}</button>
      </div>
    </div>
  `;
}

export function renderSpecialFakeEnding(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const hbText = PresetService.interpolate(scene.settings?.stageAText || scene.settings?.line1 || 'Happy Birthday, {{recipientName}}. ❤️', replacements);
  const endText = PresetService.interpolate(scene.settings?.stageBText || scene.settings?.endText || 'THE END', replacements);
  const waitText = PresetService.interpolate(scene.settings?.waitText || scene.settings?.twistLine1 || 'Wait.', replacements);
  const forgotText = PresetService.interpolate(scene.settings?.forgotText || scene.settings?.twistLine2 || 'I forgot something.', replacements);
  const ellipsisText = PresetService.interpolate(scene.settings?.ellipsisText || scene.settings?.twistLine3 || '...', replacements);
  const oneLastText = PresetService.interpolate(scene.settings?.oneLastText || scene.settings?.twistLine4 || 'One last thing.', replacements);

  return `
    <div class="special-scene-viewport" id="scene-7">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>

      <div class="scene7-container">
        <!-- Stage A -->
        <div class="scene7-stage active" id="scene7-stage-a">
          <p class="scene7-line" id="scene7-hb">${hbText}</p>
        </div>

        <!-- Stage B -->
        <div class="scene7-stage" id="scene7-stage-b">
          <p class="scene7-the-end" id="scene7-the-end">${endText}</p>
        </div>

        <!-- Stage C -->
        <div class="scene7-stage" id="scene7-stage-c">
          <p class="scene7-line" id="scene7-wait">${waitText}</p>
          <p class="scene7-line" id="scene7-forgot">${forgotText}</p>
          <p class="scene7-ellipsis" id="scene7-ellipsis">${ellipsisText}</p>
          <p class="scene7-line" id="scene7-one-last">${oneLastText}</p>
        </div>

        <div class="scene7-atmosphere-glow" id="scene7-glow"></div>
      </div>
    </div>
  `;
}

export function renderSpecial3DGiftReveal(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const introL1 = PresetService.interpolate(scene.settings?.introLine1 || 'One last thing...', replacements);
  const introL2 = PresetService.interpolate(scene.settings?.introLine2 || 'I almost forgot.', replacements);
  const introL3 = PresetService.interpolate(scene.settings?.introLine3 || 'This is for you.', replacements);
  const promptText = PresetService.interpolate(scene.settings?.promptText || 'Something is waiting for you.', replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'TAP TO OPEN', replacements);

  const gift = resolveGiftContent(scene, project, assets);
  const giftTitle = PresetService.interpolate(gift.title || scene.settings?.giftTitle || scene.settings?.coldCoffeeTitle || 'A Special Surprise 🎁', replacements);
  const giftCaption = PresetService.interpolate(gift.caption || scene.settings?.giftCaption || scene.settings?.coldCoffeeCaption || '', replacements);

  let mediaHtml = '';
  if (gift.hasContent && gift.url) {
    if (gift.contentType === 'video') {
      mediaHtml = `
        <div class="scene8-media-wrapper video-wrapper">
          <div class="scene8-media-loader" id="scene8-gift-loader">
            <div class="spinner-sm"></div>
            <span>Loading gift video...</span>
          </div>
          <video
            id="scene8-gift-video"
            class="scene8-gift-video"
            src="${gift.url}"
            controls
            playsinline
            autoplay
            loop
            preload="auto"
            style="max-width:100%; max-height:46vh; border-radius:12px; display:block; object-fit:contain;"
          ></video>
          <div class="scene8-media-error" id="scene8-gift-error" style="display:none;">
            <span style="font-size:2rem;">⚠️</span>
            <p style="margin:4px 0 0 0; font-weight:700;">Gift content couldn't be loaded.</p>
          </div>
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="scene8-media-wrapper image-wrapper">
          <div class="scene8-media-loader" id="scene8-gift-loader">
            <div class="spinner-sm"></div>
            <span>Loading gift photo...</span>
          </div>
          <img
            id="scene8-gift-img"
            class="scene8-gift-img"
            src="${gift.url}"
            alt="${giftTitle}"
            loading="eager"
            style="max-width:100%; max-height:46vh; border-radius:12px; display:block; object-fit:contain;"
          />
          <div class="scene8-media-error" id="scene8-gift-error" style="display:none;">
            <span style="font-size:2rem;">⚠️</span>
            <p style="margin:4px 0 0 0; font-weight:700;">Gift content couldn't be loaded.</p>
          </div>
        </div>
      `;
    }
  } else {
    mediaHtml = `
      <div class="scene8-media-wrapper empty-wrapper">
        <div class="scene8-gift-empty-fallback">
          <div style="font-size:3.2rem; margin-bottom:6px;">🎁</div>
          <h4 style="font-size:1.15rem; font-weight:800; color:var(--accent-gold, #ffd700); margin:0;">No gift added yet</h4>
          <p style="font-size:0.85rem; color:#cbd5e1; margin-top:6px; max-width:320px;">A special surprise memory is being prepared for you.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="special-scene-viewport" id="scene-8">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>
      <canvas class="special-scene-canvas-overlay" id="gift-particles-canvas"></canvas>
      <div class="scene8-flash-overlay" id="scene8-flash-overlay"></div>

      <div class="scene8-container">
        <!-- Stage 1: Intro -->
        <div class="scene8-text-overlay active" id="scene8-intro-container">
          <p class="scene8-intro-line" id="scene8-intro-line1">${introL1}</p>
          <p class="scene8-intro-line highlight" id="scene8-intro-line2">${introL2}</p>
          <p class="scene8-intro-line" id="scene8-intro-line3">${introL3}</p>
        </div>

        <!-- Stage 2: 3D Gift Box -->
        <div class="scene8-gift-stage" id="scene8-gift-stage">
          <div class="scene8-gift-3d" id="scene8-gift-3d" role="button" aria-label="Open Birthday Gift" tabindex="0">
            <div class="gift-body">
              <div class="ribbon-v"></div>
              <div class="ribbon-h"></div>
            </div>
            <div class="gift-lid">
              <div class="ribbon-v"></div>
              <div class="ribbon-bow">
                <div class="bow-loop-left"></div>
                <div class="bow-loop-right"></div>
                <div class="bow-knot"></div>
              </div>
            </div>
            <div class="gift-inner-light" id="scene8-gift-light"></div>
          </div>

          <div class="scene8-prompt-box" id="scene8-prompt-box">
            <p class="scene8-prompt-text" id="scene8-prompt-text">${promptText}</p>
            <button id="btn-open-gift" class="btn-begin-cinematic scene8-open-btn">${btnText}</button>
          </div>
        </div>

        <!-- Stage 3: Revealed Gift Content Container -->
        <div class="scene8-revealed-gift-container" id="scene8-revealed-gift" aria-live="polite">
          <div class="scene8-gift-card">
            ${giftTitle ? `<h3 class="scene8-gift-title">${giftTitle}</h3>` : ''}
            
            <div class="scene8-gift-media-box" id="scene8-gift-media-box">
              ${mediaHtml}
            </div>

            ${giftCaption ? `<p class="scene8-gift-caption">${giftCaption}</p>` : ''}

            <div class="scene8-gift-actions">
              <button id="btn-gift-continue" class="btn-begin-cinematic scene8-continue-btn">CONTINUE →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderSpecialBirthdayReveal(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const dateStr = scene.settings?.dateText || replacements.date || '15 • 08 • 2026';
  const name = PresetService.interpolate(scene.settings?.nameText || replacements.recipientName || '{{recipientName}}', replacements);
  const happyText = scene.settings?.happyText || 'HAPPY';
  const birthdayText = scene.settings?.birthdayText || 'BIRTHDAY';
  const tagline = PresetService.interpolate(scene.settings?.tagline || 'Your day.', replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'CONTINUE →', replacements);

  return `
    <div class="special-scene-viewport" id="scene-9">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>
      <canvas class="special-scene-canvas-overlay" id="celebration-canvas"></canvas>

      <div class="scene9-container">
        <div class="scene9-content-stage" id="scene9-content-stage">
          <p class="scene9-happy" id="scene9-happy">${happyText}</p>
          <h1 class="scene9-birthday" id="scene9-birthday">${birthdayText}</h1>
          <h2 class="scene9-name" id="scene9-name">${name}</h2>
          <div class="scene9-heart" id="scene9-heart">${scene.settings?.heartText || '❤️'}</div>
          <div class="scene9-date-box" id="scene9-date-box">
            <span class="scene9-date" id="scene9-date">${dateStr}</span>
            <span class="scene9-tagline" id="scene9-tagline">${tagline}</span>
          </div>
        </div>

        <button id="btn-scene9-next" class="btn-scene-action scene9-continue-btn">${btnText}</button>
      </div>
    </div>
  `;
}

export function renderSpecialBonusMemories(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const introL1 = PresetService.interpolate(scene.settings?.introLine1 || 'Wait...', replacements);
  const introL2 = PresetService.interpolate(scene.settings?.introLine2 || "There's more.", replacements);
  const headerTitle = PresetService.interpolate(scene.settings?.headerTitle || scene.settings?.title || 'BONUS MEMORIES', replacements);
  const btnText = PresetService.interpolate(scene.settings?.buttonText || 'NEXT →', replacements);

  return `
    <div class="special-scene-viewport" id="scene-bonus">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>

      <div class="bonus-container">
        <div class="bonus-stage active" id="bonus-stage-intro">
          <p class="bonus-intro-line" id="bonus-intro-line1">${introL1}</p>
          <p class="bonus-intro-line highlight" id="bonus-intro-line2">${introL2}</p>
        </div>

        <div class="bonus-stage" id="bonus-stage-main">
          <h3 class="bonus-header-title">${headerTitle}</h3>
          <p class="bonus-item-title" id="bonus-item-title"></p>
          <div class="bonus-viewport">
            <div class="bonus-media-container" id="bonus-media-container"></div>
          </div>
          <div class="bonus-dots-indicator" id="bonus-dots-indicator"></div>
          <button id="btn-bonus-next" class="btn-scene-action bonus-next-btn">${btnText}</button>
        </div>
      </div>
    </div>
  `;
}

export function renderSpecialEmotionalFinale(scene, project, assets, options = {}) {
  const replacements = getReplacements(scene, project, assets);
  const openingText = PresetService.interpolate(scene.settings?.openingText || (Array.isArray(scene.settings?.openingLines) ? scene.settings.openingLines.join(' ') : 'No matter how much time passes...'), replacements);
  const l1 = PresetService.interpolate(scene.settings?.line1 || (Array.isArray(scene.settings?.finalLines) ? scene.settings.finalLines[0] : "You will always hold a special place in our hearts."), replacements);
  const l2 = PresetService.interpolate(scene.settings?.line2 || (Array.isArray(scene.settings?.finalLines) ? scene.settings.finalLines[1] : 'And I will always be there.'), replacements);
  const personalLine = PresetService.interpolate(scene.settings?.personalLine || scene.settings?.personalMessage || 'Wishing you endless happiness, health, and success.', replacements);
  const signature = PresetService.interpolate(scene.settings?.signature || '— With love, {{senderName}}', replacements);
  const credit1 = PresetService.interpolate(scene.settings?.creditLine1 || (Array.isArray(scene.settings?.endCredits) ? scene.settings.endCredits[0] : 'MADE WITH ❤️ FOR YOU'), replacements);
  const credit2 = PresetService.interpolate(scene.settings?.creditLine2 || (Array.isArray(scene.settings?.endCredits) ? scene.settings.endCredits[1] : (replacements.date || '15 • 08 • 2026')), replacements);
  const heroPhoto = scene.settings?.heroPhotoUrl || replacements.photo1 || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80';
  const replayBtnText = PresetService.interpolate(scene.settings?.replayButtonText || 'WATCH AGAIN ↺', replacements);

  return `
    <div class="special-scene-viewport" id="scene-10">
      <div class="film-grain-overlay"></div>
      <div class="vignette-overlay"></div>
      <canvas class="special-scene-canvas-overlay" id="specialFinaleCanvas"></canvas>

      <div class="scene10-container">
        <!-- Stage 1: Opening Text -->
        <div class="scene10-text-overlay active" id="scene10-text-overlay">
          <p class="scene10-opening-text" id="scene10-opening-text">${openingText}</p>
        </div>

        <!-- Stage 2: Hero Photo -->
        <div class="scene10-photo-stage" id="scene10-photo-stage">
          <div class="scene10-photo-viewport" id="scene10-photo-viewport">
            <img id="scene10-hero-photo" src="${heroPhoto}" alt="Hero Photo">
            <div class="scene10-photo-overlay"></div>
          </div>
        </div>

        <!-- Stage 3: Content & Signature -->
        <div class="scene10-content-stage" id="scene10-content-stage">
          <div class="scene10-lines-container">
            <p class="scene10-line" id="scene10-line-1">${l1}</p>
            <p class="scene10-line" id="scene10-line-2">${l2}</p>
            <p class="scene10-personal-line" id="scene10-personal-line">${personalLine}</p>
            <p class="scene10-signature" id="scene10-signature">${signature}</p>
          </div>
          <div class="scene10-credits-box" id="scene10-credits-box" style="margin-top:1.8rem;">
            <p class="scene10-credit-line" id="scene10-credit-line-1">${credit1}</p>
            <p class="scene10-credit-line highlight" id="scene10-credit-line-2">${credit2}</p>
          </div>
        </div>

        <!-- Stage 4: Replay Stage -->
        <div class="scene10-replay-stage" id="scene10-replay-stage">
          <button id="btn-watch-again" class="btn-begin-cinematic scene10-replay-btn">${replayBtnText}</button>
        </div>
      </div>
    </div>
  `;
}

function getReplacements(scene, project, assets) {
  const recName = project?.recipient?.name || 'Someone Special';
  const sndName = project?.creatorDisplayName || project?.creator?.name || 'A Dear Friend';
  return {
    name: recName,
    recipientName: recName,
    recipient: recName,
    sender: sndName,
    senderName: sndName,
    creatorName: sndName,
    occasion: project?.occasion || 'Birthday',
    date: project?.birthdayDate || 'Today',
    birthdayDate: project?.birthdayDate || 'Today',
    photo1: assets.find(a => a.type === 'image')?.renderUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    ...(project?.templateVariables || {})
  };
}
