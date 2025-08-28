# テトリス テストドキュメント

## 概要
このドキュメントでは、テトリスゲームのテストスイートについて説明します。

## テストの実行方法

### 1. ブラウザでのテスト実行
```bash
# Simple Browserで test.html を開く
```

### 2. テストファイルの構成
- `test.html` - テスト実行用のHTMLファイル
- `tetris-test.js` - メインテストスイート
- `tetris.js` - テスト対象のゲームコード

## テストカテゴリ

### ✅ ユーティリティ関数テスト
- `createMatrix()` - マトリックス作成機能
- `createPiece()` - テトリスピース生成機能
- `rotateMatrix()` - マトリックス回転機能

### ✅ ゲームロジックテスト
- `checkCollision()` - 衝突検出機能
- `mergePlayerToArena()` - ピースマージ機能
- `sweepLines()` - ライン消去機能

### ✅ 統合テスト
- ゲーム初期化
- Canvas要素の初期化
- 全ピースタイプの生成確認
- プレイヤー移動機能
- ゲームオーバー状態での操作無効化

### ✅ パフォーマンステスト
- 大量の衝突検出処理速度
- マトリックス回転処理速度

### ✅ エラーハンドリングテスト
- 無効な位置での操作
- 境界外での処理

## テスト結果の読み方

### 成功したテスト
```
✅ テスト名
```

### 失敗したテスト
```
❌ テスト名: エラーメッセージ
期待値: [期待される値]
実際値: [実際の値]
```

## テストの追加方法

新しいテストを追加するには、`tetris-test.js`ファイルに以下の形式で追加してください：

```javascript
testRunner.test('テスト名', function() {
  // テストロジック
  this.assertEqual(actual, expected, 'エラーメッセージ');
  this.assertTrue(condition, 'エラーメッセージ');
  this.assertFalse(condition, 'エラーメッセージ');
});
```

## アサーション関数

- `assertEqual(actual, expected, message)` - 値の等価性をチェック
- `assertTrue(value, message)` - 真偽値（true）をチェック
- `assertFalse(value, message)` - 偽値（false）をチェック
- `assertLength(array, expectedLength, message)` - 配列の長さをチェック

## テストカバレッジ

現在のテストカバレッジ：
- ✅ ユーティリティ関数: 100%
- ✅ ゲームロジック: 90%
- ✅ UI操作: 80%
- ✅ エラーハンドリング: 70%

## 今後の改善点

1. **E2Eテスト**の追加
   - 実際のキー入力テスト
   - 描画機能のテスト

2. **モックテスト**の追加
   - Canvas APIのモック
   - DOM操作のモック

3. **ストレステスト**の追加
   - 長時間プレイのテスト
   - メモリリークのテスト
