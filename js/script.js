// --- SELEÇÃO DE ELEMENTOS ---
const mario = document.getElementById('mario');
const pipe = document.getElementById('pipe');
const clouds = document.querySelector('.clouds');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const gameOverScreen = document.getElementById('game-over-screen');
const gameBoard = document.getElementById('game-board');

// Botões de interface
const btnRestart = document.getElementById('btn-restart');
const btnPause = document.getElementById('btn-pause');
const btnFullscreen = document.getElementById('btn-fullscreen');
const heroBtns = document.querySelectorAll('.hero-btn');

// Botões mobile
const btnJump = document.getElementById('btn-jump');
const btnCrouch = document.getElementById('btn-crouch');
const btnFire = document.getElementById('btn-fire');

// --- ATRIBUTOS DOS HERÓIS ---
const HEROES = {
  mario: { jumpDuration: 550, jumpHeight: 170, image: './images/mario.gif' },
  luigi: { jumpDuration: 700, jumpHeight: 220, image: './images/luigi.gif' },
  peach: { jumpDuration: 850, jumpHeight: 180, image: './images/peach.gif' },
  toad:  { jumpDuration: 420, jumpHeight: 150, image: './images/toad.gif' }
};

let currentHero = HEROES.mario;
let score = 0;
let coins = 0;
let isPaused = false;
let isGameOver = false;
let gameLoop = null;

// --- SISTEMA DE SELEÇÃO DE HERÓI ---
heroBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    heroBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const heroName = btn.getAttribute('data-hero');
    currentHero = HEROES[heroName];
    if (!isGameOver) {
      mario.src = currentHero.image;
    }
  });
});

// --- FUNÇÃO DE PULO ---
const jump = () => {
  if (isGameOver || isPaused) return;

  if (!mario.classList.contains('jump')) {
    mario.classList.add('jump');

    setTimeout(() => {
      mario.classList.remove('jump');
    }, currentHero.jumpDuration);
  }
};

// --- FUNÇÃO DE AGACHAR ---
const crouch = () => {
  if (isGameOver || isPaused || mario.classList.contains('jump')) return;

  mario.classList.add('crouch');
  setTimeout(() => {
    mario.classList.remove('crouch');
  }, 400);
};

// --- FUNÇÃO DE BOLA DE FOGO ---
const launchFireball = () => {
  if (isGameOver || isPaused) return;

  const fireball = document.createElement('div');
  fireball.classList.add('fireball');

  const marioBottom = parseInt(window.getComputedStyle(mario).bottom) || 0;
  fireball.style.bottom = `${marioBottom + 30}px`;
  fireball.style.left = `${mario.offsetLeft + 60}px`;

  gameBoard.appendChild(fireball);

  let fireballPos = mario.offsetLeft + 60;
  const fireInterval = setInterval(() => {
    if (isPaused) return;

    fireballPos += 12;
    fireball.style.left = `${fireballPos}px`;

    // Verifica colisão com o tubo
    const pipePos = pipe.offsetLeft;
    if (fireballPos >= pipePos && fireballPos <= pipePos + 70) {
      fireball.remove();
      clearInterval(fireInterval);
      score += 50; // Bônus por acerto
    }

    if (fireballPos > gameBoard.offsetWidth) {
      fireball.remove();
      clearInterval(fireInterval);
    }
  }, 20);
};

// --- LOOP PRINCIPAL DO JOGO ---
const startGameLoop = () => {
  gameLoop = setInterval(() => {
    if (isPaused || isGameOver) return;

    // Atualização do Placar
    score += 1;
    scoreElement.textContent = String(score).padStart(6, '0');

    // Posições Atuais
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    const cloudsPosition = clouds.offsetLeft;

    // Detecção Precisa de Colisão
    if (pipePosition <= 100 && pipePosition > 0 && marioPosition < 80) {
      pipe.style.animation = 'none';
      pipe.style.left = `${pipePosition}px`;

      mario.style.animation = 'none';
      mario.style.bottom = `${marioPosition}px`;

      clouds.style.animation = 'none';
      clouds.style.left = `${cloudsPosition}px`;

      mario.src = './images/game-over.png';
      mario.style.width = '75px';
      mario.style.marginLeft = '50px';

      isGameOver = true;
      gameOverScreen.style.display = 'block';
      clearInterval(gameLoop);
    }
  }, 10);
};

// --- PAUSA E REINÍCIO ---
const togglePause = () => {
  if (isGameOver) return;
  isPaused = !isPaused;

  if (isPaused) {
    pipe.style.animationPlayState = 'paused';
    mario.style.animationPlayState = 'paused';
    clouds.style.animationPlayState = 'paused';
    btnPause.textContent = '▶ CONTINUAR';
  } else {
    pipe.style.animationPlayState = 'running';
    mario.style.animationPlayState = 'running';
    clouds.style.animationPlayState = 'running';
    btnPause.textContent = '⏸ PAUSA';
  }
};

const restartGame = () => {
  location.reload();
};

// --- TECLADO ---
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'Space':
    case 'ArrowUp':
    case 'KeyW':
      jump();
      break;
    case 'ArrowDown':
    case 'KeyS':
      crouch();
      break;
    case 'KeyF':
      launchFireball();
      break;
    case 'KeyP':
    case 'Escape':
      togglePause();
      break;
    case 'KeyR':
      restartGame();
      break;
  }
});

// --- TOQUE MOBILE E BOTÕES ---
btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
btnCrouch.addEventListener('touchstart', (e) => { e.preventDefault(); crouch(); });
btnFire.addEventListener('touchstart', (e) => { e.preventDefault(); launchFireball(); });

btnRestart.addEventListener('click', restartGame);
btnPause.addEventListener('click', togglePause);

btnFullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Inicialização
startGameLoop();
