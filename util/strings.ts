/**
 * テキストが正規表現パターンに完全マッチしているかどうかを返却します
 */
export function match(text: string, pattern: RegExp): boolean {
  return pattern.exec(text)?.[0] === text;
}
