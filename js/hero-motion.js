export function initHeroMotion() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const hero = canvas.parentElement;
  const ctx = canvas.getContext('2d');

  function rgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* Enjoei palette: emerald, lilac, sage green */
  const COLORS = ['#00C85A', '#C8A0FF', '#B8D86A'];

  const BALL_COUNT = 22;
  const TRAIL_GAP  = 6;   // history frames between consecutive balls
  const HEAD_R     = 40;  // radius of lead ball

  let W, H;
  let t = 0;
  let lastMouseTime = 0;
  const mouse = { x: -999, y: -999 };
  const trail = [];

  const balls = [];

  function initBalls() {
    balls.length = 0;
    for (let i = 0; i < BALL_COUNT; i++) {
      const x = 0.1 * W + Math.random() * 0.8 * W;
      const y = 0.1 * H + Math.random() * 0.8 * H;
      balls.push({
        x, y,
        hx: x, hy: y,       // idle home (refreshed on scatter)
        r:  HEAD_R - i * 0.65,
        ci: i % 3,
        ph: i * 0.6,         // idle float phase offset
      });
    }
  }

  function resize() {
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width  = W;
    canvas.height = H;
    initBalls();
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', e => {
    const top = hero.getBoundingClientRect().top;
    mouse.x = e.clientX;
    mouse.y = e.clientY - top;
    lastMouseTime = Date.now();
  });

  function animate() {
    requestAnimationFrame(animate);
    t++;

    const mouseActive = Date.now() - lastMouseTime < 2500 && mouse.x > -500;

    /* Maintain trail history */
    if (mouseActive) {
      trail.unshift({ x: mouse.x, y: mouse.y });
      const cap = BALL_COUNT * TRAIL_GAP + 40;
      if (trail.length > cap) trail.length = cap;
    } else if (trail.length > 0 && t % 3 === 0) {
      trail.length = Math.max(0, trail.length - 1);
    }

    ctx.clearRect(0, 0, W, H);

    balls.forEach((b, i) => {
      /* Target position */
      let tx, ty;
      const ti = i * TRAIL_GAP;

      if (mouseActive && trail.length > ti) {
        tx = trail[ti].x;
        ty = trail[ti].y;
      } else {
        /* Idle: gentle float around home */
        tx = b.hx + Math.sin(t * 0.007 + b.ph) * 28;
        ty = b.hy + Math.cos(t * 0.005 + b.ph + 1.2) * 22;
      }

      /* Lerp — head ball is fastest, tail is slowest */
      const sp = mouseActive
        ? Math.max(0.05, 0.17 - i * 0.005)
        : 0.022;
      b.x += (tx - b.x) * sp;
      b.y += (ty - b.y) * sp;

      /* Draw soft radial gradient circle */
      const r   = Math.max(8, b.r);
      const a   = mouseActive
        ? Math.max(0.22, 0.82 - i * 0.023)
        : 0.58;
      const hex = COLORS[b.ci];

      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0,    rgba(hex, a));
      g.addColorStop(0.45, rgba(hex, a * 0.55));
      g.addColorStop(1,    rgba(hex, 0));

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  animate();
}
