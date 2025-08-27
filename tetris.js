// --- テトリス完全修正版 ---
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
nextContext.scale(20, 20);

const arenaWidth = 12;
const arenaHeight = 20;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let nextPieceType = null;
let isGameOver = false;

const colors = [
  null,
  '#FF0D72', // T
  '#0DC2FF', // O
  '#0DFF72', // L
  '#F538FF', // J
  '#FF8E0D', // I
  '#FFE138', // S
  '#3877FF', // Z
];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'T':
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    case 'O':
      return [
        [2, 2],
        [2, 2],
      ];
    case 'L':
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
      ];
    case 'J':
      return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0],
      ];
    case 'I':
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
      ];
    case 'S':
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    case 'Z':
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ];
    default:
      return [];
  }
}

function drawMatrix(matrix, offset, ctx = context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (
        m[y][x] !== 0 &&
        (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function playerDrop() {
  if (isGameOver) return;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    if (!isGameOver) {
      arenaSweep();
      updateScore();
    }
  }
  dropCounter = 0;
}

function playerMove(dir) {
  if (isGameOver) return;
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  if (isGameOver) return;
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerReset() {
  const pieces = 'TJLOSZI';
  if (!nextPieceType) {
    nextPieceType = pieces[(pieces.length * Math.random()) | 0];
  }
  player.matrix = createPiece(nextPieceType);
  nextPieceType = pieces[(pieces.length * Math.random()) | 0];
  player.pos.y = 0;
  player.pos.x = ((arenaWidth / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    isGameOver = true;
    document.getElementById('restart').style.display = 'inline-block';
    draw();
    return;
  }
  drawNext();
}

function drawNext() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const nextMatrix = createPiece(nextPieceType);
  const blockSize = 20;
  const matrixWidth = nextMatrix[0].length;
  const matrixHeight = nextMatrix.length;
  const canvasBlocks = nextCanvas.width / blockSize;
  const canvasBlocksH = nextCanvas.height / blockSize;
  const offsetX = (canvasBlocks - matrixWidth) / 2;
  const offsetY = (canvasBlocksH - matrixHeight) / 2;
  drawMatrix(nextMatrix, { x: offsetX, y: offsetY }, nextContext);
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function showGameOverText() {
  context.save();
  context.globalAlpha = 0.7;
  context.fillStyle = '#000';
  context.fillRect(0, 8, arenaWidth, 4);
  context.globalAlpha = 1;
  context.fillStyle = '#fff';
  context.font = '1.5px sans-serif';
  context.textAlign = 'center';
  context.fillText('GAME OVER', arenaWidth / 2, 10.5);
  context.restore();
}

function draw() {
  context.fillStyle = '#111';
  context.fillRect(0, 0, canvas.width, canvas.height);
  // グリッド線（縦線）
  context.save();
  context.strokeStyle = '#fff';
  context.lineWidth = 0.05;
  for (let x = 1; x < arenaWidth; x++) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, arenaHeight);
    context.stroke();
  }
  context.restore();
  drawMatrix(arena, { x: 0, y: 0 });
  if (!isGameOver) {
    drawMatrix(player.matrix, player.pos);
  }
  if (isGameOver) {
    showGameOverText();
  }
}

function updateScore() {
  document.getElementById('score').innerText = 'Score: ' + player.score;
}

// ゲーム状態の初期化
const arena = createMatrix(arenaWidth, arenaHeight);
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

// イベントリスナー
document.addEventListener('keydown', event => {
  if (isGameOver) return;
  if (event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if (event.key === 'ArrowRight') {
    playerMove(1);
  } else if (event.key === 'ArrowDown') {
    playerDrop();
  } else if (event.key === 'q') {
    playerRotate(-1);
  } else if (event.key === 'w') {
    playerRotate(1);
  }
});

document.getElementById('restart').addEventListener('click', () => {
  arena.forEach(row => row.fill(0));
  player.score = 0;
  updateScore();
  isGameOver = false;
  document.getElementById('restart').style.display = 'none';
  playerReset();
  update();
});

function update(time = 0) {
  draw();
  if (isGameOver) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  requestAnimationFrame(update);
}

// ゲーム開始
playerReset();
updateScore();
update();