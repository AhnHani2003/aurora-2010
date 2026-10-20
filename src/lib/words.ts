/** Practical Unicode-compatible whitespace count; does not identify or verify a language. */
export function countWords(message: string): number {
  return message.trim() ? message.trim().split(/\s+/u).length : 0;
}
