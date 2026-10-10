import { useEffect, useRef, useState } from 'react'
import { PanelType } from './Panel'
import { searchTools } from './toolSearch'
import ghLogo from './assets/github-mark.svg'
import { toggleTheme, useTheme } from './theme'

type CategoryDictionary = {
  [key: string]: PanelType[]
}

const Categories: CategoryDictionary = {
  text: [
    PanelType.Base64Encode,
    PanelType.Base64Decode,
    PanelType.UrlEncode,
    PanelType.UrlDecode,
    PanelType.LineCount,
    PanelType.FindAndReplace,
    PanelType.CountOccurrences,
    PanelType.EscapeString,
    PanelType.UnescapeString,
    PanelType.CaseConverter,
    PanelType.HtmlEntities,
    PanelType.TextDiff,
    PanelType.LineTools,
    PanelType.LoremIpsum,
    PanelType.Slug,
    PanelType.CharCodes,
    PanelType.AsciiTable,
    PanelType.ListCompare,
    PanelType.Emoji,
  ],
  json: [
    PanelType.JwtDecode,
    PanelType.FormatJson,
    PanelType.JsonMinify,
    PanelType.CsvJson,
    PanelType.JwtEncode,
  ],
  file: [
    PanelType.ZipBuilder,
    PanelType.ZipViewer,
    PanelType.Gzip,
    PanelType.ImageConvert,
    PanelType.Exif,
    PanelType.ShaFileChecksum,
    PanelType.FileSize,
    PanelType.Chmod,
    PanelType.Base64EncodeFile,
    PanelType.ViewBase64Image,
  ],
  time: [
    PanelType.UnixTime,
    PanelType.Clock,
    PanelType.CountDownTimer,
    PanelType.Alarm,
    PanelType.TimestampConverter,
    PanelType.DateDiff,
    PanelType.Stopwatch,
  ],
  code: [
    PanelType.MarkdownEditor,
    PanelType.RegexTester,
    PanelType.HashGenerator,
    PanelType.BaseConverter,
    PanelType.CronExplain,
    PanelType.UrlParser,
  ],
  net: [
    PanelType.Subnet,
    PanelType.HttpStatus,
    PanelType.MimeTypes,
    PanelType.SamlDecode,
    PanelType.BasicAuth,
    PanelType.IpConvert,
    PanelType.UserAgent,
    PanelType.RandomPort,
  ],
  crypto: [
    PanelType.AesEncrypt,
    PanelType.RsaKeyPair,
    PanelType.RsaEncrypt,
    PanelType.ClassicCipher,
  ],
  misc: [
    PanelType.Guid,
    PanelType.Ip,
    PanelType.QrCode,
    PanelType.PlotGraph,
    PanelType.Calculator,
    PanelType.Color,
    PanelType.PasswordGenerator,
    PanelType.Totp,
    PanelType.Contrast,
    PanelType.PxRem,
    PanelType.UnitConvert,
    PanelType.ColorConvert,
    PanelType.Percentage,
    PanelType.RomanNumeral,
    PanelType.Ulid,
    PanelType.KeyCode,
  ],
}

function NavBar({
  onPanelSelect,
}: {
  onPanelSelect: (selectedPanel: PanelType) => void
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')
  const theme = useTheme()
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenCategory(null)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenCategory(null)
        setQuery('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const select = (panelType: PanelType) => {
    setOpenCategory(null)
    setQuery('')
    onPanelSelect(panelType)
  }

  const searchResults = query.trim()
    ? searchTools(query).map(({ panelType, description, score }) => ({
        panelType,
        description,
        score,
        category:
          Object.entries(Categories).find(([, panelTypes]) =>
            panelTypes.includes(panelType)
          )?.[0] ?? '',
      }))
    : []

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchResults.length > 0) {
      select(searchResults[0].panelType)
    }
  }

  return (
    <div
      ref={navRef}
      className="fixed top-0 left-0 z-50 w-full bg-surface/80 backdrop-blur border-b border-border"
    >
      <div className="flex items-center justify-between px-4 h-12">
        <h1 className="text-sm font-semibold tracking-tight text-text">
          tinytoolcrate
        </h1>

        <div className="relative z-10 w-80">
          <input
            type="search"
            role="searchbox"
            aria-label="Search utilities"
            placeholder="Search utilities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full text-sm rounded-lg border border-border bg-input px-3 py-1.5 text-text placeholder-faint focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {searchResults.length > 0 && (
            <div
              data-testid="search-results"
              className="absolute left-0 top-full mt-1 w-full rounded-lg border border-border bg-surface shadow-xl overflow-hidden"
            >
              <ul className="py-1">
                {searchResults.map(({ category, panelType, description }) => (
                  <li key={panelType}>
                    <button
                      type="button"
                      aria-label={panelType}
                      onClick={() => select(panelType)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-hover"
                    >
                      <span className="flex flex-col">
                        <span className="text-sm text-text">{panelType}</span>
                        <span className="text-xs text-subtle">
                          {description}
                        </span>
                      </span>
                      <span className="text-xs text-subtle shrink-0">
                        {category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {query.trim() && searchResults.length === 0 && (
            <div className="absolute left-0 top-full mt-1 w-full rounded-lg border border-border bg-surface shadow-xl px-3 py-2 text-sm text-subtle">
              No utilities found
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-subtle hover:text-text hover:bg-hover transition-colors"
          >
            {theme === 'dark' ? (
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
          </button>

          <a
            href="https://github.com/Timmoth/tinytoolcrate"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="p-1.5 rounded-md text-subtle hover:text-text hover:bg-hover transition-colors"
          >
            <img className="w-5" src={ghLogo} alt="GitHub Logo" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 pb-2 px-4">
        {Object.entries(Categories).map(([key, panelTypes]) => (
          <div key={key} className="relative">
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={openCategory === key}
              onClick={() =>
                setOpenCategory((current) => (current === key ? null : key))
              }
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                openCategory === key
                  ? 'bg-hover text-text'
                  : 'text-subtle hover:text-text hover:bg-hover'
              }`}
            >
              {key}
            </button>

            {openCategory === key && (
              <div
                data-testid="category-menu"
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-48 rounded-lg border border-border bg-surface shadow-xl overflow-hidden"
              >
                <ul className="py-1">
                  {panelTypes.map((panelType) => (
                    <li key={panelType}>
                      <button
                        type="button"
                        onClick={() => select(panelType)}
                        className="w-full px-3 py-1.5 text-left text-sm text-text hover:bg-hover"
                      >
                        {panelType}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NavBar
