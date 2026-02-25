import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock3, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { createOrder } from '@/api/orders'
import { getMenu } from '@/api/menu'
import type { CreateOrderRequest } from '@/api/contracts'
import { getLocalMenuImage } from '@/assets/menuImages'
import { useApp } from '@/app/context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ProductImage } from '@/components/ProductImage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'

export function CartPage() {
  const navigate = useNavigate()
  const {
    tableNumber,
    cart,
    updateCartItem,
    removeFromCart,
    clearCart,
    orderNote,
    setOrderNote,
  } = useApp()
  const { toast } = useToast()

  const [localError, setLocalError] = useState('')

  const menuQ = useQuery({ queryKey: ['menu'], queryFn: getMenu })

  const productMap = useMemo(() => {
    const map = new Map<number, { price: number; imageUrl?: string; category?: string }>()
    for (const product of menuQ.data ?? []) {
      map.set(product.id, {
        price: product.price ?? 0,
        imageUrl: getLocalMenuImage(product.name) ?? product.imageUrl,
        category: product.category,
      })
    }
    return map
  }, [menuQ.data])

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (productMap.get(item.productId)?.price ?? 0) * item.quantity,
        0,
      ),
    [productMap, cart],
  )

  const createM = useMutation({
    mutationFn: (req: CreateOrderRequest) => createOrder(req),
    onSuccess: (res) => {
      clearCart()
      toast({
        title: 'Pedido confirmado',
        description: `Tu pedido se creo con id ${res.id}.`,
        tone: 'success',
      })
      navigate(`/client/confirm/${encodeURIComponent(res.id)}`)
    },
    onError: (err: unknown) => {
      setLocalError(err instanceof Error ? err.message : 'No se pudo crear el pedido')
    },
  })

  if (tableNumber === null) return <Navigate to="/client/table" replace />
  const tableId = tableNumber

  function submit() {
    setLocalError('')

    if (cart.length === 0) {
      setLocalError('Tu carrito esta vacio.')
      return
    }

    const req: CreateOrderRequest = {
      tableId,
      note: orderNote || undefined,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        note: item.note || undefined,
      })),
    }

    createM.mutate(req)
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <header className="glass-topbar">
        <div className="page-wrap py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/client/menu">
                <Button variant="ghost" size="icon" aria-label="Volver a menu">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-medium">Carrito</h1>
                <p className="text-sm text-muted-foreground">Mesa {tableId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/client/status">
                <Button variant="outline" size="sm" className="gap-2">
                  <Clock3 className="h-4 w-4" />
                  Estado
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="page-wrap max-w-3xl">
        {cart.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">No hay productos en tu carrito.</Card>
        ) : (
          <div className="space-y-4">
            <Card className="border-accent/30 bg-accent/10 p-3 text-xs text-muted-foreground">
              Ajusta cantidades desde el menú. Aquí solo revisas y confirmas el pedido.
            </Card>

            {cart.map((item, index) => {
              const product = productMap.get(item.productId)
              const unitPrice = product?.price ?? 0
              const subtotal = unitPrice * item.quantity

              return (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                >
                  <Card className="p-4">
                    <div className="flex gap-3">
                      <div className="h-20 w-20 overflow-hidden rounded-xl bg-muted">
                        <ProductImage
                          src={product?.imageUrl}
                          alt={item.name}
                          category={product?.category}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-2xl font-medium">{item.name}</h3>
                          <button
                            type="button"
                            className="rounded-md p-1 text-primary transition hover:bg-primary/10"
                            onClick={() => removeFromCart(item.productId)}
                            aria-label={`Eliminar ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          ${unitPrice} x {item.quantity} = ${subtotal}
                        </p>

                        <div className="mt-3 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                          Cantidad elegida en menú: <span className="font-semibold text-foreground">{item.quantity}</span>
                        </div>
                      </div>
                    </div>

                    <Textarea
                      className="mt-4"
                      rows={2}
                      placeholder="Notas para este plato..."
                      value={item.note ?? ''}
                      onChange={(event) =>
                        updateCartItem(item.productId, item.quantity, event.target.value)
                      }
                    />
                  </Card>
                </motion.div>
              )
            })}

            <Card className="p-4">
              <p className="text-sm font-medium">Notas adicionales del pedido</p>
              <Textarea
                className="mt-2"
                rows={3}
                placeholder="Ej: sin picante, enviar cubiertos extras..."
                value={orderNote}
                onChange={(event) => setOrderNote(event.target.value)}
              />
            </Card>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="page-wrap max-w-3xl py-5">
          <div className="mb-3 flex items-center justify-between text-lg">
            <span>Total</span>
            <span className="text-3xl font-semibold text-accent">${total}</span>
          </div>

          {localError ? <div className="mb-2 text-sm text-danger">{localError}</div> : null}

          <Button className="h-12 w-full text-base" onClick={submit} disabled={createM.isPending}>
            {createM.isPending ? 'Enviando...' : 'Confirmar pedido'}
          </Button>
        </div>
      </div>
    </div>
  )
}
