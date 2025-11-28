import { useState, useEffect } from 'react'
import { Bell, Search } from 'lucide-react'

export function Header() {
  const [userName, setUserName] = useState<string>('USER')

  useEffect(() => {
    // Try to get user name from localStorage or default
    const storedName = localStorage.getItem('user_name') || 'User'
    setUserName(storedName)
  }, [])

  const getLastSignOn = () => {
    const now = new Date()
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return `${date} at ${time}`
  }

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
          Welcome back, {userName}
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Last active: {getLastSignOn()}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative group">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-64 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-medium text-sm shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
