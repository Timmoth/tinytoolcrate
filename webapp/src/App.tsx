import { useState, useEffect } from 'react'
import Panel, { PanelType } from './Panel'
import NavBar from './NavBar'

function App() {
  const [panels, setPanels] = useState<PanelType[]>([])

  const handlePanelSelect = (selectedPanel: PanelType) => {
    setPanels((prevPanels) => {
      const newPanels = [...prevPanels, selectedPanel]
      updateQueryParams(newPanels)
      return newPanels
    })
  }

  const handleClosePanel = (index: number) => {
    setPanels((prevPanels) => {
      const newPanels = prevPanels.filter((_, i) => i !== index)
      updateQueryParams(newPanels)
      return newPanels
    })
  }

  const updateQueryParams = (panels: PanelType[]) => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams()

    panels.forEach((panel) => params.append('panels', panel))
    url.search = params.toString()
    window.history.replaceState({}, '', url.toString())
  }

  const readPanelsFromQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const panelsFromParams = urlParams.getAll('panels') as PanelType[]
    return panelsFromParams
  }

  useEffect(() => {
    const initialPanels = readPanelsFromQueryParams()
    setPanels(initialPanels)
  }, [])

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="m-4">
        <NavBar onPanelSelect={handlePanelSelect} />
      </div>
      <div className="mt-16 w-full text-white max-w-8xl">
        <div className="grid gap-4 m-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {panels.map((panel, index) => (
            <div
              key={index}
              className="relative flex flex-col p-4 border border-gray-100 rounded-lg shadow-sm bg-gray-700 h-full"
            >
              <button
                type="button"
                onClick={() => handleClosePanel(index)}
                className="absolute top-2 right-2 inline-flex items-center p-1 text-sm text-pink-400 bg-transparent rounded-sm hover:bg-pink-200 hover:text-pink-900 dark:hover:bg-pink-800 dark:hover:text-pink-300"
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
              <h2 className="text-center text-white text-lg font-bold mb-4">
                {panel}
              </h2>
              <div className="flex-grow flex flex-col items-center justify-start space-y-4 w-full h-full">
                <Panel selectedPanel={panel} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
