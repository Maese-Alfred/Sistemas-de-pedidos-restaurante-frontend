import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChefHat, Clock3, UtensilsCrossed } from 'lucide-react'
import { motion } from 'motion/react'
import { HttpError } from '@/api/http'
import { listOrders } from '@/api/orders'
import { OCCUPIED_TABLE_STATUSES } from '@/domain/orderStatus'
import { clearKitchenToken } from '@/store/kitchenAuth'
import { useApp } from '@/app/context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const TABLE_COUNT = 12

export function TableSelectPage() {
  const navigate = useNavigate()
  const { tableNumber, setTableNumber } = useApp()
  const [shouldPoll, setShouldPoll] = useState(true)

  const occupancyQ = useQuery({
    queryKey: ['table-occupancy'],
    queryFn: async () => {
      try {
        return await listOrders({ status: OCCUPIED_TABLE_STATUSES })
      } catch (err) {
        // Handle 401 authentication errors - clear invalid token and stop polling
        if (err instanceof HttpError && err.status === 401) {
          clearKitchenToken()
          setShouldPoll(false)
        }
        throw err
      }
    },
    refetchInterval: shouldPoll ? 5000 : false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  })

  const tables = useMemo(() => Array.from({ length: TABLE_COUNT }, (_, index) => index + 1), [])

  const occupiedSet = useMemo(() => {
    const set = new Set<number>()
    for (const order of occupancyQ.data ?? []) set.add(order.tableId)
    return set
  }, [occupancyQ.data])

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-topbar">
        <div className="page-wrap flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent p-2.5 text-accent-foreground shadow-warm">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Restaurante</h1>
              <p className="text-xs text-muted-foreground">Bienvenido</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="page-wrap max-w-5xl py-8 sm:py-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold">Selecciona tu mesa</h2>
          <p className="mt-2 text-muted-foreground">Elige el numero de tu mesa para comenzar tu pedido</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <Badge variant="success">Verde: vacia</Badge>
            <Badge variant="danger">Rojo: ocupada</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
          {tables.map((table, index) => {
            const occupied = occupiedSet.has(table)
            const selected = tableNumber === table

            return (
              <motion.button
                key={table}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.22 }}
                onClick={() => {
                  if (occupied) return
                  setTableNumber(table)
                  navigate('/client/menu')
                }}
                className={[
                  'rounded-3xl border bg-card p-4 text-center transition duration-200',
                  selected ? 'ring-2 ring-ring/25' : '',
                  occupied
                    ? 'border-danger/60 text-danger hover:bg-danger/5'
                    : 'border-success/60 text-foreground hover:bg-success/5',
                ].join(' ')}
              >
                <div className="text-4xl font-semibold">{table}</div>
                <div className="mt-2 text-xs">
                  <span
                    className={[
                      'inline-flex items-center gap-1 rounded-full border px-2 py-1',
                      occupied
                        ? 'border-danger/40 bg-danger/10 text-danger'
                        : 'border-success/40 bg-success/10 text-success',
                    ].join(' ')}
                  >
                    <span className={['status-dot', occupied ? 'bg-danger' : 'bg-success'].join(' ')} />
                    {occupied ? 'Ocupada' : 'Vacia'}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>

        <Card className="mt-8 border-none bg-muted/60 p-4 text-center text-sm text-muted-foreground">
          <span className="mr-1">💡</span>
          Si no encuentras tu mesa, pide ayuda a nuestro personal
        </Card>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/client/status">
            <Button variant="outline" className="gap-2">
              <Clock3 className="h-4 w-4" />
              Consultar pedido
            </Button>
          </Link>

          <Link to="/kitchen">
            <Button variant="outline" className="gap-2">
              <ChefHat className="h-4 w-4" />
              Acceso a cocina
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
