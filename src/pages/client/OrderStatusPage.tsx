import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, Clock, Package } from 'lucide-react'
import { motion } from 'motion/react'
import { HttpError } from '@/api/http'
import { getMenu } from '@/api/menu'
import { getOrder } from '@/api/orders'
import { buildProductNameMap, resolveOrderItemName } from '@/domain/productLabel'
import { STATUS_LABEL } from '@/domain/orderStatus'
import { clearKitchenToken } from '@/store/kitchenAuth'
import type { OrderStatus } from '@/api/contracts'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Loading } from '@/components/Loading'
import { ErrorState } from '@/components/ErrorState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; icon: typeof Clock }> = [
  { key: 'PENDING', label: 'Pendiente', icon: Clock },
  { key: 'IN_PREPARATION', label: 'En preparacion', icon: Package },
  { key: 'READY', label: 'Listo', icon: CheckCircle },
]

export function OrderStatusPage() {
  const { orderId: orderIdParam } = useParams()
  const navigate = useNavigate()
  const [orderIdInput, setOrderIdInput] = useState(orderIdParam ?? '')
  const [shouldPoll, setShouldPoll] = useState(true)

  const orderId = useMemo(() => orderIdParam ?? '', [orderIdParam])

  const orderQ = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      try {
        return await getOrder(orderId)
      } catch (err) {
        // Handle 401 authentication errors - clear invalid token and stop polling
        if (err instanceof HttpError && err.status === 401) {
          clearKitchenToken()
          setShouldPoll(false)
        }
        throw err
      }
    },
    enabled: Boolean(orderId),
    refetchInterval: shouldPoll ? 5000 : false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })

  const menuQ = useQuery({
    queryKey: ['menu'],
    queryFn: getMenu,
    staleTime: 60_000,
  })

  const productNames = useMemo(() => buildProductNameMap(menuQ.data), [menuQ.data])

  function go() {
    const id = orderIdInput.trim()
    if (!id) return
    navigate(`/client/status/${encodeURIComponent(id)}`)
  }

  const currentStepIndex = STATUS_STEPS.findIndex((step) => step.key === (orderQ.data?.status ?? 'PENDING'))

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-topbar">
        <div className="page-wrap py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/client/table">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-medium">Estado del pedido</h1>
                <p className="text-sm text-muted-foreground">Seguimiento en tiempo real</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Ingresa tu orderId"
              value={orderIdInput}
              onChange={(event) => setOrderIdInput(event.target.value)}
              onKeyDown={(event) => (event.key === 'Enter' ? go() : null)}
            />
            <Button onClick={go}>Consultar</Button>
          </div>
        </div>
      </header>

      <main className="page-wrap max-w-3xl py-8">
        {!orderId ? (
          <Card className="p-6 text-sm text-muted-foreground">Ingresa un orderId para consultar.</Card>
        ) : orderQ.isLoading ? (
          <Loading label="Consultando estado..." />
        ) : orderQ.isError ? (
          <ErrorState
            title="No pudimos consultar el pedido"
            detail={(orderQ.error as Error).message}
            onRetry={() => orderQ.refetch()}
          />
        ) : (
          <Card className="p-6">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge variant="outline">Pedido {orderQ.data?.id.slice(0, 8)}</Badge>
              <Badge variant="outline">Mesa {orderQ.data?.tableId}</Badge>
              <Badge variant="warning">{STATUS_LABEL[orderQ.data?.status ?? 'PENDING']}</Badge>
            </div>

            <div className="relative mb-7">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-muted" />
              <div
                className="absolute left-0 top-5 h-0.5 bg-accent transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon
                  const done = index <= currentStepIndex
                  const current = index === currentStepIndex
                  return (
                    <motion.div
                      key={step.key}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={[
                          'flex h-10 w-10 items-center justify-center rounded-full transition',
                          done ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground',
                          current ? 'ring-4 ring-ring/20' : '',
                        ].join(' ')}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className={`text-xs ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Detalle</h3>
              {orderQ.data?.items.map((item) => (
                <div key={`${item.productId}-${item.note ?? ''}`} className="rounded-xl border border-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span>{resolveOrderItemName(item, productNames)}</span>
                    <span>x{item.quantity}</span>
                  </div>
                  {item.note ? <div className="mt-1 text-xs text-muted-foreground">Nota: {item.note}</div> : null}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
