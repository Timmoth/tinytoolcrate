import { useState } from 'react'
import { PanelType } from './Panel'

function Panel({
  onPanelSelect,
}: {
  onPanelSelect: (selectedPanel: PanelType) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const [subDropdownOpen, setSubDropdownOpen] = useState<boolean>(false)

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleSubmenuClick = (panelType: PanelType) => {
    setDropdownOpen(false)
    onPanelSelect(panelType)
  }

  const panelTypes = Object.values(PanelType).filter(
    (value) => value !== PanelType.None
  ) // Exclude 'None' from the list

  return (
    <div className="flex flex-col justify-center items-center">
      <button
        id="multiLevelDropdownButton"
        className="text-white bg-gray-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
        type="button"
        onClick={toggleDropdown}
      >
        Utility
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          id="multi-dropdown"
          className="z-10 divide-y divide-gray-100 rounded-lg shadow w-44 bg-gray-700"
        >
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li
              onMouseEnter={() => setSubDropdownOpen(true)}
              onMouseLeave={() => setSubDropdownOpen(false)}
              className="relative"
            >
              <button
                type="button"
                className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Misc
                <svg
                  className="w-2.5 h-2.5 ms-3 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </button>

              {subDropdownOpen && (
                <div className="absolute left-full top-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    {panelTypes.map((panelType) => (
                      <li key={panelType}>
                        <button
                          type="button"
                          className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={() => handleSubmenuClick(panelType)}
                        >
                          {panelType}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default Panel
