import { Link, Navigate, useParams } from 'react-router-dom'
import { CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'motion/react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ConfirmationPage() {
  const { orderId } = useParams()

  if (!orderId) return <Navigate to="/client/table" replace />

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-topbar">
        <div className="page-wrap flex justify-end py-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="page-wrap flex max-w-3xl flex-col items-center justify-center py-10 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.45 }}
          className="rounded-full bg-success/10 p-6"
        >
          <CheckCircle2 className="h-20 w-20 text-success" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6"
        >
          <h1 className="text-4xl font-semibold">Pedido confirmado</h1>
          <p className="mt-2 text-muted-foreground">Tu pedido #{orderId.slice(0, 8)} fue enviado a cocina.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-6 w-full"
        >
          <Card className="p-6 text-left">
            <p className="text-sm text-muted-foreground">ID completo del pedido</p>
            <p className="mt-2 break-all text-lg font-semibold">{orderId}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="mt-6 flex w-full flex-col gap-3 sm:flex-row"
        >
          <Link to={`/client/status/${encodeURIComponent(orderId)}`} className="flex-1">
            <Button variant="outline" className="h-12 w-full">
              <Clock className="mr-2 h-5 w-5" />
              Ver estado
            </Button>
          </Link>
          <Link to="/client/menu" className="flex-1">
            <Button className="h-12 w-full">Volver al menu</Button>
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
