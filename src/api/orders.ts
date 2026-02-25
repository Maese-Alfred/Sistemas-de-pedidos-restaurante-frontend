import { ENV } from '@/api/env'
import { http } from '@/api/http'
import type { CreateOrderRequest, CreateOrderResponse, Order, OrderStatus } from '@/api/contracts'
import {
  mockClearOrders,
  mockCreateOrder,
  mockDeleteOrder,
  mockGetOrder,
  mockListOrders,
  mockPatchOrderStatus,
} from '@/api/mock'

export async function createOrder(req: CreateOrderRequest) {
  if (ENV.USE_MOCK) return mockCreateOrder(req)

  try {
    return await http<CreateOrderResponse>('/orders', { method: 'POST', json: req })
  } catch (error) {
    if (ENV.ALLOW_MOCK_FALLBACK) {
      console.warn('Falling back to mock createOrder:', error)
      return mockCreateOrder(req)
    }
    throw error
  }
}

export async function getOrder(orderId: string) {
  if (ENV.USE_MOCK) return mockGetOrder(orderId)

  try {
    return await http<Order>(`/orders/${encodeURIComponent(orderId)}`)
  } catch (error) {
    if (ENV.ALLOW_MOCK_FALLBACK) {
      console.warn('Falling back to mock getOrder:', error)
      return mockGetOrder(orderId)
    }
    throw error
  }
}

export async function listOrders(params: { status?: OrderStatus[] }, kitchenToken?: string) {
  if (ENV.USE_MOCK) return mockListOrders(params)

  const qs = new URLSearchParams()
  if (params.status && params.status.length > 0) {
    qs.set('status', params.status.join(','))
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : ''

  try {
    return await http<Order[]>(`/orders${suffix}`, { kitchenToken })
  } catch (error) {
    if (ENV.ALLOW_MOCK_FALLBACK) {
      console.warn('Falling back to mock listOrders:', error)
      return mockListOrders(params)
    }
    throw error
  }
}

export async function patchOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  kitchenToken?: string,
) {
  if (ENV.USE_MOCK) return mockPatchOrderStatus(orderId, newStatus)

  try {
    return await http<Order>(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      json: { newStatus, status: newStatus },
      kitchenToken,
    })
  } catch (error) {
    if (ENV.ALLOW_MOCK_FALLBACK) {
      console.warn('Falling back to mock patchOrderStatus:', error)
      return mockPatchOrderStatus(orderId, newStatus)
    }
    throw error
  }
}

export async function deleteOrder(orderId: string, kitchenToken?: string) {
  if (ENV.USE_MOCK) return mockDeleteOrder(orderId)

  try {
    await http<unknown>(`/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
      kitchenToken,
    })
  } catch (error) {
    if (ENV.ALLOW_MOCK_FALLBACK) {
      console.warn('Falling back to mock deleteOrder:', error)
      return mockDeleteOrder(orderId)
    }
    throw error
  }
}

export async function clearOrders(kitchenToken?: string) {
  if (ENV.USE_MOCK) return mockClearOrders()

  try {
    await http<unknown>('/orders', {
      method: 'DELETE',
      kitchenToken,
    })
  } catch (error) {
    if (ENV.ALLOW_MOCK_FALLBACK) {
      console.warn('Falling back to mock clearOrders:', error)
      return mockClearOrders()
    }
    throw error
  }
}
