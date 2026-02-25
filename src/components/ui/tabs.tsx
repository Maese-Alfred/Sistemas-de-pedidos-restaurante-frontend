import { createContext, useContext } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/components/ui/utils'

type TabsCtx = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsCtx | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used inside <Tabs>')
  return ctx
}

export function Tabs({
  value,
  onValueChange,
  className,
  children,
}: HTMLAttributes<HTMLDivElement> & TabsCtx) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-grid h-10 items-center rounded-xl bg-muted p-1 text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  value,
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { value: string }) {
  const tabs = useTabsContext()
  const active = tabs.value === value

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition',
        active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={() => tabs.onValueChange(value)}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  className,
  value,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: string }) {
  const tabs = useTabsContext()
  if (tabs.value !== value) return null

  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
