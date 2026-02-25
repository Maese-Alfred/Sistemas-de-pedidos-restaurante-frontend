import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, Clock3, Minus, Plus, Search, ShoppingCart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { getMenu } from '@/api/menu'
import type { Product } from '@/api/contracts'
import { getLocalMenuImage } from '@/assets/menuImages'
import { useApp } from '@/app/context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Loading } from '@/components/Loading'
import { ErrorState } from '@/components/ErrorState'
import { ProductImage } from '@/components/ProductImage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

const BASE_CATEGORIES = ['entradas', 'principales', 'postres', 'bebidas'] as const
const FEEDBACK_MS = 1400
const EMPTY_PRODUCTS: Product[] = []

function categoryLabel(raw: string) {
  const key = raw.toLowerCase()
  if (key === 'entradas') return 'Entradas'
  if (key === 'principales') return 'Principales'
  if (key === 'postres') return 'Postres'
  if (key === 'bebidas') return 'Bebidas'
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function productCategory(product: Product) {
  return (product.category ?? 'otros').toLowerCase()
}

function money(value: number) {
  return `$${value}`
}

export function MenuPage() {
  const { tableNumber, cart, addToCart, updateCartItem } = useApp()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [lastAddedId, setLastAddedId] = useState<number | null>(null)
  const [showCartHint, setShowCartHint] = useState(false)
  const [cartPulseTick, setCartPulseTick] = useState(0)

  const feedbackTimeoutRef = useRef<number | null>(null)

  const menuQ = useQuery({
    queryKey: ['menu'],
    queryFn: getMenu,
  })

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current)
    }
  }, [])
  const products = menuQ.data ?? EMPTY_PRODUCTS

  const cartQtyById = useMemo(
    () => new Map(cart.map((item) => [item.productId, item.quantity] as const)),
    [cart],
  )

  const productPriceById = useMemo(
    () => new Map(products.map((product) => [product.id, product.price ?? 0] as const)),
    [products],
  )

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce(
    (sum, item) => sum + (productPriceById.get(item.productId) ?? 0) * item.quantity,
    0,
  )

  const filtered = products.filter((product) => {
    const text = `${product.name} ${product.description ?? ''}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesTab = selectedTab === 'all' || productCategory(product) === selectedTab
    return matchesSearch && matchesTab
  })

  if (!tableNumber) return <Navigate to="/client/table" replace />
  if (menuQ.isLoading) return <Loading label="Cargando menu..." />

  if (menuQ.isError) {
    return (
      <ErrorState
        title="No pudimos cargar el menu"
        detail={(menuQ.error as Error).message}
        onRetry={() => menuQ.refetch()}
      />
    )
  }

  function triggerCartFeedback(productId: number, hint = true) {
    setLastAddedId(productId)
    if (hint) setShowCartHint(true)
    setCartPulseTick((prev) => prev + 1)

    if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current)
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setLastAddedId(null)
      setShowCartHint(false)
    }, FEEDBACK_MS)
  }

  function add(product: Product) {
    addToCart(product, 1)
    triggerCartFeedback(product.id, true)

    toast({
      title: `${product.name} agregado`,
      description: 'Ajusta la cantidad y revisa el total en el boton Comprar.',
      tone: 'success',
    })
  }

  function increase(product: Product) {
    const current = cartQtyById.get(product.id) ?? 0
    if (current <= 0) {
      add(product)
      return
    }

    updateCartItem(product.id, current + 1)
    triggerCartFeedback(product.id, true)
  }

  function decrease(productId: number) {
    const current = cartQtyById.get(productId) ?? 0
    if (current <= 0) return
    updateCartItem(productId, current - 1)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="glass-topbar">
        <div className="page-wrap py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/client/table">
                <Button variant="ghost" size="icon" aria-label="Volver a mesas">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-medium">Menú</h1>
                <p className="text-sm text-muted-foreground">Mesa {tableNumber}</p>
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar platos..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </header>

      <main className="page-wrap">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid h-auto w-full grid-cols-5 rounded-2xl border border-border bg-muted/60 p-1">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {BASE_CATEGORIES.map((category) => (
              <TabsTrigger key={category} value={category}>
                {categoryLabel(category)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedTab} className="mt-5">
            <div className="grid gap-4 xl:grid-cols-2">
              {filtered.map((product, index) => {
                const wasJustAdded = lastAddedId === product.id
                const quantity = cartQtyById.get(product.id) ?? 0

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: wasJustAdded ? [1, 1.02, 1] : 1,
                    }}
                    transition={{
                      delay: index * 0.02,
                      duration: wasJustAdded ? 0.35 : 0.2,
                    }}
                  >
                    <Card
                      className={[
                        'overflow-hidden rounded-2xl border-border/80 bg-card/95 p-3 transition',
                        wasJustAdded ? 'border-accent/60 ring-2 ring-accent/35' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-24 w-24 overflow-hidden rounded-xl bg-muted">
                          <ProductImage
                            src={getLocalMenuImage(product.name) ?? product.imageUrl}
                            alt={product.name}
                            category={product.category}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-2xl font-medium">{product.name}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {product.description ?? 'Sin descripcion'}
                          </p>
                          <p className="mt-2 text-[34px] font-semibold leading-none text-accent">
                            {money(product.price ?? 0)}
                          </p>
                        </div>

                        {quantity <= 0 ? (
                          <Button
                            className={[
                              'self-end rounded-xl transition-all',
                              wasJustAdded ? 'bg-success text-success-foreground hover:bg-success/90' : '',
                            ].join(' ')}
                            onClick={() => add(product)}
                          >
                            {wasJustAdded ? (
                              <>
                                <Check className="mr-1 h-4 w-4" />
                                Agregado
                              </>
                            ) : (
                              <>
                                <Plus className="mr-1 h-4 w-4" />
                                Agregar
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="self-end rounded-full border border-accent/40 bg-accent/10 p-1">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-accent/20"
                                onClick={() => decrease(product.id)}
                                aria-label={`Quitar una unidad de ${product.name}`}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
                              <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                                onClick={() => increase(product)}
                                aria-label={`Agregar una unidad de ${product.name}`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {filtered.length === 0 ? (
              <Card className="mt-4 p-6 text-sm text-muted-foreground">
                No se encontraron platos para los filtros actuales.
              </Card>
            ) : null}
          </TabsContent>
        </Tabs>
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {showCartHint ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute -top-12 right-0 whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground shadow-lg"
            >
              ¡Listo! Toca "Comprar"
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {cartItemsCount > 0 ? (
            <motion.div
              key={`${cartItemsCount}-${cartTotal}`}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              className="absolute -top-14 right-0 rounded-full border border-border bg-card/95 px-3 py-1 text-xs shadow"
            >
              <span>{cartItemsCount} producto{cartItemsCount !== 1 ? 's' : ''}</span>
              <span className="mx-1">·</span>
              <span className="font-semibold text-accent">{money(cartTotal)}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          animate={cartItemsCount > 0 ? { y: [0, -4, 0] } : { y: 0 }}
          transition={
            cartItemsCount > 0
              ? { duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          <motion.div
            key={cartPulseTick}
            initial={{ scale: 1, rotate: 0 }}
            animate={cartPulseTick > 0 ? { scale: [1, 1.12, 0.98, 1.06, 1], rotate: [0, -4, 4, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Link to="/client/cart" className="relative block" aria-label="Ir al carrito para comprar">
              <span className="pointer-events-none absolute inset-0 rounded-full bg-accent/35 blur-xl" />

              <Button className="relative h-16 rounded-full border-2 border-accent/50 bg-card px-5 pr-7 text-accent shadow-[0_14px_30px_-14px_rgba(216,70,39,0.9)] hover:bg-accent hover:text-accent-foreground">
                <ShoppingCart className="h-5 w-5" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold">Comprar</span>
                  <span className="text-[11px] opacity-80">{cartItemsCount > 0 ? money(cartTotal) : 'Sin items'}</span>
                </span>
              </Button>

              {cartItemsCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 h-7 min-w-7 justify-center rounded-full bg-success px-1 text-xs text-success-foreground ring-2 ring-background">
                  {cartItemsCount}
                </Badge>
              ) : null}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
