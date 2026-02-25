import type { HTMLAttributes } from 'react'
import { cn } from '@/components/ui/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
