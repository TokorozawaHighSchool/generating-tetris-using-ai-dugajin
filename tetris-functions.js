/**
 * テトリス テスト用関数ライブラリ
 * ゲームの自動実行を含まない関数のみを提供
 */

// ========================================
// 定数定義
// ========================================
const GAME_CONFIG = {
  COLS: 12,
  ROWS: 20,
  BLOCK_SIZE: 20,
  COLORS: [
    null,
    '#FF0D72', // I
    '#0DC2FF', // O
    '#0DFF72', // T
    '#F538FF', // S
    '#FF8E0D', // Z
    '#FFE138', // J
    '#3877FF'  // L
  ]
};

// ========================================
// ユーティリティ関数
// ========================================

/**
 * 2次元配列（マトリックス）を作成
 * @param {number} w - 幅
 * @param {number} h - 高さ
 * @returns {Array} 初期化された2次元配列
 */
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

/**
 * テトリスピースを作成
 * @param {string} type - ピースタイプ (T, O, L, J, I, S, Z)
 * @returns {Array} ピースの形状を表す2次元配列
 */
function createPiece(type) {
  const pieces = {
    'T': [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    'O': [
      [2, 2],
      [2, 2]
    ],
    'L': [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3]
    ],
    'J': [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0]
    ],
    'I': [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0]
    ],
    'S': [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0]
    ],
    'Z': [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ]
  };
  
  return pieces[type] || pieces['T'];
}

/**
 * マトリックスを描画（テスト用ダミー関数）
 * @param {Array} matrix - 描画するマトリックス
 * @param {Object} context - Canvas 2Dコンテキスト
 * @param {number} offsetX - X軸オフセット
 * @param {number} offsetY - Y軸オフセット
 */
function drawMatrix(matrix, context, offsetX = 0, offsetY = 0) {
  // テスト用: 実際の描画は行わない
  return true;
}

/**
 * マトリックスを回転
 * @param {Array} matrix - 回転するマトリックス
 * @param {number} dir - 回転方向 (1: 時計回り, -1: 反時計回り)
 * @returns {Array} 回転後のマトリックス
 */
function rotate(matrix, dir) {
  const result = createMatrix(matrix.length, matrix[0].length);
  
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < matrix[y].length; ++x) {
      if (dir > 0) {
        result[x][matrix.length - 1 - y] = matrix[y][x];
      } else {
        result[matrix[0].length - 1 - x][y] = matrix[y][x];
      }
    }
  }
  
  return result;
}

/**
 * マトリックス同士をマージ
 * @param {Array} arena - ベースとなるマトリックス
 * @param {Array} player - マージするプレイヤーマトリックス
 * @param {Object} offset - オフセット位置 {x, y}
 * @returns {Array} マージ後のマトリックス
 */
function merge(arena, player, offset) {
  const result = arena.map(row => [...row]);
  
  player.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const arenaY = y + offset.y;
        const arenaX = x + offset.x;
        if (arenaY >= 0 && arenaY < result.length && 
            arenaX >= 0 && arenaX < result[0].length) {
          result[arenaY][arenaX] = value;
        }
      }
    });
  });
  
  return result;
}

// ========================================
// ゲームロジック関数
// ========================================

/**
 * 衝突判定
 * @param {Array} arena - ゲームフィールド
 * @param {Array} player - プレイヤーピース
 * @param {Object} offset - プレイヤー位置 {x, y}
 * @returns {boolean} 衝突しているかどうか
 */
function collide(arena, player, offset) {
  for (let y = 0; y < player.length; ++y) {
    for (let x = 0; x < player[y].length; ++x) {
      if (player[y][x] !== 0 &&
         (arena[y + offset.y] &&
          arena[y + offset.y][x + offset.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

/**
 * ライン消去の対象行を検出
 * @param {Array} arena - ゲームフィールド
 * @returns {Array} 消去対象の行番号の配列
 */
function arenaSweep(arena) {
  let rowsToRemove = [];
  
  for (let y = arena.length - 1; y >= 0; --y) {
    if (arena[y].every(cell => cell !== 0)) {
      rowsToRemove.push(y);
    }
  }
  
  return rowsToRemove;
}

/**
 * ラインクリア実行
 * @param {Array} arena - ゲームフィールド
 * @param {Array} rowsToRemove - 削除する行の配列
 * @returns {Array} ラインクリア後のアリーナ
 */
function clearLines(arena, rowsToRemove) {
  const newArena = arena.filter((_, index) => !rowsToRemove.includes(index));
  
  // 削除した行数分、上に新しい空行を追加
  const emptyRows = rowsToRemove.length;
  for (let i = 0; i < emptyRows; i++) {
    newArena.unshift(new Array(arena[0].length).fill(0));
  }
  
  return newArena;
}

/**
 * スコア計算
 * @param {number} lineCount - 消去したライン数
 * @param {number} level - 現在のレベル
 * @returns {number} 獲得スコア
 */
function calculateScore(lineCount, level) {
  const baseScores = [0, 40, 100, 300, 1200];
  return baseScores[lineCount] * (level + 1);
}

/**
 * レベル計算
 * @param {number} lines - 総消去ライン数
 * @returns {number} 現在のレベル
 */
function calculateLevel(lines) {
  return Math.floor(lines / 10);
}

// ========================================
// テスト用の簡易ゲーム状態
// ========================================

// テスト用のグローバル変数（実際のゲームとは分離）
window.testGameState = {
  arena: createMatrix(GAME_CONFIG.COLS, GAME_CONFIG.ROWS),
  player: {
    matrix: createPiece('T'),
    pos: { x: 5, y: 0 }
  },
  score: 0,
  lines: 0,
  level: 0,
  isGameOver: false
};

console.log('✅ テスト用テトリス関数ライブラリが読み込まれました');
