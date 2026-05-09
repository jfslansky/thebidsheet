function normalizeCaps(text: string): string {
  const letters = text.replace(/[^a-zA-Z]/g, '')
  const lowerLetters = text.replace(/[^a-z]/g, '')
  let out = text
  if (letters.length && lowerLetters.length / letters.length <= 0.1) {
    out = text.toLowerCase().replace(/(^|[.!?]\s+)(\w)/g, (_, pre, char) => pre + char.toUpperCase())
  }
  return out.charAt(0).toUpperCase() + out.slice(1)
}

export function RushVoice({ text, style }: { text: string; style?: React.CSSProperties }) {
  return <span style={style}>{normalizeCaps(text)}</span>
}
