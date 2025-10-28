(function () {
  const canvas = document.getElementById('gameCanvas');
  const wrap = document.getElementById('canvasWrap');
  const serveBtn = document.getElementById('btnServe');
  const pauseBtn = document.getElementById('btnPause');
  const resetBtn = document.getElementById('btnReset');
  const levelLabel = document.getElementById('levelLabel');
  const scoreLabel = document.getElementById('scoreLabel');
  const ctx = canvas.getContext('2d');

  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let w, h;

  const game = {
    width: 320,
    height: 480,
    paddleWidthPct: 0.22,
    paddleHeight: 12,
    player: null,
    cpu: null,
    ball: null,
    running: false,
    paused: false,
    lastTime: 0,
    scoreP: 0,
    scoreC: 0,
    difficulty: 'easy'
  };

  function resize() {
    const rect = wrap.getBoundingClientRect();
    const availW = Math.min(rect.width, 920);
    const availH = Math.min(window.innerHeight - 200, 720);
    canvas.style.width = availW + 'px';
    canvas.style.height = availH + 'px';
    w = Math.round(availW * DPR);
    h = Math.round(availH * DPR);
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(DPR, DPR);
    game.width = availW;
    game.height = availH;
  }

  function resetGame() {
    game.scoreP = 0;
    game.scoreC = 0;
    createEntities();
    game.running = false;
    game.paused = false;
    updateScoreLabel();
  }

  function createEntities() {
    const gw = game.width;
    const ph = game.paddleHeight;
    const pw = Math.max(48, Math.floor(gw * game.paddleWidthPct));
    game.player = { w: pw, h: ph, x: (gw - pw) / 2, y: game.height - ph - 10 };
    game.cpu = { w: pw, h: ph, x: (gw - pw) / 2, y: 10 };
    game.ball = {
      r: Math.max(7, Math.floor(gw * 0.018)),
      x: gw / 2,
      y: game.height / 2,
      vx: 0,
      vy: 0,
      speed: Math.max(220, gw * 0.6)
    };
  }

  function serve(direction = 1) {
    const b = game.ball;
    b.x = game.width / 2;
    b.y = game.height / 2;
    const angle = Math.random() * 0.6 - 0.3;
    b.vx = Math.sin(angle) * b.speed;
    b.vy = direction * Math.cos(angle) * b.speed;
    game.running = true;
    game.paused = false;
  }

  function updateScoreLabel() {
    scoreLabel.textContent = `Você ${game.scoreP} — ${game.scoreC} CPU`;
  }

  function draw() {
    ctx.clearRect(0, 0, game.width, game.height);
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.moveTo(game.width / 2, 0);
    ctx.lineTo(game.width / 2, game.height);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#e6f9ef';
    ctx.fillRect(game.cpu.x, game.cpu.y, game.cpu.w, game.cpu.h);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(game.player.x, game.player.y, game.player.w, game.player.h);
    ctx.beginPath();
    ctx.fillStyle = '#34d399';
    ctx.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function step(dt) {
    if (!game.running || game.paused) return;
    const b = game.ball;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x - b.r < 0 || b.x + b.r > game.width) b.vx *= -1;

    if (b.y - b.r < 0) {
      game.scoreP++;
      updateScoreLabel();
      game.running = false;
      setTimeout(() => serve(1), 600);
      return;
    }
    if (b.y + b.r > game.height) {
      game.scoreC++;
      updateScoreLabel();
      game.running = false;
      setTimeout(() => serve(-1), 600);
      return;
    }

    if (circleRectCollision(b, game.player)) b.vy *= -1;
    if (circleRectCollision(b, game.cpu)) b.vy *= -1;

    const dx = b.x - (game.cpu.x + game.cpu.w / 2);
    game.cpu.x += dx * 0.04;
    clampPaddles();
  }

  function circleRectCollision(c, r) {
    const rx = r.x, ry = r.y, rw = r.w, rh = r.h;
    const closestX = Math.max(rx, Math.min(c.x, rx + rw));
    const closestY = Math.max(ry, Math.min(c.y, ry + rh));
    const dx = c.x - closestX, dy = c.y - closestY;
    return dx * dx + dy * dy < c.r * c.r;
  }

  function clampPaddles() {
    game.player.x = Math.max(0, Math.min(game.player.x, game.width - game.player.w));
    game.cpu.x = Math.max(0, Math.min(game.cpu.x, game.width - game.cpu.w));
  }

  function movePlayerTo(x) {
    game.player.x = x;
    clampPaddles();
  }

  function getEventX(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches?.length) return e.touches[0].clientX - rect.left;
    return e.clientX - rect.left;
  }

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (!game.running) serve(1);
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    movePlayerTo(getEventX(e) - game.player.w / 2);
  });

  serveBtn.onclick = () => serve(1);
  pauseBtn.onclick = () => {
    game.paused = !game.paused;
    pauseBtn.textContent = game.paused ? 'Retomar' : 'Pausar';
  };
  resetBtn.onclick = () => resetGame();

  function loop(ts) {
    if (!game.lastTime) game.lastTime = ts;
    const dt = Math.min(0.03, (ts - game.lastTime) / 1000);
    game.lastTime = ts;
    step(dt);
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);

  resetGame();
  resize();
  draw();
  requestAnimationFrame(loop);
})();
