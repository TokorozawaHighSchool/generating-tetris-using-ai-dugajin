/**
 * テトリス ユニットテスト
 * テストフレームワーク: 自作の軽量テストランナー
 */

// ========================================
// テストフレームワーク
// ========================================
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  /**
   * テストを追加
   * @param {string} name - テスト名
   * @param {Function} testFn - テスト関数
   */
  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * アサーション: 等価チェック
   * @param {*} actual - 実際の値
   * @param {*} expected - 期待値
   * @param {string} message - エラーメッセージ
   */
  assertEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}\n期待値: ${JSON.stringify(expected)}\n実際値: ${JSON.stringify(actual)}`);
    }
  }

  /**
   * アサーション: 真偽値チェック
   * @param {*} value - チェックする値
   * @param {string} message - エラーメッセージ
   */
  assertTrue(value, message = '') {
    if (!value) {
      throw new Error(`${message}\n期待値: true\n実際値: ${value}`);
    }
  }

  /**
   * アサーション: 偽値チェック
   * @param {*} value - チェックする値
   * @param {string} message - エラーメッセージ
   */
  assertFalse(value, message = '') {
    if (value) {
      throw new Error(`${message}\n期待値: false\n実際値: ${value}`);
    }
  }

  /**
   * アサーション: 配列の長さチェック
   * @param {Array} array - チェックする配列
   * @param {number} expectedLength - 期待する長さ
   * @param {string} message - エラーメッセージ
   */
  assertLength(array, expectedLength, message = '') {
    if (array.length !== expectedLength) {
      throw new Error(`${message}\n期待される長さ: ${expectedLength}\n実際の長さ: ${array.length}`);
    }
  }

  /**
   * すべてのテストを実行
   */
  async runAll() {
    this.results = [];
    
    for (const test of this.tests) {
      try {
        await test.testFn.call(this);
        this.results.push({ name: test.name, status: 'pass', error: null });
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.results.push({ name: test.name, status: 'fail', error: error.message });
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
    
    this.displayResults();
  }

  /**
   * テスト結果を画面に表示
   */
  displayResults() {
    const container = document.getElementById('test-results');
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    
    let html = `<div class="test-summary">
      テスト結果: ${passed}件成功, ${failed}件失敗 (合計${this.results.length}件)
    </div>`;
    
    this.results.forEach(result => {
      const cssClass = result.status === 'pass' ? 'test-pass' : 'test-fail';
      const icon = result.status === 'pass' ? '✅' : '❌';
      html += `<div class="test-result ${cssClass}">
        ${icon} ${result.name}
        ${result.error ? `<br><small>${result.error}</small>` : ''}
      </div>`;
    });
    
    container.innerHTML = html;
  }
}

// ========================================
// テストケース
// ========================================

const testRunner = new TestRunner();

// ユーティリティ関数のテスト
testRunner.test('createMatrix - 正しいサイズのマトリックスを作成', function() {
  const matrix = createMatrix(3, 2);
  this.assertLength(matrix, 2, 'マトリックスの行数が正しくない');
  this.assertLength(matrix[0], 3, 'マトリックスの列数が正しくない');
  this.assertEqual(matrix[0][0], 0, 'マトリックスの初期値が0でない');
});

testRunner.test('createPiece - Tピースの形状が正しい', function() {
  const tPiece = createPiece('T');
  const expected = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0]
  ];
  this.assertEqual(tPiece, expected, 'Tピースの形状が期待値と異なる');
});

testRunner.test('createPiece - Oピースの形状が正しい', function() {
  const oPiece = createPiece('O');
  const expected = [
    [2, 2],
    [2, 2]
  ];
  this.assertEqual(oPiece, expected, 'Oピースの形状が期待値と異なる');
});

testRunner.test('createPiece - Iピースの形状が正しい', function() {
  const iPiece = createPiece('I');
  const expected = [
    [0, 5, 0, 0],
    [0, 5, 0, 0],
    [0, 5, 0, 0],
    [0, 5, 0, 0]
  ];
  this.assertEqual(iPiece, expected, 'Iピースの形状が期待値と異なる');
});

testRunner.test('createPiece - 無効なピースタイプで空配列を返す', function() {
  const invalidPiece = createPiece('X');
  this.assertEqual(invalidPiece, [], '無効なピースタイプで空配列が返されない');
});

// 回転テスト
testRunner.test('rotateMatrix - 右回転が正しく動作', function() {
  const matrix = [
    [1, 0],
    [1, 1]
  ];
  rotateMatrix(matrix, 1);
  const expected = [
    [1, 1],
    [0, 1]
  ];
  this.assertEqual(matrix, expected, '右回転が正しく動作しない');
});

testRunner.test('rotateMatrix - 左回転が正しく動作', function() {
  const matrix = [
    [1, 0],
    [1, 1]
  ];
  rotateMatrix(matrix, -1);
  const expected = [
    [1, 0],
    [1, 1]
  ];
  this.assertEqual(matrix, expected, '左回転が正しく動作しない');
});

// 衝突検出テスト
testRunner.test('checkCollision - 空のアリーナで衝突しない', function() {
  const arena = createMatrix(10, 20);
  const testPlayer = {
    matrix: [[1]],
    pos: { x: 5, y: 5 }
  };
  const collision = checkCollision(arena, testPlayer);
  this.assertFalse(collision, '空のアリーナで衝突が検出された');
});

testRunner.test('checkCollision - ブロックがある場所で衝突を検出', function() {
  const arena = createMatrix(10, 20);
  arena[5][5] = 1; // ブロックを配置
  
  const testPlayer = {
    matrix: [[1]],
    pos: { x: 5, y: 5 }
  };
  const collision = checkCollision(arena, testPlayer);
  this.assertTrue(collision, 'ブロックがある場所で衝突が検出されない');
});

testRunner.test('checkCollision - 境界外で衝突を検出', function() {
  const arena = createMatrix(10, 20);
  const testPlayer = {
    matrix: [[1]],
    pos: { x: -1, y: 5 } // 左境界外
  };
  const collision = checkCollision(arena, testPlayer);
  this.assertTrue(collision, '境界外で衝突が検出されない');
});

testRunner.test('checkCollision - 下端境界で衝突を検出', function() {
  const arena = createMatrix(10, 20);
  const testPlayer = {
    matrix: [[1]],
    pos: { x: 5, y: 20 } // 下端境界外
  };
  const collision = checkCollision(arena, testPlayer);
  this.assertTrue(collision, '下端境界で衝突が検出されない');
});

// マージテスト
testRunner.test('mergePlayerToArena - プレイヤーピースがアリーナに正しくマージされる', function() {
  const arena = createMatrix(10, 20);
  const testPlayer = {
    matrix: [
      [1, 1],
      [0, 1]
    ],
    pos: { x: 3, y: 5 }
  };
  
  mergePlayerToArena(arena, testPlayer);
  
  this.assertEqual(arena[5][3], 1, 'マージ位置(5,3)が正しくない');
  this.assertEqual(arena[5][4], 1, 'マージ位置(5,4)が正しくない');
  this.assertEqual(arena[6][3], 0, 'マージ位置(6,3)が正しくない（0のまま）');
  this.assertEqual(arena[6][4], 1, 'マージ位置(6,4)が正しくない');
});

// ライン消去テスト
testRunner.test('sweepLines - 完成したラインが削除される', function() {
  const arena = createMatrix(10, 20);
  
  // 最下行を完成させる
  for (let x = 0; x < 10; x++) {
    arena[19][x] = 1;
  }
  
  // プレイヤーオブジェクトを一時的に作成
  const originalPlayer = window.player;
  window.player = { score: 0 };
  
  const linesCleared = sweepLines(arena);
  
  this.assertEqual(linesCleared, 1, '1ライン削除されるべき');
  this.assertEqual(window.player.score, 10, 'スコアが10増加するべき');
  
  // 最下行が空になっているかチェック
  for (let x = 0; x < 10; x++) {
    this.assertEqual(arena[19][x], 0, '削除後の最下行が空でない');
  }
  
  // プレイヤーオブジェクトを復元
  window.player = originalPlayer;
});

testRunner.test('sweepLines - 複数ライン同時削除でスコア倍増', function() {
  const arena = createMatrix(10, 20);
  
  // 最下2行を完成させる
  for (let y = 18; y <= 19; y++) {
    for (let x = 0; x < 10; x++) {
      arena[y][x] = 1;
    }
  }
  
  // プレイヤーオブジェクトを一時的に作成
  const originalPlayer = window.player;
  window.player = { score: 0 };
  
  const linesCleared = sweepLines(arena);
  
  this.assertEqual(linesCleared, 2, '2ライン削除されるべき');
  this.assertEqual(window.player.score, 30, 'スコアが30増加するべき (10 + 20)');
  
  // プレイヤーオブジェクトを復元
  window.player = originalPlayer;
});

// 設定値テスト
testRunner.test('GAME_CONFIG - 設定値が正しく定義されている', function() {
  this.assertEqual(GAME_CONFIG.ARENA_WIDTH, 12, 'アリーナ幅が正しくない');
  this.assertEqual(GAME_CONFIG.ARENA_HEIGHT, 20, 'アリーナ高さが正しくない');
  this.assertEqual(GAME_CONFIG.BLOCK_SIZE, 20, 'ブロックサイズが正しくない');
  this.assertEqual(GAME_CONFIG.PIECES, 'TJLOSZI', 'ピース文字列が正しくない');
});

testRunner.test('colors配列 - 色が正しく定義されている', function() {
  this.assertEqual(colors.length, 8, '色配列の長さが正しくない');
  this.assertEqual(colors[0], null, 'インデックス0が空でない');
  this.assertTrue(colors[1].startsWith('#'), 'Tピースの色がHEX形式でない');
});

// ========================================
// 統合テスト
// ========================================

testRunner.test('統合テスト - ゲーム初期化が正常に完了', function() {
  this.assertTrue(gameArena instanceof Array, 'ゲームアリーナが配列でない');
  this.assertLength(gameArena, GAME_CONFIG.ARENA_HEIGHT, 'アリーナの高さが正しくない');
  this.assertLength(gameArena[0], GAME_CONFIG.ARENA_WIDTH, 'アリーナの幅が正しくない');
  
  this.assertTrue(typeof player === 'object', 'プレイヤーオブジェクトが存在しない');
  this.assertTrue('pos' in player, 'プレイヤーに位置情報がない');
  this.assertTrue('score' in player, 'プレイヤーにスコア情報がない');
});

testRunner.test('統合テスト - Canvas要素が正しく初期化されている', function() {
  this.assertTrue(gameCanvas instanceof HTMLCanvasElement, 'ゲームキャンバスが取得できない');
  this.assertTrue(nextCanvas instanceof HTMLCanvasElement, 'NEXTキャンバスが取得できない');
  this.assertTrue(gameContext instanceof CanvasRenderingContext2D, 'ゲームコンテキストが取得できない');
  this.assertTrue(nextContext instanceof CanvasRenderingContext2D, 'NEXTコンテキストが取得できない');
});

testRunner.test('統合テスト - 全ピースタイプが生成可能', function() {
  const pieces = GAME_CONFIG.PIECES.split('');
  pieces.forEach(pieceType => {
    const piece = createPiece(pieceType);
    this.assertTrue(piece.length > 0, `${pieceType}ピースが生成できない`);
    this.assertTrue(piece[0].length > 0, `${pieceType}ピースの幅が0`);
  });
});

testRunner.test('統合テスト - プレイヤー移動機能', function() {
  // テスト用の状態を保存
  const originalGameState = { ...gameState };
  const originalPlayer = { ...player, matrix: player.matrix ? [...player.matrix] : null };
  
  // ゲーム状態をリセット
  gameState.isGameOver = false;
  player.pos = { x: 5, y: 5 };
  player.matrix = createPiece('T');
  
  const originalX = player.pos.x;
  
  // 右移動テスト
  movePlayer(1);
  this.assertEqual(player.pos.x, originalX + 1, '右移動が正しく動作しない');
  
  // 左移動テスト
  movePlayer(-1);
  this.assertEqual(player.pos.x, originalX, '左移動が正しく動作しない');
  
  // 状態を復元
  Object.assign(gameState, originalGameState);
  Object.assign(player, originalPlayer);
});

testRunner.test('統合テスト - ゲームオーバー状態での操作無効化', function() {
  // テスト用の状態を保存
  const originalGameState = { ...gameState };
  const originalPlayer = { ...player, pos: { ...player.pos } };
  
  // ゲームオーバー状態に設定
  gameState.isGameOver = true;
  const originalX = player.pos.x;
  
  // 移動操作（無効化されるべき）
  movePlayer(1);
  this.assertEqual(player.pos.x, originalX, 'ゲームオーバー時に移動が実行された');
  
  // 回転操作（無効化されるべき）
  const originalMatrix = player.matrix ? JSON.stringify(player.matrix) : null;
  if (player.matrix) {
    rotatePlayer(1);
    this.assertEqual(JSON.stringify(player.matrix), originalMatrix, 'ゲームオーバー時に回転が実行された');
  }
  
  // 状態を復元
  Object.assign(gameState, originalGameState);
  Object.assign(player, originalPlayer);
});

// ========================================
// パフォーマンステスト
// ========================================

testRunner.test('パフォーマンス - 大量の衝突検出が高速', function() {
  const arena = createMatrix(GAME_CONFIG.ARENA_WIDTH, GAME_CONFIG.ARENA_HEIGHT);
  const testPlayer = {
    matrix: createPiece('T'),
    pos: { x: 5, y: 5 }
  };
  
  const startTime = performance.now();
  
  // 1000回の衝突検出を実行
  for (let i = 0; i < 1000; i++) {
    checkCollision(arena, testPlayer);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  this.assertTrue(duration < 100, `衝突検出が遅すぎる: ${duration}ms`);
});

testRunner.test('パフォーマンス - マトリックス回転が高速', function() {
  const startTime = performance.now();
  
  // 1000回の回転を実行
  for (let i = 0; i < 1000; i++) {
    const matrix = createPiece('T');
    rotateMatrix(matrix, 1);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  this.assertTrue(duration < 50, `マトリックス回転が遅すぎる: ${duration}ms`);
});

// ========================================
// エラーハンドリングテスト
// ========================================

testRunner.test('エラーハンドリング - 無効な位置での操作', function() {
  const arena = createMatrix(GAME_CONFIG.ARENA_WIDTH, GAME_CONFIG.ARENA_HEIGHT);
  
  // 境界外のプレイヤー
  const invalidPlayer = {
    matrix: createPiece('T'),
    pos: { x: -100, y: -100 }
  };
  
  // エラーが発生しないことを確認
  try {
    checkCollision(arena, invalidPlayer);
    this.assertTrue(true, '境界外での衝突検出が正常に動作');
  } catch (error) {
    this.assertTrue(false, `境界外での衝突検出でエラー: ${error.message}`);
  }
});

// ========================================
// テスト実行
// ========================================

// DOMが読み込まれた後にテストを実行
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded - テストを開始します');
  setTimeout(() => {
    console.log('テストランナーを実行中...');
    testRunner.runAll();
  }, 100); // テトリスの初期化を待つ
});
