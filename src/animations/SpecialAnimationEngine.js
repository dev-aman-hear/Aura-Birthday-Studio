/**
 * Birthday Studio - Special Animation Engine
 * Exact GSAP animation choreography and particle systems matched 1-to-1 to the 15th Aug short film.
 */

import { resolveTemplateId } from '../templates/TemplateRegistry.js';

export class SpecialAnimationEngine {
  constructor() {
    this.hasGSAP = typeof window !== 'undefined' && typeof window.gsap !== 'undefined';
    this.activeTimelines = [];
    this.activeCanvases = [];
    this.activeTimers = [];
    this.activeIntervals = [];
    this.activeCleanups = [];
    this.isPaused = false;
  }

  /* ==========================================================================
     1. Lifecycle Management
     ========================================================================== */

  registerTimeline(tl) {
    if (tl) this.activeTimelines.push(tl);
    return tl;
  }

  registerCanvas(canvasController) {
    if (canvasController) this.activeCanvases.push(canvasController);
    return canvasController;
  }

  registerTimer(timerId) {
    if (timerId) this.activeTimers.push(timerId);
    return timerId;
  }

  registerInterval(intervalId) {
    if (intervalId) this.activeIntervals.push(intervalId);
    return intervalId;
  }

  registerCleanup(fn) {
    if (typeof fn === 'function') this.activeCleanups.push(fn);
  }

  cleanup() {
    this.activeTimers.forEach(t => clearTimeout(t));
    this.activeTimers = [];

    this.activeIntervals.forEach(i => clearInterval(i));
    this.activeIntervals = [];

    this.activeTimelines.forEach(tl => {
      try {
        if (tl && typeof tl.kill === 'function') tl.kill();
      } catch (e) {}
    });
    this.activeTimelines = [];

    this.activeCanvases.forEach(c => {
      try {
        if (c && typeof c.stop === 'function') c.stop();
      } catch (e) {}
    });
    this.activeCanvases = [];

    this.activeCleanups.forEach(fn => {
      try { fn(); } catch (e) {}
    });
    this.activeCleanups = [];
  }

  /* ==========================================================================
     2. Reusable Primitives
     ========================================================================== */

  fadeInFocus(target, options = {}) {
    const isReduced = this.checkReducedMotion();
    const duration = options.duration !== undefined ? options.duration : 1.6;
    const delay = options.delay || 0;
    const ease = options.ease || 'power2.out';

    if (this.hasGSAP && !isReduced) {
      const tl = window.gsap.fromTo(
        target,
        { opacity: 0, filter: 'blur(12px)', y: 18, scale: 0.98 },
        { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1, duration, delay, ease, onComplete: options.onComplete }
      );
      this.registerTimeline(tl);
      return tl;
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.style.opacity = '1';
        el.style.filter = 'blur(0px)';
      }
      if (options.onComplete) options.onComplete();
    }
  }

  fadeOut(target, options = {}) {
    const isReduced = this.checkReducedMotion();
    const duration = options.duration !== undefined ? options.duration : 1.2;
    const delay = options.delay || 0;

    if (this.hasGSAP && !isReduced) {
      const tl = window.gsap.to(target, {
        opacity: 0,
        filter: 'blur(8px)',
        y: -10,
        duration,
        delay,
        ease: 'power2.inOut',
        onComplete: options.onComplete
      });
      this.registerTimeline(tl);
      return tl;
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) el.style.opacity = '0';
      if (options.onComplete) options.onComplete();
    }
  }

  playKenBurns(target, duration = 6.0) {
    if (!target || !this.hasGSAP || this.checkReducedMotion()) return null;
    window.gsap.killTweensOf(target);
    const tl = window.gsap.fromTo(
      target,
      { scale: 1.0, x: 0, y: 0 },
      { scale: 1.08, x: -12, y: -6, duration, ease: 'sine.out' }
    );
    this.registerTimeline(tl);
    return tl;
  }

  /* ==========================================================================
     3. Canvas Particle Backgrounds
     ========================================================================== */

  createAmbientDust(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    const count = width < 768 ? 35 : 70;
    const particles = [];
    let isRunning = true;
    let animFrame = null;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.25 - 0.05,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.01 + Math.random() * 0.02
      });
    }

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.4, 0,
        width * 0.5, height * 0.4, Math.max(width, height) * 0.7
      );
      bgGrad.addColorStop(0, 'rgba(28, 26, 38, 0.4)');
      bgGrad.addColorStop(0.5, 'rgba(14, 13, 20, 0.7)');
      bgGrad.addColorStop(1, 'rgba(7, 7, 9, 1)');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
        const safeAlpha = Math.max(0.02, Math.min(0.7, currentAlpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 190, 122, ${safeAlpha})`;
        ctx.shadowBlur = p.radius * 4;
        ctx.shadowColor = 'rgba(226, 190, 122, 0.6)';
        ctx.fill();
      }

      animFrame = requestAnimationFrame(render);
    };

    render();

    const controller = {
      stop: () => {
        isRunning = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        ctx.clearRect(0, 0, width, height);
      }
    };

    this.registerCanvas(controller);
    return controller;
  }

  createParticleFountain(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    const count = 60;
    const colors = ['#ffd700', '#ffffff', '#e2be7a', '#a78bfa'];
    const particles = [];
    let isRunning = true;
    let animFrame = null;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * (width * 0.3),
        y: height / 2 + 30,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -Math.random() * 3.8 - 1.2,
        radius: Math.random() * 3.0 + 1.0,
        alpha: Math.random() * 0.8 + 0.2,
        decay: Math.random() * 0.015 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          p.x = width / 2 + (Math.random() - 0.5) * (width * 0.25);
          p.y = height / 2 + 30;
          p.alpha = Math.random() * 0.8 + 0.2;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animFrame = requestAnimationFrame(render);
    };

    render();

    const controller = {
      stop: () => {
        isRunning = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        ctx.clearRect(0, 0, width, height);
      }
    };

    this.registerCanvas(controller);
    return controller;
  }

  createCelebrationEngine(canvas, options = {}) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    let isRunning = true;
    let animFrame = null;
    const colors = ['#ffd700', '#f7d794', '#d98a96', '#ffffff', '#e2be7a', '#b88d3d'];

    // Confetti Cards
    const confettiList = [];
    const confettiCount = width < 768 ? 45 : 75;

    for (let i = 0; i < confettiCount; i++) {
      confettiList.push({
        x: Math.random() * width,
        y: Math.random() * -height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 12 + 6,
        vx: (Math.random() - 0.5) * 1.6,
        vy: Math.random() * 2.4 + 1.2,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    // Fireworks Sparks
    const sparks = [];

    const launchFireworkBurst = (x, y) => {
      const sparkCount = 36;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.6 + 1.5;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.4 + 1.0,
          alpha: 1.0,
          decay: Math.random() * 0.02 + 0.012,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    if (options.enableFireworks !== false) {
      this.registerTimer(setTimeout(() => launchFireworkBurst(width * 0.3, height * 0.35), 400));
      this.registerTimer(setTimeout(() => launchFireworkBurst(width * 0.7, height * 0.3), 900));
      this.registerTimer(setTimeout(() => launchFireworkBurst(width * 0.5, height * 0.42), 1500));
      this.registerTimer(setTimeout(() => launchFireworkBurst(width * 0.35, height * 0.26), 2200));
    }

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      confettiList.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.vRot;

        if (c.y > height + 20) {
          c.y = -20;
          c.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = c.color;
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      });

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.04;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrame = requestAnimationFrame(render);
    };

    render();

    const controller = {
      stop: () => {
        isRunning = false;
        if (animFrame) cancelAnimationFrame(animFrame);
        ctx.clearRect(0, 0, width, height);
      }
    };

    this.registerCanvas(controller);
    return controller;
  }

  checkReducedMotion() {
    // Allow cinematic blur & animations by default unless explicitly disabled in studio settings
    return Boolean(typeof window !== 'undefined' && window.STUDIO_FORCE_REDUCED_MOTION);
  }

  /* ==========================================================================
     4. Scene-Specific Interactive Controllers (15th Aug Parity)
     ========================================================================== */

  initScene(container, scene, project = {}, onNext = (() => {})) {
    if (!container || !scene) return;
    const templateId = resolveTemplateId(scene.template || '');
    if (!templateId.startsWith('special_')) return;

    this.cleanup();

    // 1. Scene 1: Cinematic Intro
    if (templateId === 'special_cinematic_intro') {
      const canvas = container.querySelector('#specialIntroCanvas');
      if (canvas) this.createAmbientDust(canvas);

      const l1 = container.querySelector('#intro-line-1');
      const l2 = container.querySelector('#intro-line-2');
      const l3 = container.querySelector('#intro-line-3');
      const l4 = container.querySelector('#intro-line-4');
      const l5 = container.querySelector('#intro-line-5');
      const btn = container.querySelector('#btn-begin-experience');

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const lineElements = [l1, l2, l3, l4, l5].filter(Boolean);
        window.gsap.set(lineElements, { opacity: 0, filter: 'blur(14px)', y: 20 });
        if (btn) window.gsap.set(btn, { opacity: 0, scale: 0.9, filter: 'blur(10px)' });

        const tl = window.gsap.timeline();
        this.registerTimeline(tl);

        // Exact 15th aug timings:
        if (l1) {
          tl.to(l1, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.0, ease: 'power2.out' })
            .to(l1, { opacity: 0.4, filter: 'blur(2px)', duration: 1.5, ease: 'power1.inOut' }, '+=1.2');
        }
        if (l2) {
          tl.to(l2, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.2, ease: 'power2.out' }, '-=0.5')
            .to(l2, { opacity: 0.4, filter: 'blur(2px)', duration: 1.5, ease: 'power1.inOut' }, '+=1.2');
        }
        if (l3) {
          tl.to(l3, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.0, ease: 'power2.out' }, '-=0.5')
            .to(l3, { opacity: 0.4, filter: 'blur(2px)', duration: 1.5, ease: 'power1.inOut' }, '+=1.2');
        }
        if (l4) {
          tl.to(l4, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.4, ease: 'power2.out' }, '-=0.5')
            .to(l4, { opacity: 0.5, filter: 'blur(2px)', duration: 1.5, ease: 'power1.inOut' }, '+=1.5');
        }
        if (l5) {
          tl.to(l5, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.2, ease: 'power2.out' }, '+=0.4');
        }
        if (btn) {
          tl.to(btn, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'back.out(1.4)' }, '-=1.0');
        }
      } else {
        [l1, l2, l3, l4, l5, btn].forEach(el => { if (el) el.style.opacity = '1'; });
      }

      if (btn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          onNext();
        };
      }
    }

    // 2. Scene 2: Childhood Memories
    else if (templateId === 'special_childhood_memories') {
      const intro = container.querySelector('#scene2-intro-container');
      const introL1 = container.querySelector('#scene2-intro-line1');
      const introL2 = container.querySelector('#scene2-intro-line2');
      const memoryStage = container.querySelector('#scene2-memory-stage');
      const imgContainer = container.querySelector('#scene2-image-container');
      const captionText = container.querySelector('#scene2-caption-text');
      const dotsContainer = container.querySelector('#scene2-dots-indicator');
      const outro = container.querySelector('#scene2-outro-container');
      const outroL1 = container.querySelector('#scene2-outro-line1');
      const outroL2 = container.querySelector('#scene2-outro-line2');
      const continueBtn = container.querySelector('#btn-scene2-continue');

      const memories = scene.settings?.memories || [
        { title: 'THE EARLY DAYS', year: '2005', caption: 'You came into my life and made it infinitely brighter.', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' },
        { title: 'LITTLE STEPS', year: '2008', caption: 'Watching you grow up faster than I realized.', photoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' },
        { title: 'PARTNERS IN CRIME', year: '2012', caption: 'Always by my side through every milestone.', photoUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80' },
        { title: 'MEMORIES THAT STAYED', year: '2016', caption: 'Growing into an incredible person every single day.', photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80' }
      ];

      let currentIndex = 0;
      let memTimer = null;

      const loadMemory = (idx) => {
        if (idx >= memories.length) {
          // Outro transition
          if (memoryStage) memoryStage.classList.remove('active');
          if (continueBtn) continueBtn.classList.remove('active');
          if (outro) outro.classList.add('active');

          if (this.hasGSAP && !this.checkReducedMotion()) {
            const outroTl = window.gsap.timeline({
              onComplete: () => {
                if (continueBtn) {
                  continueBtn.textContent = 'CONTINUE →';
                  continueBtn.classList.add('active');
                  continueBtn.onclick = () => onNext();
                  this.fadeInFocus(continueBtn);
                }
              }
            });
            this.registerTimeline(outroTl);
            outroTl.to(outroL1, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.8, ease: 'power2.out' })
              .to(outroL1, { opacity: 0.4, filter: 'blur(2px)', duration: 1.2 }, '+=1.0')
              .to(outroL2, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.0, ease: 'power2.out' }, '-=0.3');
          } else {
            if (continueBtn) {
              continueBtn.classList.add('active');
              continueBtn.onclick = () => onNext();
            }
          }
          return;
        }

        currentIndex = idx;
        const item = memories[idx];
        if (captionText) captionText.textContent = item.caption || '';
        if (imgContainer) {
          imgContainer.innerHTML = `
            <div class="media-collage-wrapper" style="width:100%; height:100%; position:relative;">
              <div class="media-collage-bg" style="background-image:url('${item.photoUrl}');"></div>
              <img class="media-collage-fg" src="${item.photoUrl}" alt="${item.title}">
            </div>
          `;
          this.playKenBurns(imgContainer.querySelector('.media-collage-fg'), 5.5);
        }

        if (dotsContainer) {
          const dots = dotsContainer.querySelectorAll('.dot');
          dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }

        if (continueBtn) {
          continueBtn.textContent = idx >= memories.length - 1 ? 'CONTINUE →' : 'NEXT PHOTO →';
          continueBtn.classList.add('active');
          continueBtn.onclick = () => {
            if (memTimer) clearTimeout(memTimer);
            loadMemory(currentIndex + 1);
          };
        }

        if (memTimer) clearTimeout(memTimer);
        memTimer = this.registerTimer(setTimeout(() => {
          loadMemory(currentIndex + 1);
        }, 5000));
      };

      if (dotsContainer) {
        dotsContainer.innerHTML = memories.map((m, i) => `<button class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></button>`).join('');
        dotsContainer.querySelectorAll('.dot').forEach(d => {
          d.onclick = (e) => {
            e.stopPropagation();
            if (memTimer) clearTimeout(memTimer);
            loadMemory(parseInt(d.dataset.idx, 10));
          };
        });
      }

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const introTl = window.gsap.timeline({
          onComplete: () => {
            if (intro) intro.classList.remove('active');
            if (memoryStage) {
              memoryStage.classList.add('active');
              loadMemory(0);
            }
          }
        });
        this.registerTimeline(introTl);
        introTl.fromTo(introL1, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.8, ease: 'power2.out' })
          .to(introL1, { opacity: 0.4, filter: 'blur(2px)', duration: 1.2 }, '+=1.0')
          .fromTo(introL2, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.0, ease: 'power2.out' }, '-=0.3')
          .to({}, { duration: 1.2 });
      } else {
        if (intro) intro.classList.remove('active');
        if (memoryStage) { memoryStage.classList.add('active'); loadMemory(0); }
      }
    }

    // 3. Scene 3: Memory Sequence
    else if (templateId === 'special_memory_sequence') {
      const intro = container.querySelector('#scene3-intro-container');
      const introL1 = container.querySelector('#scene3-intro-line1');
      const introL2 = container.querySelector('#scene3-intro-line2');
      const stage = container.querySelector('#scene3-stage');
      const yearBadge = container.querySelector('#scene3-year-badge');
      const titleEl = container.querySelector('#scene3-memory-title');
      const counterEl = container.querySelector('#scene3-chapter-counter');
      const mediaContainer = container.querySelector('#scene3-media-container');
      const captionText = container.querySelector('#scene3-caption-text');
      const nodesContainer = container.querySelector('#scene3-timeline-nodes');
      const prevBtn = container.querySelector('#scene3-btn-prev');
      const nextBtn = container.querySelector('#scene3-btn-next');
      const continueBtn = container.querySelector('#btn-scene3-next');

      const memories = scene.settings?.memories || [
        { title: 'WHERE IT ALL BEGAN', year: '2010', caption: 'You came into my life and made it infinitely brighter.', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' },
        { title: 'THE EARLY YEARS', year: '2016', caption: 'Always curious, always energetic, full of smiles.', photoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' },
        { title: 'GROWING TOGETHER', year: '2019', caption: 'Through all the small moments and big laughs.', photoUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80' },
        { title: 'A NEW CHAPTER', year: '2023', caption: 'Becoming your own incredible person.', photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80' },
        { title: 'TODAY & ALWAYS', year: '2026', caption: 'Look how far you have come. Always cheering for you.', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' }
      ];

      let currentIndex = 0;

      const loadMemory = (idx) => {
        if (idx < 0 || idx >= memories.length) return;
        currentIndex = idx;
        const item = memories[idx];
        if (yearBadge) yearBadge.textContent = item.year || '2026';
        if (titleEl) titleEl.textContent = item.title || 'MEMORY';
        if (counterEl) counterEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(memories.length).padStart(2, '0')}`;
        if (captionText) captionText.textContent = item.caption || '';
        if (mediaContainer) {
          mediaContainer.innerHTML = `
            <div class="media-collage-wrapper" style="width:100%; height:100%; position:relative;">
              <div class="media-collage-bg" style="background-image:url('${item.photoUrl}');"></div>
              <img class="media-collage-fg" src="${item.photoUrl}" alt="${item.title}">
            </div>
          `;
          this.playKenBurns(mediaContainer.querySelector('.media-collage-fg'), 6.0);
        }

        if (nodesContainer) {
          nodesContainer.querySelectorAll('.timeline-node').forEach((n, i) => {
            n.classList.toggle('active', i === idx);
          });
        }

        if (continueBtn) {
          continueBtn.textContent = idx >= memories.length - 1 ? 'CONTINUE →' : 'NEXT →';
          continueBtn.classList.add('active');
        }
      };

      if (nodesContainer) {
        nodesContainer.innerHTML = memories.map((m, i) => `
          <button class="timeline-node ${i === 0 ? 'active' : ''}" data-idx="${i}">
            <span class="node-dot"></span>
            <span class="node-year">${m.year || ''}</span>
          </button>
        `).join('');
        nodesContainer.querySelectorAll('.timeline-node').forEach(n => {
          n.onclick = () => loadMemory(parseInt(n.dataset.idx, 10));
        });
      }

      if (prevBtn) prevBtn.onclick = () => { if (currentIndex > 0) loadMemory(currentIndex - 1); };
      if (nextBtn) nextBtn.onclick = () => { if (currentIndex < memories.length - 1) loadMemory(currentIndex + 1); };

      if (continueBtn) {
        continueBtn.onclick = () => {
          if (currentIndex < memories.length - 1) loadMemory(currentIndex + 1);
          else onNext();
        };
      }

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            if (intro) intro.classList.remove('active');
            if (stage) { stage.classList.add('active'); loadMemory(0); }
          }
        });
        this.registerTimeline(tl);
        tl.fromTo(introL1, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.8, ease: 'power2.out' })
          .to(introL1, { opacity: 0.4, filter: 'blur(2px)', duration: 1.2 }, '+=1.0')
          .fromTo(introL2, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.0, ease: 'power2.out' }, '-=0.3')
          .to({}, { duration: 1.0 });
      } else {
        if (intro) intro.classList.remove('active');
        if (stage) { stage.classList.add('active'); loadMemory(0); }
      }
    }

    // 4. Scene 4: Collages Gallery
    else if (templateId === 'special_collage_gallery') {
      const photoContainer = container.querySelector('#scene4-photo-container');
      const captionText = container.querySelector('#scene4-caption-text');
      const dotsContainer = container.querySelector('#scene4-dots-indicator');
      const nextBtn = container.querySelector('#btn-scene4-next');

      const collages = scene.settings?.collages || [
        { title: 'TOGETHER ALWAYS', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80', caption: 'Sibling moments that make life rich and warm.' },
        { title: 'ADVENTURES & TRAVEL', photoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80', caption: 'Exploring new paths together side by side.' },
        { title: 'PURE JOY', photoUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80', caption: 'Smiles that light up any room.' }
      ];

      let currentIndex = 0;

      const loadCollage = (idx) => {
        if (idx < 0 || idx >= collages.length) return;
        currentIndex = idx;
        const item = collages[idx];
        if (captionText) captionText.textContent = item.caption || '';
        if (photoContainer) {
          photoContainer.innerHTML = `
            <div class="media-collage-wrapper" style="width:100%; height:100%; position:relative;">
              <div class="media-collage-bg" style="background-image:url('${item.photoUrl}');"></div>
              <img class="media-collage-fg" src="${item.photoUrl}" alt="${item.title}">
            </div>
          `;
        }
        if (dotsContainer) {
          dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
        }
        if (nextBtn) {
          nextBtn.textContent = idx >= collages.length - 1 ? 'CONTINUE →' : 'NEXT PHOTO →';
          nextBtn.classList.add('active');
        }
      };

      if (dotsContainer) {
        dotsContainer.innerHTML = collages.map((c, i) => `<button class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></button>`).join('');
        dotsContainer.querySelectorAll('.dot').forEach(d => {
          d.onclick = () => loadCollage(parseInt(d.dataset.idx, 10));
        });
      }

      loadCollage(0);

      if (nextBtn) {
        nextBtn.onclick = () => {
          if (currentIndex < collages.length - 1) loadCollage(currentIndex + 1);
          else onNext();
        };
      }
    }

    // 5. Scene 5: Sibling Chaos & Humor
    else if (templateId === 'special_chaos_montage') {
      const intro = container.querySelector('#scene5-intro-container');
      const introL1 = container.querySelector('#scene5-intro-line1');
      const introL2 = container.querySelector('#scene5-intro-line2');
      const cardStage = container.querySelector('#scene5-card-stage');
      const viewport = container.querySelector('#scene5-viewport');
      const mediaContainer = container.querySelector('#scene5-media-container');
      const titleEl = container.querySelector('#scene5-card-title');
      const subEl = container.querySelector('#scene5-card-subtitle');
      const nextBtn = container.querySelector('#btn-scene5-next');

      const cards = scene.settings?.cards || [
        { title: '24/7 TROUBLE GENERATOR', subtitle: 'Causes drama, then blames the nearest person.' },
        { title: 'PROFESSIONAL DRAMA QUEEN', subtitle: 'Deserves an Oscar for every minor inconvenience.' },
        { title: 'CHIEF SNACK STEALER', subtitle: 'My food is their food. Their food is off limits.' },
        { title: 'SELECTIVE HEARING MASTER', subtitle: 'Hears snacks from 3 rooms away, ignores my call.' },
        { title: 'EXPERT ARGUMENT WINNER', subtitle: "Logic doesn't matter. They are right. Always." },
        { title: 'ALWAYS BY YOUR SIDE', subtitle: 'Through all the crazy adventures and memories.' }
      ];

      let currentIndex = 0;

      const loadCard = (idx) => {
        if (idx < 0 || idx >= cards.length) return;
        currentIndex = idx;
        const c = cards[idx];
        if (titleEl) titleEl.textContent = c.title || '';
        if (subEl) subEl.textContent = c.subtitle || '';
        if (viewport) {
          viewport.classList.remove('tilt-left', 'tilt-right');
          viewport.classList.add(idx % 2 === 0 ? 'tilt-left' : 'tilt-right');
        }

        if (this.hasGSAP && !this.checkReducedMotion()) {
          window.gsap.fromTo(titleEl, { opacity: 0, scale: 0.9, y: 10, filter: 'blur(8px)' }, { opacity: 1, scale: 1.0, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(1.6)' });
          window.gsap.fromTo(subEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power1.out' });
        }

        if (nextBtn) {
          nextBtn.textContent = idx >= cards.length - 1 ? 'CONTINUE →' : 'NEXT MEMORY →';
          nextBtn.classList.add('active');
        }
      };

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            if (intro) intro.classList.remove('active');
            if (cardStage) { cardStage.classList.add('active'); loadCard(0); }
          }
        });
        this.registerTimeline(tl);
        tl.fromTo(introL1, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.8, ease: 'power2.out' })
          .to(introL1, { opacity: 0.4, filter: 'blur(2px)', duration: 1.2 }, '+=1.0')
          .fromTo(introL2, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.0, ease: 'power2.out' }, '-=0.3')
          .to({}, { duration: 1.0 });
      } else {
        if (intro) intro.classList.remove('active');
        if (cardStage) { cardStage.classList.add('active'); loadCard(0); }
      }

      if (nextBtn) {
        nextBtn.onclick = () => {
          if (currentIndex < cards.length - 1) loadCard(currentIndex + 1);
          else onNext();
        };
      }
    }

    // 6. Scene 6: Personal Letter (3D Envelope & Handwritten Paper)
    else if (templateId === 'special_letter_reveal') {
      const envelopeStage = container.querySelector('#scene6-envelope-stage');
      const envelope3d = container.querySelector('#scene6-envelope-3d');
      const openBtn = container.querySelector('#btn-open-letter');
      const letterPaper = container.querySelector('#scene6-letter-paper');
      const continueBtn = container.querySelector('#btn-scene6-next');

      let isOpened = false;

      const openLetter = () => {
        if (isOpened) return;
        isOpened = true;

        if (envelope3d) envelope3d.classList.add('opened');
        if (envelopeStage) envelopeStage.classList.add('shrunk');

        this.registerTimer(setTimeout(() => {
          if (letterPaper) {
            letterPaper.classList.add('active');

            const paragraphs = letterPaper.querySelectorAll('.scene6-p');
            const closingBox = letterPaper.querySelector('#scene6-closing-box');

            paragraphs.forEach((p, i) => {
              this.registerTimer(setTimeout(() => {
                p.classList.add('visible');
              }, 400 + i * 800));
            });

            this.registerTimer(setTimeout(() => {
              if (closingBox) closingBox.classList.add('visible');
              if (continueBtn) {
                continueBtn.classList.add('active');
                continueBtn.onclick = () => onNext();
              }
            }, 400 + paragraphs.length * 800 + 400));
          }
        }, 800));
      };

      if (openBtn) openBtn.onclick = openLetter;
      if (envelope3d) envelope3d.onclick = openLetter;
    }

    // 7. Scene 7: The Fake Ending
    else if (templateId === 'special_fake_ending') {
      const stageA = container.querySelector('#scene7-stage-a');
      const stageB = container.querySelector('#scene7-stage-b');
      const stageC = container.querySelector('#scene7-stage-c');
      const glow = container.querySelector('#scene7-glow');

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            this.registerTimer(setTimeout(() => onNext(), 1200));
          }
        });
        this.registerTimeline(tl);

        // Stage A: "Happy Birthday. ❤️"
        tl.to({}, { duration: 2.2 })
          .to(stageA, { opacity: 0, filter: 'blur(8px)', duration: 0.8 })
          .add(() => {
            if (stageA) stageA.classList.remove('active');
            if (stageB) stageB.classList.add('active');
          })
          // Stage B: "THE END" (3.5s hold)
          .fromTo(stageB, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.2 })
          .to({}, { duration: 3.5 })
          .to(stageB, { opacity: 0, filter: 'blur(10px)', duration: 0.8 })
          .add(() => {
            if (stageB) stageB.classList.remove('active');
            if (stageC) stageC.classList.add('active');
            if (glow) glow.style.opacity = '1';
          })
          // Stage C: "Wait. I forgot something. ... One last thing."
          .fromTo(stageC, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.6 })
          .to({}, { duration: 2.5 });
      } else {
        this.registerTimer(setTimeout(() => onNext(), 5000));
      }
    }

    // 8. Scene 8: Secret Gift (3D Box)
    else if (templateId === 'special_3d_gift_reveal') {
      const intro = container.querySelector('#scene8-intro-container');
      const introL1 = container.querySelector('#scene8-intro-line1');
      const introL2 = container.querySelector('#scene8-intro-line2');
      const introL3 = container.querySelector('#scene8-intro-line3');
      const stage = container.querySelector('#scene8-gift-stage');
      const box = container.querySelector('#scene8-gift-3d');
      const openBtn = container.querySelector('#btn-open-gift');
      const flash = container.querySelector('#scene8-flash-overlay');
      const canvas = container.querySelector('#gift-particles-canvas');

      let isOpened = false;

      const unbox = () => {
        if (isOpened) return;
        isOpened = true;

        if (box) box.classList.add('opened');
        if (canvas) this.createParticleFountain(canvas);

        this.registerTimer(setTimeout(() => {
          if (flash) flash.classList.add('active');
          this.registerTimer(setTimeout(() => onNext(), 600));
        }, 1200));
      };

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            if (intro) intro.classList.remove('active');
            if (stage) stage.classList.add('active');
          }
        });
        this.registerTimeline(tl);
        tl.fromTo(introL1, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.6, ease: 'power2.out' })
          .to(introL1, { opacity: 0.4, filter: 'blur(2px)', duration: 1.0 }, '+=0.8')
          .fromTo(introL2, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.8, ease: 'power2.out' }, '-=0.2')
          .to(introL2, { opacity: 0.4, filter: 'blur(2px)', duration: 1.0 }, '+=0.8')
          .fromTo(introL3, { opacity: 0, filter: 'blur(12px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2.0, ease: 'power2.out' }, '-=0.2')
          .to({}, { duration: 1.0 });
      } else {
        if (intro) intro.classList.remove('active');
        if (stage) stage.classList.add('active');
      }

      if (openBtn) openBtn.onclick = unbox;
      if (box) box.onclick = unbox;
    }

    // 9. Scene 9: The Birthday Reveal
    else if (templateId === 'special_birthday_reveal') {
      const canvas = container.querySelector('#celebration-canvas');
      if (canvas) this.createCelebrationEngine(canvas, { enableFireworks: true });

      const happy = container.querySelector('#scene9-happy');
      const bday = container.querySelector('#scene9-birthday');
      const name = container.querySelector('#scene9-name');
      const heart = container.querySelector('#scene9-heart');
      const dateBox = container.querySelector('#scene9-date-box');
      const btn = container.querySelector('#btn-scene9-next');

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            if (btn) {
              btn.classList.add('active');
              btn.onclick = () => onNext();
            }
          }
        });
        this.registerTimeline(tl);
        if (happy) tl.fromTo(happy, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
        if (bday) tl.fromTo(bday, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 1.0, ease: 'back.out(1.4)' }, '-=0.2');
        if (name) tl.fromTo(name, { opacity: 0, scale: 0.82, filter: 'blur(16px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' }, '-=0.3');
        if (heart) tl.fromTo(heart, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.8)' }, '-=0.4');
        if (dateBox) tl.fromTo(dateBox, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.2');
      } else {
        if (btn) { btn.classList.add('active'); btn.onclick = () => onNext(); }
      }
    }

    // 10. Scene Bonus: Bonus Memories
    else if (templateId === 'special_bonus_memories') {
      const intro = container.querySelector('#bonus-stage-intro');
      const main = container.querySelector('#bonus-stage-main');
      const itemTitle = container.querySelector('#bonus-item-title');
      const mediaContainer = container.querySelector('#bonus-media-container');
      const dotsContainer = container.querySelector('#bonus-dots-indicator');
      const nextBtn = container.querySelector('#btn-bonus-next');

      const items = scene.settings?.items || [
        { title: 'ADVENTURE & TRAVEL I', photoUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80' },
        { title: 'THE UNFILTERED LAUGHS', photoUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' },
        { title: 'SIBLING SHENANIGANS', photoUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80' }
      ];

      let currentIndex = 0;

      const loadItem = (idx) => {
        if (idx < 0 || idx >= items.length) return;
        currentIndex = idx;
        const it = items[idx];
        if (itemTitle) itemTitle.textContent = it.title || '';
        if (mediaContainer) {
          mediaContainer.innerHTML = `
            <div class="media-collage-wrapper" style="width:100%; height:100%; position:relative;">
              <div class="media-collage-bg" style="background-image:url('${it.photoUrl}');"></div>
              <img class="media-collage-fg" src="${it.photoUrl}" alt="${it.title}">
            </div>
          `;
        }
        if (dotsContainer) {
          dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
        }
        if (nextBtn) {
          nextBtn.textContent = idx >= items.length - 1 ? 'CONTINUE →' : 'NEXT →';
          nextBtn.classList.add('active');
        }
      };

      if (dotsContainer) {
        dotsContainer.innerHTML = items.map((m, i) => `<button class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></button>`).join('');
        dotsContainer.querySelectorAll('.dot').forEach(d => {
          d.onclick = () => loadItem(parseInt(d.dataset.idx, 10));
        });
      }

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            if (intro) intro.classList.remove('active');
            if (main) { main.classList.add('active'); loadItem(0); }
          }
        });
        this.registerTimeline(tl);
        tl.to({}, { duration: 2.0 });
      } else {
        if (intro) intro.classList.remove('active');
        if (main) { main.classList.add('active'); loadItem(0); }
      }

      if (nextBtn) {
        nextBtn.onclick = () => {
          if (currentIndex < items.length - 1) loadItem(currentIndex + 1);
          else onNext();
        };
      }
    }

    // 11. Scene 10: Finale & Replay
    else if (templateId === 'special_emotional_finale') {
      const canvas = container.querySelector('#specialFinaleCanvas');
      if (canvas) this.createAmbientDust(canvas);

      const textOverlay = container.querySelector('#scene10-text-overlay');
      const photoStage = container.querySelector('#scene10-photo-stage');
      const heroPhoto = container.querySelector('#scene10-hero-photo');
      const contentStage = container.querySelector('#scene10-content-stage');
      const l1 = container.querySelector('#scene10-line-1');
      const l2 = container.querySelector('#scene10-line-2');
      const personalLine = container.querySelector('#scene10-personal-line');
      const signature = container.querySelector('#scene10-signature');
      const replayStage = container.querySelector('#scene10-replay-stage');
      const replayBtn = container.querySelector('#btn-watch-again');

      if (this.hasGSAP && !this.checkReducedMotion()) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            if (replayStage) replayStage.classList.add('active');
          }
        });
        this.registerTimeline(tl);

        // Stage 1: Opening text
        tl.to({}, { duration: 2.2 })
          .to(textOverlay, { opacity: 0, filter: 'blur(8px)', duration: 0.8 })
          .add(() => {
            if (textOverlay) textOverlay.classList.remove('active');
            if (photoStage) photoStage.classList.add('active');
            if (contentStage) contentStage.classList.add('active');
            if (heroPhoto) this.playKenBurns(heroPhoto, 12.0);
          })
          // Stage 2 & 3: Content lines
          .fromTo(l1, { opacity: 0, filter: 'blur(10px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.6, ease: 'power2.out' })
          .fromTo(l2, { opacity: 0, filter: 'blur(10px)', y: 15 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.6, ease: 'power2.out' }, '+=0.4')
          .fromTo(personalLine, { opacity: 0, scale: 0.9, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'back.out(1.4)' }, '+=0.6')
          .fromTo(signature, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.4 }, '+=0.4');
      } else {
        if (textOverlay) textOverlay.classList.remove('active');
        if (contentStage) contentStage.classList.add('active');
        [l1, l2, personalLine, signature].forEach(el => { if (el) el.style.opacity = '1'; });
        if (replayStage) replayStage.classList.add('active');
      }

      if (replayBtn) {
        replayBtn.onclick = (e) => {
          e.stopPropagation();
          onNext({ replay: true });
        };
      }
    }
  }
}

export const specialAnimationEngine = new SpecialAnimationEngine();
