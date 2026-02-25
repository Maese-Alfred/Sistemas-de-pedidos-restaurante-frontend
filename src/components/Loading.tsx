import { Card } from '@/components/ui/card'

export function Loading({ label = 'Cargando...' }: { label?: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </Card>
  )
}
