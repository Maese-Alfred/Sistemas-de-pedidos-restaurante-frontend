import type { HTMLAttributes } from 'react'
import { cn } from '@/components/ui/utils'

type Variant = 'default' | 'success' | 'danger' | 'warning' | 'outline'

const variantClasses: Record<Variant, string> = {
  default: 'bg-muted text-foreground',
  success: 'bg-success text-success-foreground',
  danger: 'bg-danger text-danger-foreground',
  warning: 'bg-warning text-warning-foreground',
  outline: 'border border-border bg-transparent text-foreground',
}

export function Badge({
  className,
  children,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
