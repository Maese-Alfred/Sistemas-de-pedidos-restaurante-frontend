import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  contentClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  contentClassName?: string
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/55"
        onClick={() => onOpenChange(false)}
        type="button"
      />
      <div
        className={[
          'relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl',
          contentClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function DialogSection({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={['space-y-3', className].filter(Boolean).join(' ')}>{children}</div>
}
