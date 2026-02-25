import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ErrorState({
  title = 'Ocurrio un error',
  detail,
  onRetry,
}: {
  title?: string
  detail?: string
  onRetry?: () => void
}) {
  return (
    <Card className="p-6">
      <div className="text-base font-semibold">{title}</div>
      {detail ? <div className="mt-2 text-sm text-muted-foreground">{detail}</div> : null}
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </Card>
  )
}
