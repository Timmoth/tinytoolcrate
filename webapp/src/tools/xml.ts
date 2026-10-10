/** Re-indents markup. Elements holding only text stay on one line. */
export function prettyXml(source: string, indent = 2): string {
  const pad = ' '.repeat(indent)
  const parts = source
    .replace(/>\s+</g, '><')
    .trim()
    .split(/(<[^>]*>)/)
    .filter((part) => part.trim() !== '')

  const out: string[] = []
  let depth = 0

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    if (!part.startsWith('<')) {
      out.push(pad.repeat(depth) + part.trim())
      continue
    }
    if (part.startsWith('</')) {
      depth = Math.max(0, depth - 1)
      out.push(pad.repeat(depth) + part)
      continue
    }

    const standalone =
      part.endsWith('/>') || part.startsWith('<?') || part.startsWith('<!')
    const text = parts[i + 1]
    const close = parts[i + 2]

    if (
      !standalone &&
      text !== undefined &&
      !text.startsWith('<') &&
      close !== undefined &&
      close.startsWith('</')
    ) {
      out.push(pad.repeat(depth) + part + text.trim() + close)
      i += 2
      continue
    }

    out.push(pad.repeat(depth) + part)
    if (!standalone) depth += 1
  }

  return out.join('\n')
}

/** Browser-backed well-formedness check, for telling the user it is broken. */
export function xmlError(source: string): string | null {
  const doc = new DOMParser().parseFromString(source, 'application/xml')
  const failure = doc.querySelector('parsererror')
  if (!failure) return null
  const text = (failure.textContent ?? '').trim()
  const located = /line\s+(\d+)\s+at\s+column\s+(\d+)\s*:\s*(.+)/i.exec(text)
  if (located) return `Line ${located[1]}, column ${located[2]}: ${located[3].trim()}`
  return text.split('\n').find((line) => line.trim() !== '') ?? 'Invalid XML'
}
