import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'orders_theme_v2'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
} | null>(null)

function readTheme(): Theme {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    // noop
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // noop
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
