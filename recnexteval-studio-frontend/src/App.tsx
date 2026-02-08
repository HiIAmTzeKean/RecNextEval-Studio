import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import CreateStream from './pages/CreateStream'
import Algo from './pages/Algo'
import Evaluation from './pages/Evaluation'
import EvaluationResults from './pages/EvaluationResults'
import { ThemeToggle } from './components/ThemeToggle'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function NavGreeting({ collapsed = false }: { collapsed?: boolean }) {
  const { username, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  if (loading) return null

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  if (!username) {
    return (
      <NavLink
        to="/login"
        className={({ isActive }) =>
          `flex items-center ${collapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`
        }
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className={`ml-2 ${collapsed ? 'hidden' : ''}`}>Login</span>
      </NavLink>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className={`flex items-center w-full ${collapsed ? 'justify-center' : ''} px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50`}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className={`ml-2 ${collapsed ? 'hidden' : ''}`}>Hello, {username}</span>
        {!collapsed && <span className="ml-auto">▾</span>}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow z-50">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function AppContent() {
  const { username } = useAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {/* Sidebar */}
        <nav className={`fixed left-0 top-0 h-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          <div className="flex flex-col h-full">
            {/* Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-4 self-end text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Logo */}
            <div className="px-4 py-2">
              {sidebarOpen && (
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  RecNextEval
                </h1>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 space-y-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center ${sidebarOpen ? '' : 'justify-center'} px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`
                }
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className={`ml-2 ${sidebarOpen ? '' : 'hidden'}`}>Home</span>
              </NavLink>

              {username && (
                <>
                  <NavLink
                    to="/create-stream"
                    className={({ isActive }) =>
                      `flex items-center ${sidebarOpen ? '' : 'justify-center'} px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`
                    }
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className={`ml-2 ${sidebarOpen ? '' : 'hidden'}`}>Stream</span>
                  </NavLink>
                  <NavLink
                    to="/algo"
                    className={({ isActive }) =>
                      `flex items-center ${sidebarOpen ? '' : 'justify-center'} px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`
                    }
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className={`ml-2 ${sidebarOpen ? '' : 'hidden'}`}>Algorithm</span>
                  </NavLink>
                  <NavLink
                    to="/evaluation"
                    className={({ isActive }) =>
                      `flex items-center ${sidebarOpen ? '' : 'justify-center'} px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`
                    }
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className={`ml-2 ${sidebarOpen ? '' : 'hidden'}`}>Evaluation</span>
                  </NavLink>
                </>
              )}
            </div>

            {/* Bottom Section */}
            <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
              <NavGreeting collapsed={!sidebarOpen} />
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} px-4 sm:px-6 lg:px-8 py-8`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-stream" element={<CreateStream />} />
            <Route path="/algo" element={<Algo />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/evaluation-results/:streamJobId" element={<EvaluationResults />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
