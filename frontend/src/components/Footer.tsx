interface FooterProps {
  theme?: 'light' | 'dark'
}

export function Footer({ theme = 'dark' }: FooterProps) {
  const isDark = theme === 'dark'
  return (
    <footer className={`w-full border-t ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50/50'}`}>
      {/* Stats */}
      <div className={`w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-bold">3,000+</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>FINANCIAL INSTITUTIONS</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold">1.2B+</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>PEOPLE BANKED</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold">41/50</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>TOP BANKS WORLDWIDE</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold">150+</div>
            <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>COUNTRIES SERVED</div>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className={`w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>BSG Demo Platform</span>
        </div>
        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          © {new Date().getFullYear()} Temenos Headquarters SA
        </div>
        <div className="flex gap-6 text-sm">
          <a href="https://developer.temenos.com/privacy-policy" target="_blank" rel="noopener noreferrer" className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}>Privacy</a>
          <a href="https://www.temenos.com/legal-information/website-terms-and-conditions/" target="_blank" rel="noopener noreferrer" className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}>Terms</a>
          <a href="https://developer.temenos.com/cookie-policy" target="_blank" rel="noopener noreferrer" className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}>Cookies</a>
        </div>
      </div>
    </footer>
  )
}
