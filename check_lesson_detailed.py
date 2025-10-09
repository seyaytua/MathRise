#!/usr/bin/env python3
import json
import sys

def check_lesson_detailed(filepath):
    """レッスンファイルの詳細チェック"""
    print(f"🔍 詳細チェック中: {filepath}")
    print("-" * 50)
    
    with open(filepath, encoding='utf-8') as f:
        data = json.load(f)
    
    # 基本情報
    print(f"\n📋 基本情報:")
    print(f"  ID: {data['id']}")
    print(f"  タイトル: {data['title']}")
    print(f"  重要度: {data['importance']}")
    
    # 問題のチェック
    print(f"\n📝 問題のチェック:")
    for i, problem in enumerate(data['problems'], 1):
        print(f"\n  問題 {i}:")
        print(f"    ID: {problem['problemId']}")
        print(f"    タイプ: {problem['type']}")
        
        if problem['type'] == 'step-by-step':
            print(f"    ステップ数: {len(problem['steps'])}")
            
            # 各ステップのチェック
            for j, step in enumerate(problem['steps'], 1):
                print(f"\n    ステップ {j}:")
                print(f"      ID: {step['stepId']}")
                print(f"      タイプ: {step.get('type', 'N/A')}")
                print(f"      answerType: {step['answerType']}")
                
                # prompt の内容チェック
                if step.get('type') == 'number':
                    if '選択肢' in step['prompt']:
                        print(f"      ✅ 選択肢が prompt に含まれています")
                    else:
                        print(f"      ⚠️ type が number ですが、選択肢が prompt に含まれていません")
                
                # choices の存在チェック
                if 'choices' in step:
                    print(f"      ⚠️ choices プロパティが存在します（削除推奨）")
                
                # prompt の長さ
                print(f"      prompt の長さ: {len(step['prompt'])} 文字")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("使い方: python3 check_lesson_detailed.py <lesson-file.json>")
        sys.exit(1)
    
    check_lesson_detailed(sys.argv[1])
