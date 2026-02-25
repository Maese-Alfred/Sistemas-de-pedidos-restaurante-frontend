export type Product = {
  id: number
  name: string
  description?: string
  price?: number
  isActive?: boolean
  category?: string
  imageUrl?: string
}

export type OrderStatus =
  | 'PENDING'
  | 'IN_PREPARATION'
  | 'READY'

export type OrderItem = {
  id?: number
  productId: number
  quantity: number
  note?: string
  // info extra para UI (viene del backend)
  productName?: string
  name?: string
}

export type Order = {
  id: string
  tableId: number
  status: OrderStatus
  items: OrderItem[]
  note?: string
  createdAt?: string
  updatedAt?: string
  statusHistory?: Array<{ status: OrderStatus; changedAt: string; changedBy?: string }>
}

export type CreateOrderRequest = {
  tableId: number
  items: Array<{ productId: number; quantity: number; note?: string }>
  note?: string
}

export type CreateOrderResponse = {
  id: string
  status: OrderStatus
}

export type ProductBreakdown = {
  productId: number
  productName: string
  quantitySold: number
  totalAccumulated: number
}

export type ReportResponse = {
  totalReadyOrders: number
  totalRevenue: number
  productBreakdown: ProductBreakdown[]
}
