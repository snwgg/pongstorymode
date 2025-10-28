const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");
const endScreen = document.getElementById("endScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const winnerText = document.getElementById("winnerText");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameInterval;
let playerY, aiY, ballX, ballY, ballSpeedX, ballSpeedY;
let paddleWidth, paddleHeight, ballRadius;
let playerScore, aiScore;
let gameOver = false;

// Ajusta tamanho real do canvas conforme tela
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Inicia o jogo
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

function startGame() {
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  playerY = canvas.height / 2 - 50;
  aiY = canvas.height / 2 - 50;
  paddleWidth = 10;
  paddleHeight = canvas.height / 5;
  ballRadius = 8;
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5;
  ballSpeedY = 3;
  playerScore = 0;
  aiScore = 0;
  gameOver = false;

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000 / 60);
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawText(text, x, y, color, size) {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.fillText(text, x, y);
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // colisão superior e inferior
  if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
    ballSpeedY = -ballSpeedY;
  }

  // movimento da IA
  let aiCenter = aiY + paddleHeight / 2;
  if (aiCenter < ballY - 35) aiY += 4;
  else if (aiCenter > ballY + 35) aiY -= 4;

  // colisão com jogador
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

  // fim de jogo
  if (playerScore >= 5 || aiScore >= 5) {
    endGame();
  }
}

function render() {
  drawRect(0, 0, canvas.width, canvas.height, "black");
  drawRect(0, playerY, paddleWidth, paddleHeight, "#00ff99");
  drawRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight, "#00ff99");
  drawCircle(ballX, ballY, ballRadius, "#00ff99");
  drawText(playerScore, canvas.width / 4, canvas.height / 6, "#fff", canvas.width / 15);
  drawText(aiScore, (canvas.width * 3) / 4, canvas.height / 6, "#fff", canvas.width / 15);
}

function gameLoop() {
  if (!gameOver) {
    update();
    render();
  }
}

function endGame() {
  gameOver = true;
  clearInterval(gameInterval);
  gameContainer.classList.add("hidden");
  endScreen.classList.remove("hidden");
  winnerText.textContent = playerScore > aiScore ? "Você venceu!" : "Você perdeu!";
}

// Controles
window.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  playerY = e.clientY - rect.top - paddleHeight / 2;
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touchY = e.touches[0].clientY - rect.top;
  playerY = touchY - paddleHeight / 2;
});
