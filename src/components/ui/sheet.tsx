import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpenChange, open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/55"
        onClick={() => onOpenChange(false)}
        type="button"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
        <div className="overflow-y-auto pb-6">{children}</div>
      </aside>
    </div>,
    document.body,
  )
}
