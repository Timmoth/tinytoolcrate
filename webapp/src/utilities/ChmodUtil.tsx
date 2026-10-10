import { useState } from 'react'
import TextField from '../fields/TextField'
import {
  EMPTY_PERMISSIONS,
  parseOctal,
  parseSymbolic,
  Permission,
  PermissionSet,
  toOctal,
  toSymbolic,
} from '../tools/system'

type Who = 'owner' | 'group' | 'other'
type What = keyof Permission

const WHO: Who[] = ['owner', 'group', 'other']
const WHAT: What[] = ['read', 'write', 'execute']

const SPECIAL: [keyof PermissionSet, string, string][] = [
  ['setuid', 'setuid', 'Run as the file owner'],
  ['setgid', 'setgid', 'Run as the file group'],
  ['sticky', 'sticky', 'Only the owner may delete'],
]

const PRESETS: [string, string][] = [
  ['644', 'files'],
  ['755', 'scripts and folders'],
  ['600', 'private keys'],
  ['777', 'everyone, everything'],
]

function ChmodUtil() {
  const [permissions, setPermissions] = useState<PermissionSet>(() => ({
    ...EMPTY_PERMISSIONS,
    owner: { read: true, write: true, execute: false },
    group: { read: true, write: false, execute: false },
    other: { read: true, write: false, execute: false },
  }))

  const toggle = (who: Who, what: What) =>
    setPermissions((current) => ({
      ...current,
      [who]: { ...current[who], [what]: !current[who][what] },
    }))

  const octal = toOctal(permissions)
  const symbolic = toSymbolic(permissions)

  return (
    <>
      <table className="w-full text-xs" data-testid="chmod-grid">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-subtle">
            <th className="text-left font-medium py-1" />
            {WHAT.map((what) => (
              <th key={what} className="font-medium py-1">
                {what}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WHO.map((who) => (
            <tr key={who} className="border-t border-border">
              <td className="py-1.5 text-text">{who}</td>
              {WHAT.map((what) => (
                <td key={what} className="py-1.5 text-center">
                  <input
                    type="checkbox"
                    aria-label={`${who} ${what}`}
                    checked={permissions[who][what]}
                    onChange={() => toggle(who, what)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap gap-3">
        {SPECIAL.map(([key, label, title]) => (
          <label
            key={key}
            title={title}
            className="flex items-center gap-1.5 text-xs text-subtle"
          >
            <input
              type="checkbox"
              aria-label={label}
              checked={Boolean(permissions[key])}
              onChange={(event) =>
                setPermissions((current) => ({
                  ...current,
                  [key]: event.target.checked,
                }))
              }
            />
            {label}
          </label>
        ))}
      </div>

      <TextField
        label="octal"
        content={octal}
        onContentChange={(value) => {
          const parsed = parseOctal(value)
          if (parsed) setPermissions(parsed)
        }}
        isReadonly={false}
        isCopyable={true}
        isMultiline={false}
      />

      <TextField
        label="symbolic"
        content={symbolic}
        onContentChange={(value) => {
          const parsed = parseSymbolic(value)
          if (parsed) setPermissions(parsed)
        }}
        isReadonly={false}
        isCopyable={true}
        isMultiline={false}
      />

      <TextField
        label="command"
        content={`chmod ${octal} file`}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}
      />

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            title={label}
            onClick={() => setPermissions(parseOctal(value)!)}
            className="px-2 py-0.5 text-[11px] font-mono rounded border border-border text-subtle hover:bg-hover hover:text-text transition-colors"
          >
            {value}
          </button>
        ))}
      </div>
    </>
  )
}

export default ChmodUtil
