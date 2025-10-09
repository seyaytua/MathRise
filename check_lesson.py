#!/usr/bin/env python3
"""
レッスンJSONの品質をチェックするスクリプト

使い方:
    python3 check_lesson.py courses/lesson-XXX.json
"""

import json
import sys
import re

def check_lesson(filename):
    """レッスンJSONの品質をチェック"""
    
    print(f"🔍 チェック中: {filename}")
    print("-" * 50)
    
    try:
        with open(filename, encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON構文エラー: {e}")
        return 1
    except FileNotFoundError:
        print(f"❌ ファイルが見つかりません: {filename}")
        return 1
    
    errors = []
    warnings = []
    
    # 1. 基本構造チェック
    required_keys = ['id', 'title', 'importance', 'estimatedTime', 'content', 'problems']
    for key in required_keys:
        if key not in data:
            errors.append(f"必須キー '{key}' がありません")
    
    if errors:
        print("❌ エラー:")
        for error in errors:
            print(f"  {error}")
        return 1
    
    # 2. 説明の長さチェック
    explanation = data['content'].get('explanation', '')
    explanation_length = len(explanation)
    
    if explanation_length > 800:
        warnings.append(f"説明が長すぎます: {explanation_length}文字 (推奨: 600文字以内)")
    elif explanation_length > 600:
        warnings.append(f"説明がやや長いです: {explanation_length}文字 (推奨: 600文字以内)")
    
    # 3. 数式記法チェック
    lines = explanation.split('\n')
    inline_double_dollar_lines = []
    
    for i, line in enumerate(lines, 1):
        # 独立行の数式（$$...$$のみの行）はOK
        if re.match(r'^\s*\$\$[^\$]+\$\$\s*$', line):
            continue
        
        # 文中に $$ があるかチェック
        if '$$' in line:
            inline_double_dollar_lines.append(i)
    
    if inline_double_dollar_lines:
        warnings.append(f"文中に $$ が使われています（$ に変更してください）: {inline_double_dollar_lines}行目")
    
    # 4. step-by-step問題のチェック
    for prob_idx, problem in enumerate(data['problems'], 1):
        if problem.get('type') != 'step-by-step':
            continue
        
        steps = problem.get('steps', [])
        
        for step_idx, step in enumerate(steps, 1):
            step_id = step.get('stepId', f's{step_idx}')
            prompt = step.get('prompt', '')
            answer = step.get('answer', '')
            answer_type = step.get('answerType', 'text')
            hints = step.get('hints', [])
            
            # 問いと答えの型チェック
            if ('いくつ' in prompt or '何' in prompt) and answer_type != 'number':
                if not any(word in prompt for word in ['何を', '何から']):
                    warnings.append(
                        f"問題{prob_idx} ステップ{step_idx} ({step_id}): "
                        f"問いが数値を求めているのに answerType が '{answer_type}'"
                    )
            
            # ヒントの数チェック
            if len(hints) < 2:
                warnings.append(
                    f"問題{prob_idx} ステップ{step_idx} ({step_id}): "
                    f"ヒントが少なすぎます（現在: {len(hints)}個、推奨: 2-3個）"
                )
            elif len(hints) > 4:
                warnings.append(
                    f"問題{prob_idx} ステップ{step_idx} ({step_id}): "
                    f"ヒントが多すぎます（現在: {len(hints)}個、推奨: 2-3個）"
                )
            
            # 文中の $$ チェック（ヒント内）
            for hint_idx, hint in enumerate(hints, 1):
                hint_lines = hint.split('\n')
                for line in hint_lines:
                    if not re.match(r'^\s*\$\$[^\$]+\$\$\s*$', line) and '$$' in line:
                        warnings.append(
                            f"問題{prob_idx} ステップ{step_idx} ヒント{hint_idx}: "
                            f"文中に $$ が使われています"
                        )
    
    # 5. 結果表示
    print()
    if not errors and not warnings:
        print("✅ すべてのチェックに合格しました！")
        print()
        print("📊 統計:")
        print(f"  レッスンID: {data['id']}")
        print(f"  タイトル: {data['title']}")
        print(f"  重要度: {data['importance']}")
        print(f"  説明の長さ: {explanation_length}文字")
        print(f"  問題数: {len(data['problems'])}")
        return 0
    
    if warnings:
        print("⚠️ 警告:")
        for warning in warnings:
            print(f"  {warning}")
        print()
        print("💡 これらは警告です。修正を推奨しますが、必須ではありません。")
    
    return 0

def main():
    if len(sys.argv) != 2:
        print("使い方: python3 check_lesson.py <lesson-file.json>")
        print()
        print("例:")
        print("  python3 check_lesson.py courses/lesson-005.json")
        sys.exit(1)
    
    sys.exit(check_lesson(sys.argv[1]))

if __name__ == '__main__':
    main()
