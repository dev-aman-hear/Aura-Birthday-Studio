/**
 * Birthday Studio - Confetti Canvas Particle Engine
 */

export class ConfettiEngine {
  static launch(canvasElement, durationMs = 3500) {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext('2d');
    canvasElement.width = canvasElement.offsetWidth || window.innerWidth;
    canvasElement.height = canvasElement.offsetHeight || window.innerHeight;

    const colors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', '#fd79a8'];
    const particles = [];
    const count = 120;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvasElement.width,
        y: Math.random() * canvasElement.height - canvasElement.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 4 - 2
      });
    }

    let startTime = Date.now();

    function render() {
      if (Date.now() - startTime > durationMs) {
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        return;
      }

      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > canvasElement.height) {
          p.y = -10;
          p.x = Math.random() * canvasElement.width;
        }
      });

      requestAnimationFrame(render);
    }

    render();
  }

  static trigger() {
    let canvas = document.getElementById('confettiCanvasGlobal');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confettiCanvasGlobal';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);
    }
    this.launch(canvas, 4000);
  }
}

export class Confetti extends ConfettiEngine {}

export default ConfettiEngine;
