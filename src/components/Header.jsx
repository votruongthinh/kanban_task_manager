import React from "react";

export default function Header({
  sidebarOpen,
  toggleSidebar,
  currentBoardName,
  darkMode,
  toggleDarkMode,
}) {
  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-40 transition-all duration-300"
      style={{ width: `calc(100% - ${sidebarOpen ? "16rem" : "0rem"})` }}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          {!sidebarOpen && (
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {currentBoardName || "Dashboard"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Simplify your project management
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Toggle dark mode"
          >
            <div
              className={`w-4 h-4 bg-white dark:bg-gray-300 rounded-full shadow-md transform transition-transform duration-300 ${
                darkMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 absolute top-1 ${
                darkMode ? "left-2" : "right-2"
              } text-yellow-500 dark:text-blue-300`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {darkMode ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
