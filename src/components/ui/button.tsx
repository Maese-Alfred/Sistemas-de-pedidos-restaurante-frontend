import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/components/ui/utils'

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground hover:brightness-110 active:brightness-95',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
  ghost:
    'bg-transparent text-foreground hover:bg-muted active:bg-muted/80',
  outline:
    'border border-border bg-background text-foreground hover:bg-muted active:bg-muted/80',
  danger:
    'bg-danger text-danger-foreground hover:brightness-110 active:brightness-95',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10 p-0',
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
