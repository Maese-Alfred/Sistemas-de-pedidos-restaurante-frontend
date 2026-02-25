import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cn } from '@/components/ui/utils'

type ToastItem = {
  id: number
  title: string
  description?: string
  tone?: 'default' | 'success' | 'danger'
}

const ToastContext = createContext<{
  show: (toast: Omit<ToastItem, 'id'>) => void
} | null>(null)

const toneClasses: Record<NonNullable<ToastItem['tone']>, string> = {
  default: 'border-border bg-card text-card-foreground',
  success: 'border-success/30 bg-success/10 text-foreground',
  danger: 'border-danger/30 bg-danger/10 text-foreground',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const item: ToastItem = { id, tone: 'default', ...toast }
    setToasts((prev) => [...prev, item])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-xl border p-3 shadow-lg backdrop-blur',
              toneClasses[toast.tone ?? 'default'],
            )}
          >
            <div className="text-sm font-semibold">{toast.title}</div>
            {toast.description ? (
              <div className="mt-1 text-xs text-muted-foreground">{toast.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return {
    toast: ctx.show,
  }
}
