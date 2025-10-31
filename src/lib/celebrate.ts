type CelebrateOptions = {
  x?: number;
  y?: number;
  particleCount?: number;
  spread?: number; // degrees
  gravity?: number;
  decay?: number; // 0..1 per frame multiplier for velocity
  zIndex?: number;
  colors?: string[];
  durationMs?: number;
};

function createCanvas(zIndex: number) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = String(zIndex);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  return canvas;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function celebrate(opts: CelebrateOptions = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const {
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    particleCount = 120,
    spread = 70,
    gravity = 0.35,
    decay = 0.995,
    zIndex = 9999,
    colors = ['#10b981', '#22c55e', '#06b6d4', '#f97316', '#eab308', '#8b5cf6'],
    durationMs = 1500,
  } = opts;

  const canvas = createCanvas(zIndex);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const originX = x;
  const originY = y;

  type Particle = {
    x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; rot: number; rSpeed: number; shape: 'rect' | 'circle' | 'triangle';
  };

  const particles: Particle[] = [];
  const angleStart = (-spread / 2) * (Math.PI / 180);
  const angleEnd = (spread / 2) * (Math.PI / 180);

  for (let i = 0; i < particleCount; i++) {
    const angle = rand(angleStart, angleEnd) + (Math.random() < 0.5 ? Math.PI : 0);
    const speed = rand(4, 9);
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: rand(4, 8),
      color: colors[(Math.random() * colors.length) | 0],
      alpha: 1,
      rot: rand(0, Math.PI * 2),
      rSpeed: rand(-0.2, 0.2),
      shape: Math.random() < 0.33 ? 'rect' : Math.random() < 0.5 ? 'circle' : 'triangle',
    });
  }

  let start: number | null = null;
  const dpr = window.devicePixelRatio || 1;
  // handle resize during animation
  const onResize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  onResize();
  window.addEventListener('resize', onResize);

  function drawParticle(p: Particle) {
    ctx.globalAlpha = Math.max(p.alpha, 0);
    ctx.fillStyle = p.color;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const s = p.size;
    switch (p.shape) {
      case 'rect':
        ctx.fillRect(-s / 2, -s / 2, s, s);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(-s / 2, s / 2);
        ctx.lineTo(0, -s / 2);
        ctx.lineTo(s / 2, s / 2);
        ctx.closePath();
        ctx.fill();
        break;
    }
    ctx.restore();
  }

  function step(ts: number) {
    if (start === null) start = ts;
    const elapsed = ts - start;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.vy += gravity;
      p.vx *= decay;
      p.vy *= decay;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rSpeed;
      p.alpha -= 0.012;
      drawParticle(p);
    }

    if (elapsed < durationMs && particles.some(p => p.alpha > 0)) {
      requestAnimationFrame(step);
    } else {
      cleanup();
    }
  }

  function cleanup() {
    window.removeEventListener('resize', onResize);
    try { document.body.removeChild(canvas); } catch {}
  }

  requestAnimationFrame(step);
}
