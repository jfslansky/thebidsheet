const RUSH_STYLE: React.CSSProperties = {
  color: 'var(--paper)',
  letterSpacing: '0.03em',
}

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
  const normalized = normalizeCaps(text)
  const parts = normalized.split(/\b(Rush)\b/gi)
  return (
    <span style={style}>
      {parts.map((part, i) =>
        /^rush$/i.test(part)
          ? <span key={i} style={RUSH_STYLE}>{part}</span>
          : part
      )}
    </span>
  )
}
