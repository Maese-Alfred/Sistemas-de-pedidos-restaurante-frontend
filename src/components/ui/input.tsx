import type { InputHTMLAttributes } from 'react'
import { cn } from '@/components/ui/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50',
        className,
      )}
      {...props}
    />
  )
}
