import { useEffect, useRef, useState } from 'react'
import Panel, { PanelType } from './Panel'
import NavBar from './NavBar'
import { Toaster } from './components/Toast'
import InfoButton from './components/InfoButton'
import ErrorBoundary from './components/ErrorBoundary'
import { TOOL_SEARCH } from './toolSearch'

type PanelInstance = {
  id: number
  type: PanelType
}

/**
 * Tools that have been renamed, so a link someone shared under the old name
 * still opens the right panel.
 */
const RENAMED: Record<string, PanelType> = {
  'Guid generator': PanelType.Guid,
  'Public ip': PanelType.Ip,
  'Unix time': PanelType.UnixTime,
  'Jwt decode': PanelType.JwtDecode,
  'Jwt encode': PanelType.JwtEncode,
  'Url encode': PanelType.UrlEncode,
  'Url decode': PanelType.UrlDecode,
  'Url parser': PanelType.UrlParser,
  'Text stats': PanelType.LineCount,
  'Format json': PanelType.FormatJson,
  'Json minify': PanelType.JsonMinify,
  'Csv / json': PanelType.CsvJson,
  'Html entities': PanelType.HtmlEntities,
  'Qr code': PanelType.QrCode,
  'Plot graph': PanelType.PlotGraph,
  'SHA file checksum': PanelType.ShaFileChecksum,
  'Base64 encode file': PanelType.Base64EncodeFile,
  'Base64 encoded image': PanelType.ViewBase64Image,
  'Base converter': PanelType.BaseConverter,
  'Cron explain': PanelType.CronExplain,
  'Totp generator': PanelType.Totp,
  'Line tools': PanelType.LineTools,
  'Aes encrypt': PanelType.AesEncrypt,
  'Rsa key pair': PanelType.RsaKeyPair,
  'Rsa encrypt': PanelType.RsaEncrypt,
  'Http status codes': PanelType.HttpStatus,
  'Mime types': PanelType.MimeTypes,
  'Char codes': PanelType.CharCodes,
  'Ascii table': PanelType.AsciiTable,
  'Px rem converter': PanelType.PxRem,
  'Gzip compress': PanelType.Gzip,
  'Zip files': PanelType.ZipBuilder,
  'Saml decode': PanelType.SamlDecode,
  'Exif viewer': PanelType.Exif,
  'List compare': PanelType.ListCompare,
}

function toPanelType(value: string): PanelType {
  return RENAMED[value] ?? (value as PanelType)
}

function App() {
  const nextId = useRef(0)

  const [panels, setPanels] = useState<PanelInstance[]>(() =>
    new URLSearchParams(window.location.search)
      .getAll('panels')
      .map((panel) => ({ id: nextId.current++, type: toPanelType(panel) }))
  )

  const draggedId = useRef<number | null>(null)
  const [dragOverId, setDragOverId] = useState<number | null>(null)

  const handlePanelSelect = (selectedPanel: PanelType) => {
    setPanels((prevPanels) => [
      ...prevPanels,
      { id: nextId.current++, type: selectedPanel },
    ])
  }

  const handleClosePanel = (id: number) => {
    setPanels((prevPanels) => prevPanels.filter((panel) => panel.id !== id))
  }

  const handleDropOnPanel = (targetId: number) => {
    const sourceId = draggedId.current
    draggedId.current = null
    setDragOverId(null)
    if (sourceId === null || sourceId === targetId) return

    setPanels((prevPanels) => {
      const from = prevPanels.findIndex((panel) => panel.id === sourceId)
      const to = prevPanels.findIndex((panel) => panel.id === targetId)
      if (from === -1 || to === -1) return prevPanels

      const next = [...prevPanels]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams()
    panels.forEach((panel) => params.append('panels', panel.type))
    url.search = params.toString()
    window.history.replaceState({}, '', url.toString())

    if (panels.length === 0) {
      document.title = 'tinytoolcrate — free developer utilities'
    } else {
      const names = panels.map((panel) => panel.type)
      const label =
        names.length <= 2
          ? names.join(' + ')
          : `${names.slice(0, 2).join(' + ')} +${names.length - 2} more`
      document.title = `${label} — tinytoolcrate`
    }
  }, [panels])

  // Editors need the room; the rest are happy in a single grid cell.
  const WIDE = new Set<PanelType>([
    PanelType.PlotGraph,
    PanelType.MarkdownEditor,
    // Lookup tables need the room for their description column.
    PanelType.HttpStatus,
    PanelType.MimeTypes,
    PanelType.AsciiTable,
  ])
  const TALL = new Set<PanelType>([
    PanelType.PlotGraph,
    PanelType.MarkdownEditor,
  ])

  const isWide = (p: PanelType) => WIDE.has(p)
  const isTall = (p: PanelType) => TALL.has(p)

  return (
    <div className="min-h-screen">
      <NavBar onPanelSelect={handlePanelSelect} />
      <main className="pt-24 w-full max-w-8xl mx-auto">
        {panels.length === 0 && (
          <div className="mt-24 text-center space-y-2">
            <p className="text-subtle text-sm">No utilities open yet.</p>
            <p className="text-faint text-sm">
              Pick one from a category above, or search for it.
            </p>
          </div>
        )}
        <div className="grid gap-4 px-4 pb-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {panels.map((panel) => {
            const gridColumnSpan = isWide(panel.type)
              ? 'col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2'
              : 'col-span-1'
            const gridRowSpan = isTall(panel.type)
              ? 'row-span-1 sm:row-span-2 md:row-span-2 lg:row-span-2'
              : 'row-span-1'
            const isDragTarget =
              dragOverId === panel.id && draggedId.current !== panel.id

            return (
              <div
                key={panel.id}
                data-testid="panel"
                data-panel-type={panel.type}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  setDragOverId(panel.id)
                }}
                onDragLeave={() =>
                  setDragOverId((current) =>
                    current === panel.id ? null : current
                  )
                }
                onDrop={(event) => {
                  event.preventDefault()
                  handleDropOnPanel(panel.id)
                }}
                className={`relative flex flex-col p-4 pt-6 rounded-xl border bg-surface shadow-sm h-full ${gridColumnSpan} ${gridRowSpan} ${
                  isDragTarget
                    ? 'border-accent ring-2 ring-accent/40'
                    : 'border-border'
                }`}
              >
                <button
                  type="button"
                  data-testid="drag-handle"
                  aria-label="Drag to reorder"
                  draggable
                  onDragStart={(event) => {
                    draggedId.current = panel.id
                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.setData('text/plain', String(panel.id))
                  }}
                  onDragEnd={() => {
                    draggedId.current = null
                    setDragOverId(null)
                  }}
                  className="absolute top-2 left-2 p-1.5 rounded-md text-faint hover:text-text hover:bg-hover cursor-grab active:cursor-grabbing transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                  </svg>
                </button>
                <div className="absolute top-2 right-2 flex items-center">
                  {TOOL_SEARCH[panel.type as keyof typeof TOOL_SEARCH] && (
                    <InfoButton
                      title={panel.type}
                      info={TOOL_SEARCH[panel.type as keyof typeof TOOL_SEARCH].info}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleClosePanel(panel.id)}
                    className="p-1.5 rounded-md text-faint hover:text-text hover:bg-hover transition-colors"
                    aria-label="Remove"
                  >
                    <svg
                      className="w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Remove</span>
                  </button>
                </div>
                <h2 className="text-center text-text text-sm font-semibold tracking-wide mb-4">
                  {panel.type}
                </h2>
                <div className="flex-grow flex flex-col items-stretch justify-start space-y-4 w-full h-full">
                  <ErrorBoundary label={panel.type}>
                    <Panel selectedPanel={panel.type} />
                  </ErrorBoundary>
                </div>
              </div>
            )
          })}
        </div>
      </main>
      <footer className="pb-6 text-center">
        <a
          href="https://timmoth.com"
          target="_blank"
          rel="me noopener noreferrer"
          className="text-xs text-faint hover:text-subtle transition-colors"
        >
          built by timmoth
        </a>
      </footer>
      <Toaster />
    </div>
  )
}

export default App
