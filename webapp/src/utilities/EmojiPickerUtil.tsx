import { useMemo, useState } from 'react'
import TextField from '../fields/TextField'
import { showToast } from '../components/Toast'
import { EMOJI, EMOJI_GROUPS, Emoji } from '../data/emoji'

const CHIP = 'px-2 py-0.5 text-[11px] rounded-md border transition-colors'

function codePoints(char: string): number[] {
  return Array.from(char).map((part) => part.codePointAt(0)!)
}

function EmojiPickerUtil() {
  const [query, setQuery] = useState<string>('')
  const [group, setGroup] = useState<string>('all')
  const [selected, setSelected] = useState<Emoji | null>(null)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const inGroup = EMOJI.filter(
      (entry) => group === 'all' || entry.group === group
    )
    if (needle === '') return inGroup

    // Rank by how directly the term hits, so "lol" finds the laughing face
    // before it finds a lollipop.
    const rank = (entry: Emoji): number => {
      if (entry.char === needle) return 0
      if (entry.aliases.split(' ').includes(needle)) return 1
      if (entry.name === needle) return 2
      if (entry.name.split(' ').includes(needle)) return 3
      if (entry.name.startsWith(needle)) return 4
      if (entry.aliases.includes(needle)) return 5
      if (entry.name.includes(needle)) return 6
      return Infinity
    }

    return inGroup
      .map((entry) => ({ entry, score: rank(entry) }))
      .filter((scored) => scored.score !== Infinity)
      .sort((a, b) => a.score - b.score)
      .map((scored) => scored.entry)
  }, [query, group])

  const pick = (entry: Emoji) => {
    setSelected(entry)
    navigator.clipboard
      .writeText(entry.char)
      .then(() => showToast(`Copied ${entry.char}`))
      .catch(() => showToast('Could not copy'))
  }

  const points = selected ? codePoints(selected.char) : []

  return (
    <>
      <input
        type="search"
        aria-label="Search emoji"
        placeholder="Search emoji by name"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full text-sm rounded-lg border border-border bg-input px-3 py-2 text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
      />

      <div className="flex flex-wrap gap-1">
        {['all', ...EMOJI_GROUPS].map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={group === option}
            onClick={() => setGroup(option)}
            className={`${CHIP} ${
              group === option
                ? 'border-accent bg-accent/10 text-text'
                : 'border-border text-subtle hover:bg-hover hover:text-text'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div
        className="overflow-y-auto rounded-lg border border-border p-1"
        style={{ maxHeight: 220 }}
        data-testid="emoji-grid"
      >
        {matches.length === 0 ? (
          <p className="px-2 py-3 text-sm text-subtle">No emoji found</p>
        ) : (
          <div className="flex flex-wrap">
            {matches.map((entry) => (
              <button
                key={entry.char}
                type="button"
                title={entry.name}
                aria-label={entry.name}
                data-testid="emoji"
                onClick={() => pick(entry)}
                className="w-9 h-9 text-xl leading-none rounded hover:bg-hover transition-colors"
              >
                {entry.char}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-faint" data-testid="emoji-count">
        {matches.length} of {EMOJI.length} · click to copy
      </p>

      {selected && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-4xl leading-none" data-testid="emoji-selected">
              {selected.char}
            </span>
            <span className="text-sm text-text">{selected.name}</span>
          </div>

          <TextField
            label="code point"
            content={points.map((point) => `U+${point.toString(16).toUpperCase()}`).join(' ')}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
          <TextField
            label="html"
            content={points.map((point) => `&#${point};`).join('')}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
          <TextField
            label="css"
            content={points.map((point) => `\\${point.toString(16).toUpperCase()}`).join('')}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
          <TextField
            label="javascript"
            content={points.map((point) => `\\u{${point.toString(16).toUpperCase()}}`).join('')}
            isReadonly={true}
            isCopyable={true}
            isMultiline={false}
          />
        </>
      )}
    </>
  )
}

export default EmojiPickerUtil
