import { cn } from '@/components/ui/utils'

export function SectionTitle({
  title,
  subtitle,
  right,
  className,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  )
}
