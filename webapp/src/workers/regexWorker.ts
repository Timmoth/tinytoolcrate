export {}

const ctx = self as unknown as {
  postMessage: (message: unknown) => void
  addEventListener: (type: string, listener: (event: MessageEvent) => void) => void
}

type Request = {
  pattern: string
  flags: string
  text: string
  replacement: string
}

ctx.addEventListener('message', (event: MessageEvent) => {
  const { pattern, flags, text, replacement } = event.data as Request

  try {
    const uniqueFlags = [...new Set(flags.split(''))].join('')
    const globalFlags = uniqueFlags.includes('g') ? uniqueFlags : uniqueFlags + 'g'
    const regex = new RegExp(pattern, globalFlags)
    const matches = [...text.matchAll(regex)]
    ctx.postMessage({
      ok: true,
      count: matches.length,
      values: matches.map((match) => match[0]).join('\n'),
      result: replacement ? text.replace(new RegExp(pattern, globalFlags), replacement) : '',
    })
  } catch {
    ctx.postMessage({ ok: false })
  }
})
