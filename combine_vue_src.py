import os

def is_text_file(file_path):
    text_extensions = ['.vue', '.js', '.ts', '.css', '.scss', '.html', '.json', '.md', '.txt']
    return any(file_path.lower().endswith(ext) for ext in text_extensions)

def combine_vue_src_files(src_dir, output_file):
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, src_dir)
                
                if not is_text_file(file_path):
                    print(f"スキップ: {relative_path} (テキストファイルではありません)")
                    continue

                # ファイル名を区切り線で囲む
                outfile.write(f"\n{'='*50}\n")
                outfile.write(f"File: {relative_path}\n")
                outfile.write(f"{'='*50}\n\n")
                
                # ファイルの内容を書き込む
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except UnicodeDecodeError:
                    print(f"警告: {relative_path} の読み込み中にエラーが発生しました。このファイルはスキップされます。")
                
                outfile.write("\n\n")

# 使用例
src_directory = "./src"  # Vue プロジェクトの src ディレクトリへのパス
output_file = "combined_vue_src.txt"  # 出力ファイル名

combine_vue_src_files(src_directory, output_file)
print(f"ファイルが {output_file} に結合されました。")