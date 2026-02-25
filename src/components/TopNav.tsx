import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'

type Mode = 'client' | 'kitchen'

export function TopNav({
  mode,
  onSwitch,
}: {
  mode: Mode
  onSwitch: (m: Mode) => void
}) {
  return (
    <header className="glass-topbar">
      <div className="page-wrap flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-warm">
            🍽️
          </div>
          <div>
            <div className="text-sm font-semibold sm:text-base">Pedidos Restaurante</div>
            <div className="text-xs text-muted-foreground">Cliente y cocina en un solo flujo</div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant={mode === 'client' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSwitch('client')}
          >
            Cliente
          </Button>
          <Button
            variant={mode === 'kitchen' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSwitch('kitchen')}
          >
            Cocina
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
