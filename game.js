const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 20,
  speed: 7,
  color: "#00f5ff",
  hp: 100,
  damage: 1,
  fireRate: 500,
};

let bullets = [];
let enemies = [];
let score = 0;
let coins = parseInt(localStorage.getItem("coins")) || 0;
let level = 1;
let canShoot = true;
let sfxVolume = 1;

// Audio
const shootSound = new Audio("https://freesound.org/data/previews/341/341695_6261366-lq.mp3");
shootSound.volume = sfxVolume;

function createEnemyRow(level) {
  let rows = 3 + Math.floor(level / 5);
  let cols = 10;
  let enemyWidth = 40, enemyHeight = 20;
  enemies = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({
        x: 80 + c * 60,
        y: 60 + r * 50,
        width: enemyWidth,
        height: enemyHeight,
        dx: 1 + level * 0.1,
        dy: 0.2,
        dir: 1,
      });
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
  ctx.fillStyle = "#00f5ff";
  bullets.forEach((b, i) => {
    b.y -= 10;
    ctx.fillRect(b.x, b.y, 5, 10);
    if (b.y < 0) bullets.splice(i, 1);
  });
}

function drawEnemies() {
  enemies.forEach(e => {
    e.x += e.dx * e.dir;
    if (e.x + e.width > canvas.width || e.x < 0) {
      e.dir *= -1;
      e.y += 20;
    }
    ctx.fillStyle = "#ff0077";
    ctx.fillRect(e.x, e.y, e.width, e.height);
    if (e.y + e.height > canvas.height) player.hp -= 10;
  });
}

function detectCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x < e.x + e.width && b.x + 5 > e.x && b.y < e.y + e.height && b.y + 10 > e.y) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        coins += 5;
        localStorage.setItem("coins", coins);
      }
    });
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawEnemies();
  detectCollisions();

  // HUD
  ctx.fillStyle = "#00f5ff";
  ctx.fillText(`Coins: ${coins}`, 10, 20);
  ctx.fillText(`HP: ${player.hp}`, 10, 40);
  ctx.fillText(`Level: ${level}`, 10, 60);

  // Progression
  if (enemies.length === 0) {
    level++;
    createEnemyRow(level);
  }

  // Game Over
  if (player.hp <= 0) {
    alert("Game Over!");
    location.reload();
  }

  requestAnimationFrame(gameLoop);
}

function shoot() {
  bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y });
  shootSound.volume = sfxVolume;
  shootSound.currentTime = 0;
  shootSound.play();
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "ArrowUp" && canShoot) {
    shoot();
    canShoot = false;
    setTimeout(() => canShoot = true, player.fireRate);
  }
});

document.addEventListener("keyup", (e) => delete keys[e.key]);

function movePlayer() {
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;
}

setInterval(movePlayer, 1000 / 60);

function startGame() {
  document.getElementById("main-menu").classList.add("hidden");
  canvas.style.display = "block";
  createEnemyRow(level);
  gameLoop();
}

function toggleSettings() {
  document.getElementById("settings").classList.toggle("hidden");
}

function toggleShop() {
  document.getElementById("shop").classList.toggle("hidden");
}

function buyUpgrade(type, cost) {
  if (coins >= cost) {
    coins -= cost;
    localStorage.setItem("coins", coins);
    if (type === "damage") player.damage++;
    if (type === "rate" && player.fireRate > 100) player.fireRate -= 50;
    document.getElementById("shopCoins").innerText = coins;
  }
}

document.getElementById("sfxVolume").addEventListener("input", (e) => {
  sfxVolume = parseFloat(e.target.value);
});