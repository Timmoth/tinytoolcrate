import { useMemo, useState } from 'react'
import { showToast } from './Toast'

export type Column<Row> = {
  key: keyof Row & string
  label: string
  mono?: boolean
  /** Column keeps its natural width instead of absorbing the slack. */
  tight?: boolean
}

/** A searchable read-only lookup table. Clicking a row copies its key value. */
function ReferenceTable<Row extends Record<string, string>>({
  rows,
  columns,
  copyKey,
  placeholder,
  rowClass,
}: {
  rows: Row[]
  columns: Column<Row>[]
  copyKey: keyof Row & string
  placeholder: string
  rowClass?: (row: Row) => string
}) {
  const [query, setQuery] = useState('')

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (needle === '') return rows
    return rows.filter((row) =>
      columns.some((column) => row[column.key].toLowerCase().includes(needle))
    )
  }, [rows, columns, query])

  const copy = (row: Row) => {
    navigator.clipboard
      .writeText(row[copyKey])
      .then(() => showToast(`Copied ${row[copyKey]}`))
      .catch(() => showToast('Could not copy'))
  }

  return (
    <>
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full text-sm rounded-lg border border-border bg-input px-3 py-2 text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
      />

      <div
        className="overflow-auto rounded-lg border border-border"
        style={{ maxHeight: 320 }}
        data-testid="reference-table"
      >
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-2 py-1.5 font-medium uppercase tracking-wider text-[10px] text-subtle"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.map((row, index) => (
              <tr
                key={index}
                data-testid="reference-row"
                onClick={() => copy(row)}
                title={`Copy ${row[copyKey]}`}
                className={`border-b border-border/50 last:border-0 cursor-pointer hover:bg-hover ${
                  rowClass?.(row) ?? ''
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-2 py-1.5 align-top text-text ${
                      column.mono ? 'font-mono' : ''
                    } ${column.tight ? 'whitespace-nowrap w-px' : ''}`}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {matches.length === 0 && (
          <p className="px-3 py-3 text-sm text-subtle">No matches</p>
        )}
      </div>

      <p className="text-[11px] text-faint" data-testid="reference-count">
        {matches.length} of {rows.length} · click a row to copy
      </p>
    </>
  )
}

export default ReferenceTable
