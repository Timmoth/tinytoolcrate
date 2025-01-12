import { useEffect, useState } from 'react'
import { PanelType } from './Panel'
import ghLogo from './assets/github-mark.svg'

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
  ],
  json: [PanelType.JwtDecode, PanelType.FormatJson],
  file: [
    PanelType.ShaFileChecksum,
    PanelType.Base64EncodeFile,
    PanelType.ViewBase64Image,
  ],
  time: [PanelType.UnixTime, PanelType.Clock],
  misc: [
    PanelType.Guid,
    PanelType.Ip,
    PanelType.QrCode,
    PanelType.PlotGraph,
    PanelType.Calculator,
  ],
}

function NavBar({
  onPanelSelect,
}: {
  onPanelSelect: (selectedPanel: PanelType) => void
}) {
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const TIMEOUT_DURATION = 250

  const handleMouseEnterMenuButton = (key: string) => {
    setActiveButton(key)
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
    }
  }

  const handleMouseLeaveMenuButton = (key: string) => {
    if (key === activeButton) {
      const newTimer = setTimeout(() => {
        setActiveButton((currentKey) =>
          currentKey === key ? null : currentKey
        )
      }, TIMEOUT_DURATION)

      setTimer(newTimer)
    }
  }

  const handleMouseEnterMenu = () => {
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
    }
  }

  const handleMouseLeaveMenu = () => {
    setActiveButton(null)
  }

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [timer])

  const renderDropdown = (panelTypes: PanelType[]) => (
    <div
      className="z-50 absolute w-48 top-8 flex flex-col items-center justify-center py-1 space-y-2 border border-gray-100 rounded-lg shadow-sm bg-gray-600"
      onMouseEnter={handleMouseEnterMenu}
      onMouseLeave={handleMouseLeaveMenu}
    >
      <ul className="text-sm text-gray-500 w-full">
        {panelTypes.map((panelType, index) => (
          <li key={index}>
            <button
              onClick={() => onPanelSelect(panelType)}
              type="button"
              className="w-full px-5 py-2 text-center hover:bg-gray-50 group"
            >
              <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                {panelType}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div>
      <div className="fixed top-0 left-0 z-50 w-full bg-white">
        <div className="relative flex justify-center items-center">
          <h1 className="text-2xl font-bold text-blue-500 p-2">
            tinytoolcrate
          </h1>
          <a
            href="https://github.com/Timmoth/tinytoolcrate"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-4"
          >
            <img className="w-6" src={ghLogo} alt="GitHub Logo" />
          </a>
        </div>

        <div className="flex items-center justify-center h-full font-medium">
          {Object.entries(Categories).map(([key, panelTypes], index) => (
            <div key={index} className="relative flex flex-col items-center">
              <button
                type="button"
                className="inline-flex flex-col items-center justify-center px-5 my-2 hover:bg-gray-50 group"
                onMouseEnter={() => handleMouseEnterMenuButton(key)}
                onMouseLeave={() => handleMouseLeaveMenuButton(key)}
              >
                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
                  {key}
                </span>
              </button>
              {activeButton === key && renderDropdown(panelTypes)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NavBar
