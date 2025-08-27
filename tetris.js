/**
 * テトリスゲーム - HTML5 Canvas版
 * 作成日: 2025年8月27日
 * 機能: フル機能テトリスゲーム（回転、ライン消去、スコア、NEXT表示）
 */

// ========================================
// 定数定義
// ========================================
const GAME_CONFIG = {
  ARENA_WIDTH: 12,
  ARENA_HEIGHT: 20,
  BLOCK_SIZE: 20,
  DROP_INTERVAL: 1000,
  PIECES: 'TJLOSZI'
};

const PIECE_COLORS = {
  EMPTY: null,
  T: '#FF0D72',  // ピンク
  O: '#0DC2FF',  // シアン
  L: '#0DFF72',  // グリーン
  J: '#F538FF',  // マゼンタ
  I: '#FF8E0D',  // オレンジ
  S: '#FFE138',  // イエロー
  Z: '#3877FF'   // ブルー
};

// ========================================
// Canvas要素の取得と初期化
// ========================================
const gameCanvas = document.getElementById('tetris');
const gameContext = gameCanvas.getContext('2d');
gameContext.scale(GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE);

const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
nextContext.scale(GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE);

// ========================================
// ゲーム状態変数
// ========================================
let gameState = {
  dropCounter: 0,
  dropInterval: GAME_CONFIG.DROP_INTERVAL,
  lastTime: 0,
  nextPieceType: null,
  isGameOver: false
};

// カラー配列（インデックスベース）
const colors = [
  PIECE_COLORS.EMPTY,
  PIECE_COLORS.T,
  PIECE_COLORS.O,
  PIECE_COLORS.L,
  PIECE_COLORS.J,
  PIECE_COLORS.I,
  PIECE_COLORS.S,
  PIECE_COLORS.Z
];

// ========================================
// ユーティリティ関数
// ========================================

/**
 * 指定されたサイズのマトリックスを作成
 * @param {number} width - 幅
 * @param {number} height - 高さ
 * @returns {Array<Array<number>>} 初期化されたマトリックス
 */
function createMatrix(width, height) {
  const matrix = [];
  while (height--) {
    matrix.push(new Array(width).fill(0));
  }
  return matrix;
}

/**
 * テトリスピースの形状を取得
 * @param {string} type - ピースタイプ (T, O, L, J, I, S, Z)
 * @returns {Array<Array<number>>} ピースの形状マトリックス
 */
function createPiece(type) {
  const pieceShapes = {
    T: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    O: [
      [2, 2],
      [2, 2]
    ],
    L: [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3]
    ],
    J: [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0]
    ],
    I: [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0]
    ],
    S: [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0]
    ],
    Z: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ]
  };
  
  return pieceShapes[type] || [];
}

// ========================================
// 描画関数
// ========================================

/**
 * マトリックスを指定されたコンテキストに描画
 * @param {Array<Array<number>>} matrix - 描画するマトリックス
 * @param {Object} offset - 描画オフセット {x, y}
 * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
 */
function drawMatrix(matrix, offset, ctx = gameContext) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

/**
 * グリッド線を描画
 */
function drawGrid() {
  gameContext.save();
  gameContext.strokeStyle = '#fff';
  gameContext.lineWidth = 0.05;
  
  // 縦線を描画
  for (let x = 1; x < GAME_CONFIG.ARENA_WIDTH; x++) {
    gameContext.beginPath();
    gameContext.moveTo(x, 0);
    gameContext.lineTo(x, GAME_CONFIG.ARENA_HEIGHT);
    gameContext.stroke();
  }
  
  gameContext.restore();
}

/**
 * メイン画面を描画
 */
function drawGame() {
  // 背景をクリア
  gameContext.fillStyle = '#111';
  gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  
  // グリッド線を描画
  drawGrid();
  
  // ゲームエリアを描画
  drawMatrix(gameArena, { x: 0, y: 0 });
  
  // プレイヤーピースを描画（ゲームオーバー時は除く）
  if (!gameState.isGameOver) {
    drawMatrix(player.matrix, player.pos);
  }
  
  // ゲームオーバーテキストを描画
  if (gameState.isGameOver) {
    drawGameOverText();
  }
}

/**
 * NEXTピースを描画
 */
function drawNextPiece() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  
  if (!gameState.nextPieceType) return;
  
  const nextMatrix = createPiece(gameState.nextPieceType);
  const matrixWidth = nextMatrix[0].length;
  const matrixHeight = nextMatrix.length;
  const canvasBlocks = nextCanvas.width / GAME_CONFIG.BLOCK_SIZE;
  const canvasBlocksH = nextCanvas.height / GAME_CONFIG.BLOCK_SIZE;
  
  // 中央に配置するためのオフセット計算
  const offsetX = (canvasBlocks - matrixWidth) / 2;
  const offsetY = (canvasBlocksH - matrixHeight) / 2;
  
  drawMatrix(nextMatrix, { x: offsetX, y: offsetY }, nextContext);
}

/**
 * ゲームオーバーテキストを描画
 */
function drawGameOverText() {
  gameContext.save();
  gameContext.globalAlpha = 0.7;
  gameContext.fillStyle = '#000';
  gameContext.fillRect(0, 8, GAME_CONFIG.ARENA_WIDTH, 4);
  gameContext.globalAlpha = 1;
  gameContext.fillStyle = '#fff';
  gameContext.font = '1.5px sans-serif';
  gameContext.textAlign = 'center';
  gameContext.fillText('GAME OVER', GAME_CONFIG.ARENA_WIDTH / 2, 10.5);
  gameContext.restore();
}

// ========================================
// ゲームロジック関数
// ========================================

/**
 * プレイヤーピースをアリーナにマージ
 * @param {Array<Array<number>>} arena - ゲームアリーナ
 * @param {Object} player - プレイヤーオブジェクト
 */
function mergePlayerToArena(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

/**
 * 衝突検出
 * @param {Array<Array<number>>} arena - ゲームアリーナ
 * @param {Object} player - プレイヤーオブジェクト
 * @returns {boolean} 衝突している場合true
 */
function checkCollision(arena, player) {
  const matrix = player.matrix;
  const offset = player.pos;
  
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < matrix[y].length; ++x) {
      if (
        matrix[y][x] !== 0 &&
        (arena[y + offset.y] && arena[y + offset.y][x + offset.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * マトリックスを90度回転
 * @param {Array<Array<number>>} matrix - 回転するマトリックス
 * @param {number} direction - 回転方向 (1: 右回転, -1: 左回転)
 */
function rotateMatrix(matrix, direction) {
  // 転置
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  
  // 行の順序を変更
  if (direction > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

/**
 * 完成したラインをスイープ（削除）
 * @param {Array<Array<number>>} arena - ゲームアリーナ
 * @returns {number} 削除されたライン数
 */
function sweepLines(arena) {
  let linesCleared = 0;
  let rowMultiplier = 1;
  
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    // ラインが完成しているかチェック
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    
    // ラインを削除して上に新しい空のラインを追加
    const clearedRow = arena.splice(y, 1)[0].fill(0);
    arena.unshift(clearedRow);
    
    // スコア計算
    player.score += rowMultiplier * 10;
    rowMultiplier *= 2;
    linesCleared++;
    
    // 同じy位置を再チェック
    ++y;
  }
  
  return linesCleared;
}

// ========================================
// プレイヤー操作関数
// ========================================

/**
 * プレイヤーピースを1段落下
 */
function dropPlayer() {
  if (gameState.isGameOver) return;
  
  player.pos.y++;
  if (checkCollision(gameArena, player)) {
    player.pos.y--;
    mergePlayerToArena(gameArena, player);
    resetPlayer();
    
    if (!gameState.isGameOver) {
      sweepLines(gameArena);
      updateScoreDisplay();
    }
  }
  gameState.dropCounter = 0;
}

/**
 * プレイヤーピースを左右に移動
 * @param {number} direction - 移動方向 (-1: 左, 1: 右)
 */
function movePlayer(direction) {
  if (gameState.isGameOver) return;
  
  player.pos.x += direction;
  if (checkCollision(gameArena, player)) {
    player.pos.x -= direction;
  }
}

/**
 * プレイヤーピースを回転
 * @param {number} direction - 回転方向 (1: 右回転, -1: 左回転)
 */
function rotatePlayer(direction) {
  if (gameState.isGameOver) return;
  
  const originalX = player.pos.x;
  let offsetStep = 1;
  
  rotateMatrix(player.matrix, direction);
  
  // 壁キック（回転後に衝突する場合の位置調整）
  while (checkCollision(gameArena, player)) {
    player.pos.x += offsetStep;
    offsetStep = -(offsetStep + (offsetStep > 0 ? 1 : -1));
    
    // 調整できない場合は回転を取り消し
    if (offsetStep > player.matrix[0].length) {
      rotateMatrix(player.matrix, -direction);
      player.pos.x = originalX;
      return;
    }
  }
}

/**
 * 新しいプレイヤーピースを生成
 */
function resetPlayer() {
  // 次のピースタイプが未設定の場合はランダムに選択
  if (!gameState.nextPieceType) {
    gameState.nextPieceType = GAME_CONFIG.PIECES[
      Math.floor(Math.random() * GAME_CONFIG.PIECES.length)
    ];
  }
  
  // 現在のピースを次のピースに設定
  player.matrix = createPiece(gameState.nextPieceType);
  
  // 新しい次のピースをランダムに選択
  gameState.nextPieceType = GAME_CONFIG.PIECES[
    Math.floor(Math.random() * GAME_CONFIG.PIECES.length)
  ];
  
  // ピースの初期位置を設定
  player.pos.y = 0;
  player.pos.x = Math.floor((GAME_CONFIG.ARENA_WIDTH / 2) - (player.matrix[0].length / 2));
  
  // ゲームオーバーチェック
  if (checkCollision(gameArena, player)) {
    gameState.isGameOver = true;
    document.getElementById('restart').style.display = 'inline-block';
    drawGame();
    return;
  }
  
  drawNextPiece();
}

// ========================================
// UI更新関数
// ========================================

/**
 * スコア表示を更新
 */
function updateScoreDisplay() {
  document.getElementById('score').innerText = `Score: ${player.score}`;
}

/**
 * ゲームリスタート
 */
function restartGame() {
  // アリーナをクリア
  gameArena.forEach(row => row.fill(0));
  
  // プレイヤー状態をリセット
  player.score = 0;
  updateScoreDisplay();
  
  // ゲーム状態をリセット
  gameState.isGameOver = false;
  gameState.nextPieceType = null;
  
  // UI要素を非表示
  document.getElementById('restart').style.display = 'none';
  
  // 新しいゲームを開始
  resetPlayer();
  gameLoop();
}

// ========================================
// メインゲームループ
// ========================================

/**
 * メインゲームループ
 * @param {number} time - 現在時刻
 */
function gameLoop(time = 0) {
  drawGame();
  
  if (gameState.isGameOver) return;
  
  const deltaTime = time - gameState.lastTime;
  gameState.lastTime = time;
  gameState.dropCounter += deltaTime;
  
  if (gameState.dropCounter > gameState.dropInterval) {
    dropPlayer();
  }
  
  requestAnimationFrame(gameLoop);
}

// ========================================
// ゲーム状態の初期化
// ========================================

// ゲームアリーナの作成
const gameArena = createMatrix(GAME_CONFIG.ARENA_WIDTH, GAME_CONFIG.ARENA_HEIGHT);

// プレイヤーオブジェクトの初期化
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0
};

// ========================================
// イベントリスナーの設定
// ========================================

// キーボード入力イベント
document.addEventListener('keydown', (event) => {
  if (gameState.isGameOver) return;
  
  const keyActions = {
    'ArrowLeft': () => movePlayer(-1),
    'ArrowRight': () => movePlayer(1),
    'ArrowDown': () => dropPlayer(),
    'q': () => rotatePlayer(-1),
    'w': () => rotatePlayer(1)
  };
  
  const action = keyActions[event.key];
  if (action) {
    action();
  }
});

// リスタートボタンイベント
document.getElementById('restart').addEventListener('click', restartGame);

// ========================================
// ゲーム開始
// ========================================

// 初期設定
resetPlayer();
updateScoreDisplay();
gameLoop();