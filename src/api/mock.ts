import type {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  OrderStatus,
  Product,
} from '@/api/contracts'

const nowIso = () => new Date().toISOString()

let seq = 1
function nextId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const id = `mock-${seq}`
  seq += 1
  return id
}

const products: Product[] = [
  {
    id: 1,
    name: 'Empanadas criollas',
    description: 'Empanadas de carne con salsa casera.',
    price: 450,
    isActive: true,
    category: 'entradas',
    imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Provoleta grillada',
    description: 'Queso provolone con oregano y oliva.',
    price: 520,
    isActive: true,
    category: 'entradas',
    imageUrl: 'https://www.clarin.com/2022/08/31/SvRumKBuh_2000x1500__1.jpg',
  },
  {
    id: 3,
    name: 'Ceviche de pescado',
    description: 'Pescado fresco marinado con limon y cilantro.',
    price: 680,
    isActive: true,
    category: 'entradas',
    imageUrl: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Tabla de fiambres',
    description: 'Seleccion de quesos y embutidos artesanales.',
    price: 890,
    isActive: true,
    category: 'entradas',
    imageUrl: 'https://images.unsplash.com/photo-1541013406133-94ed77ee8ba8?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    name: 'Bife de chorizo',
    description: 'Corte premium con papas rusticas.',
    price: 1850,
    isActive: true,
    category: 'principales',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
  },
  {
    id: 6,
    name: 'Milanesa napolitana',
    description: 'Milanesa con salsa pomodoro y queso.',
    price: 1420,
    isActive: true,
    category: 'principales',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  },
  {
    id: 7,
    name: 'Salmon a la plancha',
    description: 'Filete de salmon con vegetales asados y arroz.',
    price: 1650,
    isActive: true,
    category: 'principales',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
  },
  {
    id: 8,
    name: 'Pasta carbonara',
    description: 'Fettuccini con panceta, crema y parmesano.',
    price: 1180,
    isActive: true,
    category: 'principales',
    imageUrl: 'https://www.laragazzacolmattarello.com/wp-content/uploads/2025/01/pasta-a-la-carbonara.jpg',
  },
  {
    id: 9,
    name: 'Tacos de pollo',
    description: 'Tres tacos con pollo asado, guacamole y pico de gallo.',
    price: 980,
    isActive: true,
    category: 'principales',
    imageUrl: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=300&fit=crop',
  },
  {
    id: 10,
    name: 'Locro tradicional',
    description: 'Guiso de maiz, porotos y carne de cerdo.',
    price: 1250,
    isActive: true,
    category: 'principales',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
  },
  {
    id: 11,
    name: 'Flan con dulce de leche',
    description: 'Flan casero con caramelo y dulce de leche.',
    price: 520,
    isActive: true,
    category: 'postres',
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop',
  },
  {
    id: 12,
    name: 'Tiramisu',
    description: 'Postre italiano con cafe y cacao.',
    price: 560,
    isActive: true,
    category: 'postres',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
  },
  {
    id: 13,
    name: 'Volcan de chocolate',
    description: 'Bizcocho tibio con centro fundido.',
    price: 480,
    isActive: true,
    category: 'postres',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
  },
  {
    id: 14,
    name: 'Limonada de la casa',
    description: 'Limon, menta y almibar ligero.',
    price: 280,
    isActive: true,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400&h=300&fit=crop',
  },
  {
    id: 15,
    name: 'Jugo de maracuya',
    description: 'Jugo natural de maracuya con hielo.',
    price: 320,
    isActive: true,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop',
  },
  {
    id: 16,
    name: 'Limonada de coco',
    description: 'Bebida fria cremosa con limon y coco.',
    price: 360,
    isActive: true,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=300&fit=crop',
  },
]

const orders: Order[] = []
let seeded = false

function seedOrders() {
  if (seeded) return
  seeded = true

  const createdAt = nowIso()
  orders.push(
    {
      id: nextId(),
      tableId: 3,
      status: 'PENDING',
      items: [
        {
          id: 1,
          productId: 1,
          productName: 'Empanadas criollas',
          quantity: 2,
          note: 'Sin cebolla',
        },
      ],
      note: 'Enviar cubiertos extra',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: nextId(),
      tableId: 5,
      status: 'IN_PREPARATION',
      items: [
        {
          id: 2,
          productId: 3,
          productName: 'Ceviche de pescado',
          quantity: 1,
        },
      ],
      createdAt,
      updatedAt: createdAt,
    },
  )
}

function findOrder(orderId: string) {
  return orders.find((o) => o.id === orderId)
}

export async function mockGetMenu(): Promise<Product[]> {
  seedOrders()
  return products.filter((p) => p.isActive)
}

export async function mockCreateOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
  seedOrders()
  const id = nextId()
  const createdAt = nowIso()

  const order: Order = {
    id,
    tableId: req.tableId,
    status: 'PENDING',
    items: req.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      note: i.note,
    })),
    note: req.note,
    createdAt,
    updatedAt: createdAt,
  }

  orders.unshift(order)

  return { id, status: order.status }
}

export async function mockGetOrder(orderId: string): Promise<Order> {
  seedOrders()
  const order = findOrder(orderId)
  if (!order) throw new Error('Pedido no encontrado')
  return order
}

export async function mockListOrders(params: { status?: OrderStatus[] }): Promise<Order[]> {
  seedOrders()
  const { status } = params
  if (!status || status.length === 0) return orders
  return orders.filter((o) => status.includes(o.status))
}

export async function mockPatchOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
  seedOrders()
  const order = findOrder(orderId)
  if (!order) throw new Error('Pedido no encontrado')

  order.status = newStatus
  order.updatedAt = nowIso()

  return order
}

export async function mockDeleteOrder(orderId: string): Promise<void> {
  seedOrders()
  const index = orders.findIndex((order) => order.id === orderId)
  if (index < 0) throw new Error('Pedido no encontrado')
  orders.splice(index, 1)
}

export async function mockClearOrders(): Promise<void> {
  seedOrders()
  orders.splice(0, orders.length)
}
