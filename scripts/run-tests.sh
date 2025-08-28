#!/bin/bash

# テトリス テスト実行スクリプト
# 使用方法: ./run-tests.sh

echo "🎮 テトリス テストスイート実行中..."
echo "=================================="

# Node.jsが利用可能な場合のヘッドレステスト用（将来的な拡張）
if command -v node &> /dev/null; then
    echo "📋 Node.js環境が検出されました"
    echo "注意: 現在はブラウザベースのテストのみサポートしています"
fi

echo ""
echo "🌐 ブラウザでのテスト実行方法:"
echo "1. test.html をブラウザで開いてください"
echo "2. テスト結果が自動的に表示されます"
echo ""

# ファイル存在チェック
echo "📁 テストファイルの確認中..."

required_files=("test.html" "tetris-test.js" "tetris.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    else
        echo "✅ $file が見つかりました"
    fi
done

if [[ ${#missing_files[@]} -ne 0 ]]; then
    echo ""
    echo "❌ 以下のファイルが見つかりません:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "すべての必要ファイルが存在することを確認してください。"
    exit 1
fi

echo ""
echo "✅ すべてのテストファイルが確認できました"
echo ""
echo "🚀 ブラウザでテストを実行してください:"
echo "   file://$(pwd)/test.html"
echo ""
echo "または、VS Code の Live Server 拡張機能を使用してください。"

# 将来的なヘッドレステスト実行のプレースホルダー
cat << 'EOF'

📝 テストカテゴリ:
   • ユーティリティ関数テスト
   • ゲームロジックテスト  
   • 統合テスト
   • パフォーマンステスト
   • エラーハンドリングテスト

🎯 期待されるテスト結果:
   • 25+ テストケース
   • 90%+ 成功率
   • パフォーマンス基準クリア

EOF
