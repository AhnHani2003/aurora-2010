import { vi, type Language, type TranslationKey } from "./dictionary";
export { vi };
export type { Language, TranslationKey };
export const LANGUAGE_KEY = "aurora.language";
export function translate(key: TranslationKey, language: Language): string {
  return language === "vi" ? vi[key] : key;
}
const folded = new Map(
  Object.entries(vi).map(([key, value]) => [key.toLowerCase(), value]),
);
/** Presentation-only translation for existing dynamic labels; never changes persisted values/IDs. */
export function translateText(value: string, language: Language): string {
  if (language === "en" || !/[A-Za-z]/.test(value)) return value;
  const key = value.replace(/\s+/g, " ").trim();
  let translated: string | undefined =
    vi[key as TranslationKey] ?? folded.get(key.toLowerCase());
  if (!translated) {
    const patterns: [RegExp, (match: RegExpMatchArray) => string][] = [
      [/^View (.+)$/, (m) => `Xem ${translateText(m[1], language)}`],
      [/^Die showing (\d+)$/, (m) => `Xúc xắc hiện ${m[1]} điểm`],
      [
        /^Tom, your illustrated boyfriend — (.+)$/,
        (m) =>
          `Tom, anh người yêu minh họa — ${{ Idle: "Bình thường", Greeting: "Chào em", Happy: "Vui vẻ", Excited: "Hào hứng", Proud: "Tự hào", Angry: "Giận yêu", Shocked: "Bất ngờ", Crying: "Mít ướt" }[m[1]] ?? m[1]}`,
      ],
      [
        /^(Lucky Wheel|Dice Challenge|Love Quiz|Adventure) (victory|result)$/,
        (m) =>
          `${translateText(m[1], language)} — ${m[2] === "victory" ? "chiến thắng" : "kết quả"}`,
      ],
    ];
    for (const [pattern, render] of patterns) {
      const match = key.match(pattern);
      if (match) {
        translated = render(match);
        break;
      }
    }
  }
  if (!translated) return value;
  return `${/^\s/.test(value) ? " " : ""}${translated}${/\s$/.test(value) ? " " : ""}`;
}
