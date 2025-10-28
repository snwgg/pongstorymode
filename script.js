const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerY = canvas.height / 2 - 50;
let aiY = canvas.height / 2 - 50;
const paddleWidth = 10;
const paddleHeight = 100;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 3;
const ballRadius = 8;

let playerScore = 0;
let aiScore = 0;

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = "30px Arial";
  ctx.fillText(text, x, y);
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
  // movimento da bola
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // colisão com bordas superior e inferior
  if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
    ballSpeedY = -ballSpeedY;
  }

  // movimento do oponente (IA)
  let aiCenter = aiY + paddleHeight / 2;
  if (aiCenter < ballY - 35) aiY += 5;
  else if (aiCenter > ballY + 35) aiY -= 5;

  // colisão com o jogador
  if (
    ballX - ballRadius < paddleWidth &&
    ballY > playerY &&
    ballY < playerY + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX;
  }

  // colisão com IA
  if (
    ballX + ballRadius > canvas.width - paddleWidth &&
    ballY > aiY &&
    ballY < aiY + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX;
  }

  // pontuação
  if (ballX + ballRadius > canvas.width) {
    playerScore++;
    resetBall();
  } else if (ballX - ballRadius < 0) {
    aiScore++;
    resetBall();
  }
}

function render() {
  drawRect(0, 0, canvas.width, canvas.height, "black");
  drawRect(0, playerY, paddleWidth, paddleHeight, "white");
  drawRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight, "white");
  drawCircle(ballX, ballY, ballRadius, "white");
  drawText(playerScore, canvas.width / 4, 50, "white");
  drawText(aiScore, (canvas.width * 3) / 4, 50, "white");
}

function gameLoop() {
  update();
  render();
}

setInterval(gameLoop, 1000 / 60);

// Controle do jogador
window.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  playerY = e.clientY - rect.top - paddleHeight / 2;
});
