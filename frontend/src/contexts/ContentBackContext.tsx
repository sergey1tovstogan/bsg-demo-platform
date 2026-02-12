import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ContentBackContextValue {
  showBack: boolean
  onBack: (() => void) | null
  setBackState: (show: boolean, onBack: (() => void) | null) => void
}

const ContentBackContext = createContext<ContentBackContextValue | null>(null)

export function ContentBackProvider({ children }: { children: ReactNode }) {
  const [showBack, setShowBack] = useState(false)
  const [onBack, setOnBack] = useState<(() => void) | null>(null)

  const setBackState = useCallback((show: boolean, handler: (() => void) | null) => {
    setShowBack(show)
    setOnBack(() => handler)
  }, [])

  return (
    <ContentBackContext.Provider value={{ showBack, onBack, setBackState }}>
      {children}
    </ContentBackContext.Provider>
  )
}

export function useContentBack() {
  const ctx = useContext(ContentBackContext)
  return ctx
}
