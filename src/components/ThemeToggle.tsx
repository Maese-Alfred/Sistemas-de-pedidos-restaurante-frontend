import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Cambiar tema">
      {theme === 'dark' ? '☀️' : '🌙'}
    </Button>
  )
}
