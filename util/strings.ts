/**
 * テキストが正規表現パターンに完全マッチしているかどうかを返却します
 */
export function match(text: string, pattern: RegExp): boolean {
  return pattern.exec(text)?.[0] === text;
}

/**
 * マッチした正規表現キャプチャグループを抽出する
 */
export function pickPatterns(
  str: string,
  pattern: RegExp,
): { [key: string]: string } {
  return Array.from(str.matchAll(pattern))?.[0]?.groups ?? {};
}

/**
 * Markdownのリスト1行からコンテンツと手前部分(prefix)を切り離します
 */
export function parseMarkdownList(text: string): {
  prefix: string;
  content: string;
} {
  const { prefix, content } = pickPatterns(
    text,
    /^(?<prefix>[ \t\s]*([-*] (\[.] |)|))(?<content>.*)$/g,
  );
  if (prefix == null || content == null) {
    throw Error("parseMarkdownList doesn't return a correct object");
  }
  return { prefix, content };
}
