import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Lock } from 'lucide-react'
import { motion } from 'motion/react'
import { ENV } from '@/api/env'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { getKitchenToken, setKitchenToken } from '@/store/kitchenAuth'

export function KitchenLoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getKitchenToken()) navigate('/kitchen/board', { replace: true })
  }, [navigate])

  function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)

    window.setTimeout(() => {
      if (password.trim() === ENV.KITCHEN_PIN) {
        const token = ENV.KITCHEN_FIXED_TOKEN || ENV.KITCHEN_PIN
        setKitchenToken(token)
        toast({ title: 'Inicio de sesion exitoso', tone: 'success' })
        navigate('/kitchen/board', { replace: true })
      } else {
        toast({
          title: 'PIN incorrecto',
          description: 'Verifica el PIN e intenta de nuevo.',
          tone: 'danger',
        })
        setLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-topbar">
        <div className="page-wrap flex justify-end py-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="page-wrap flex items-center justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-accent p-4 text-accent-foreground">
                <ChefHat className="h-12 w-12" />
              </div>
              <h1 className="text-3xl font-semibold">Panel de cocina</h1>
              <p className="mt-2 text-sm text-muted-foreground">Ingresa para gestionar pedidos.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-sm font-medium" htmlFor="kitchen-pass">
                PIN
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="kitchen-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu PIN"
                  className="pl-9"
                  required
                />
              </div>

              <Button className="h-11 w-full" disabled={loading} type="submit">
                {loading ? 'Verificando...' : 'Ingresar'}
              </Button>
            </form>

            <Card className="mt-5 border-none bg-muted/60 p-3 text-center text-xs text-muted-foreground">
              Demo: usa el PIN "{ENV.KITCHEN_PIN}"
            </Card>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
