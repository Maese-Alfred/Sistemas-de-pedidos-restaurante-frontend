import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as ordersApi from '@/api/orders'
import * as mockApi from '@/api/mock'
import * as httpModule from '@/api/http'
import * as envModule from '@/api/env'
import type { CreateOrderRequest, Order, CreateOrderResponse } from '@/api/contracts'

// ════════════════════════════════════════════════════════════════════════════
// SETUP Y FIXTURES
// ════════════════════════════════════════════════════════════════════════════

const SAMPLE_ORDER_REQUEST: CreateOrderRequest = {
  tableId: 5,
  items: [
    { productId: 1, quantity: 2, note: 'Con extra salsa' },
    { productId: 3, quantity: 1 },
  ],
  note: 'Orden de prueba',
}

const SAMPLE_ORDER_RESPONSE: CreateOrderResponse = {
  id: 'order-uuid-001',
  status: 'PENDING',
}

const SAMPLE_ORDER: Order = {
  id: 'order-uuid-001',
  tableId: 5,
  status: 'PENDING',
  items: [
    { productId: 1, quantity: 2, productName: 'Empanadas criollas', note: 'Con extra salsa' },
    { productId: 3, quantity: 1, productName: 'Ceviche de pescado' },
  ],
  note: 'Orden de prueba',
  createdAt: '2026-02-27T10:30:00Z',
  updatedAt: '2026-02-27T10:30:00Z',
}

const KITCHEN_TOKEN = 'test-kitchen-token-123'

// ════════════════════════════════════════════════════════════════════════════
// MOCKS GLOBALES
// ════════════════════════════════════════════════════════════════════════════

vi.mock('@/api/http')
vi.mock('@/api/mock')
vi.mock('@/api/env', { spy: true })

const mockHttp = vi.mocked(httpModule.http)
const mockMockApi = vi.mocked(mockApi)
const mockEnv = vi.mocked(envModule.ENV)

// ════════════════════════════════════════════════════════════════════════════
// TESTS: createOrder
// ════════════════════════════════════════════════════════════════════════════

describe('orders.createOrder()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use mock when ENV.USE_MOCK is true', async () => {
    // Arrange
    mockEnv.USE_MOCK = true
    mockMockApi.mockCreateOrder.mockResolvedValue(SAMPLE_ORDER_RESPONSE)

    // Act
    const result = await ordersApi.createOrder(SAMPLE_ORDER_REQUEST)

    // Assert
    expect(mockMockApi.mockCreateOrder).toHaveBeenCalledWith(SAMPLE_ORDER_REQUEST)
    expect(mockMockApi.mockCreateOrder).toHaveBeenCalledTimes(1)
    expect(result).toEqual(SAMPLE_ORDER_RESPONSE)
    expect(mockHttp).not.toHaveBeenCalled()
  })

  it('should call http when ENV.USE_MOCK is false and succeeds', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(SAMPLE_ORDER_RESPONSE)

    // Act
    const result = await ordersApi.createOrder(SAMPLE_ORDER_REQUEST)

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders', {
      method: 'POST',
      json: SAMPLE_ORDER_REQUEST,
    })
    expect(result).toEqual(SAMPLE_ORDER_RESPONSE)
    expect(mockMockApi.mockCreateOrder).not.toHaveBeenCalled()
  })

  it('should throw error when ENV.USE_MOCK is false and http fails without fallback', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const error = new Error('Network error')
    mockHttp.mockRejectedValue(error)

    // Act & Assert
    await expect(ordersApi.createOrder(SAMPLE_ORDER_REQUEST)).rejects.toThrow('Network error')
    expect(mockMockApi.mockCreateOrder).not.toHaveBeenCalled()
  })

  it('should fall back to mock when http fails and ENV.ALLOW_MOCK_FALLBACK is true', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = true
    const error = new Error('Network error')
    mockHttp.mockRejectedValue(error)
    mockMockApi.mockCreateOrder.mockResolvedValue(SAMPLE_ORDER_RESPONSE)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Act
    await ordersApi.createOrder(SAMPLE_ORDER_REQUEST)

    // Assert
    expect(mockMockApi.mockCreateOrder).toHaveBeenCalledWith(SAMPLE_ORDER_REQUEST)
    expect(warnSpy).toHaveBeenCalledWith('Falling back to mock createOrder:', error)

    warnSpy.mockRestore()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS: getOrder
// ════════════════════════════════════════════════════════════════════════════

describe('orders.getOrder()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use mock when ENV.USE_MOCK is true', async () => {
    // Arrange
    mockEnv.USE_MOCK = true
    mockMockApi.mockGetOrder.mockResolvedValue(SAMPLE_ORDER)

    // Act
    const result = await ordersApi.getOrder('order-uuid-001')

    // Assert
    expect(mockMockApi.mockGetOrder).toHaveBeenCalledWith('order-uuid-001')
    expect(result).toEqual(SAMPLE_ORDER)
    expect(mockHttp).not.toHaveBeenCalled()
  })

  it('should call http with encoded URL when ENV.USE_MOCK is false', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(SAMPLE_ORDER)

    // Act
    const result = await ordersApi.getOrder('order-uuid-001')

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders/order-uuid-001')
    expect(result).toEqual(SAMPLE_ORDER)
  })

  it('should properly encode special characters in orderId', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(SAMPLE_ORDER)
    const specialId = 'order#123?test=1'

    // Act
    await ordersApi.getOrder(specialId)

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders/order%23123%3Ftest%3D1')
  })

  it('should throw error when http fails without fallback', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const error = new Error('Order not found')
    mockHttp.mockRejectedValue(error)

    // Act & Assert
    await expect(ordersApi.getOrder('nonexistent-id')).rejects.toThrow('Order not found')
  })

  it('should fall back to mock when http fails and fallback enabled', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = true
    const error = new Error('Network timeout')
    mockHttp.mockRejectedValue(error)
    mockMockApi.mockGetOrder.mockResolvedValue(SAMPLE_ORDER)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Act
    const result = await ordersApi.getOrder('order-uuid-001')

    // Assert
    expect(mockMockApi.mockGetOrder).toHaveBeenCalledWith('order-uuid-001')
    expect(result).toEqual(SAMPLE_ORDER)
    expect(warnSpy).toHaveBeenCalledWith('Falling back to mock getOrder:', error)

    warnSpy.mockRestore()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS: listOrders
// ════════════════════════════════════════════════════════════════════════════

describe('orders.listOrders()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use mock when ENV.USE_MOCK is true', async () => {
    // Arrange
    mockEnv.USE_MOCK = true
    const mockOrders = [SAMPLE_ORDER]
    mockMockApi.mockListOrders.mockResolvedValue(mockOrders)

    // Act
    const result = await ordersApi.listOrders({ status: ['PENDING'] })

    // Assert
    expect(mockMockApi.mockListOrders).toHaveBeenCalledWith({ status: ['PENDING'] })
    expect(result).toEqual(mockOrders)
    expect(mockHttp).not.toHaveBeenCalled()
  })

  it('should call http without query string when status is empty', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const mockOrders = [SAMPLE_ORDER]
    mockHttp.mockResolvedValue(mockOrders)

    // Act
    const result = await ordersApi.listOrders({ status: [] })

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders', { kitchenToken: undefined })
    expect(result).toEqual(mockOrders)
  })

  it('should call http with status query string when status provided', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const mockOrders = [SAMPLE_ORDER]
    mockHttp.mockResolvedValue(mockOrders)

    // Act
    const result = await ordersApi.listOrders({ status: ['PENDING', 'IN_PREPARATION'] })

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders?status=PENDING%2CIN_PREPARATION', {
      kitchenToken: undefined,
    })
    expect(result).toEqual(mockOrders)
  })

  it('should include kitchenToken in request when provided', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const mockOrders = [SAMPLE_ORDER]
    mockHttp.mockResolvedValue(mockOrders)

    // Act
    const result = await ordersApi.listOrders({ status: ['PENDING'] }, KITCHEN_TOKEN)

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders?status=PENDING', {
      kitchenToken: KITCHEN_TOKEN,
    })
    expect(result).toEqual(mockOrders)
  })

  it('should throw error when http fails without fallback', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const error = new Error('Server error')
    mockHttp.mockRejectedValue(error)

    // Act & Assert
    await expect(ordersApi.listOrders({ status: [] })).rejects.toThrow('Server error')
  })

  it('should fall back to mock when http fails and fallback enabled', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = true
    const error = new Error('Connection refused')
    mockHttp.mockRejectedValue(error)
    const mockOrders = [SAMPLE_ORDER]
    mockMockApi.mockListOrders.mockResolvedValue(mockOrders)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Act
    await ordersApi.listOrders({ status: ['PENDING'] })

    // Assert
    expect(mockMockApi.mockListOrders).toHaveBeenCalledWith({ status: ['PENDING'] })
    expect(warnSpy).toHaveBeenCalledWith('Falling back to mock listOrders:', error)

    warnSpy.mockRestore()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS: patchOrderStatus
// ════════════════════════════════════════════════════════════════════════════

describe('orders.patchOrderStatus()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use mock when ENV.USE_MOCK is true', async () => {
    // Arrange
    mockEnv.USE_MOCK = true
    const updatedOrder: Order = { ...SAMPLE_ORDER, status: 'IN_PREPARATION' }
    mockMockApi.mockPatchOrderStatus.mockResolvedValue(updatedOrder)

    // Act
    const result = await ordersApi.patchOrderStatus('order-uuid-001', 'IN_PREPARATION')

    // Assert
    expect(mockMockApi.mockPatchOrderStatus).toHaveBeenCalledWith(
      'order-uuid-001',
      'IN_PREPARATION',
    )
    expect(result).toEqual(updatedOrder)
    expect(mockHttp).not.toHaveBeenCalled()
  })

  it('should call http with PATCH method when ENV.USE_MOCK is false', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const updatedOrder: Order = { ...SAMPLE_ORDER, status: 'READY' }
    mockHttp.mockResolvedValue(updatedOrder)

    // Act
    const result = await ordersApi.patchOrderStatus('order-uuid-001', 'READY')

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders/order-uuid-001/status', {
      method: 'PATCH',
      json: { newStatus: 'READY', status: 'READY' },
      kitchenToken: undefined,
    })
    expect(result).toEqual(updatedOrder)
  })

  it('should include kitchenToken in PATCH request when provided', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const updatedOrder: Order = { ...SAMPLE_ORDER, status: 'IN_PREPARATION' }
    mockHttp.mockResolvedValue(updatedOrder)

    // Act
    const result = await ordersApi.patchOrderStatus(
      'order-uuid-001',
      'IN_PREPARATION',
      KITCHEN_TOKEN,
    )

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders/order-uuid-001/status', {
      method: 'PATCH',
      json: { newStatus: 'IN_PREPARATION', status: 'IN_PREPARATION' },
      kitchenToken: KITCHEN_TOKEN,
    })
    expect(result).toEqual(updatedOrder)
  })

  it('should properly encode orderId in URL', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(SAMPLE_ORDER)
    const specialId = 'order#456?test=1'

    // Act
    await ordersApi.patchOrderStatus(specialId, 'READY')

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders/order%23456%3Ftest%3D1/status', expect.any(Object))
  })

  it('should throw error when http fails without fallback', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const error = new Error('Unauthorized')
    mockHttp.mockRejectedValue(error)

    // Act & Assert
    await expect(ordersApi.patchOrderStatus('order-uuid-001', 'READY')).rejects.toThrow(
      'Unauthorized',
    )
  })

  it('should fall back to mock when http fails and fallback enabled', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = true
    const error = new Error('Server unavailable')
    mockHttp.mockRejectedValue(error)
    const updatedOrder: Order = { ...SAMPLE_ORDER, status: 'READY' }
    mockMockApi.mockPatchOrderStatus.mockResolvedValue(updatedOrder)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Act
    const result = await ordersApi.patchOrderStatus('order-uuid-001', 'READY')

    // Assert
    expect(mockMockApi.mockPatchOrderStatus).toHaveBeenCalledWith('order-uuid-001', 'READY')
    expect(result).toEqual(updatedOrder)
    expect(warnSpy).toHaveBeenCalledWith('Falling back to mock patchOrderStatus:', error)

    warnSpy.mockRestore()
  })

  it('should handle all possible order statuses', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const statuses = ['PENDING', 'IN_PREPARATION', 'READY'] as const

    for (const status of statuses) {
      mockHttp.mockResolvedValue({ ...SAMPLE_ORDER, status })

      // Act
      await ordersApi.patchOrderStatus('order-uuid-001', status)

      // Assert
      expect(mockHttp).toHaveBeenLastCalledWith(
        '/orders/order-uuid-001/status',
        expect.objectContaining({
          json: { newStatus: status, status },
        }),
      )
    }
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS: deleteOrder
// ════════════════════════════════════════════════════════════════════════════

describe('orders.deleteOrder()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use mock when ENV.USE_MOCK is true', async () => {
    // Arrange
    mockEnv.USE_MOCK = true
    mockMockApi.mockDeleteOrder.mockResolvedValue(undefined)

    // Act
      await ordersApi.deleteOrder('order-uuid-001')

    // Assert
    expect(mockMockApi.mockDeleteOrder).toHaveBeenCalledWith('order-uuid-001')
    expect(mockHttp).not.toHaveBeenCalled()
  })

  it('should call http with DELETE method when ENV.USE_MOCK is false', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(undefined)

    // Act
    const result = await ordersApi.deleteOrder('order-uuid-001')

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders/order-uuid-001', {
      method: 'DELETE',
      kitchenToken: undefined,
    })
    expect(result).toBeUndefined()
  })

  it('should include kitchenToken in DELETE request when provided', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(undefined)

    // Act
    await ordersApi.deleteOrder('order-uuid-001', KITCHEN_TOKEN)

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders/order-uuid-001', {
      method: 'DELETE',
      kitchenToken: KITCHEN_TOKEN,
    })
  })

  it('should properly encode orderId in URL', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(undefined)
    const specialId = 'order#789&key=value'

    // Act
    await ordersApi.deleteOrder(specialId)

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders/order%23789%26key%3Dvalue', expect.any(Object))
  })

  it('should throw error when http fails without fallback', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const error = new Error('Forbidden')
    mockHttp.mockRejectedValue(error)

    // Act & Assert
    await expect(ordersApi.deleteOrder('order-uuid-001')).rejects.toThrow('Forbidden')
  })

  it('should fall back to mock when http fails and fallback enabled', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = true
    const error = new Error('Service unavailable')
    mockHttp.mockRejectedValue(error)
    mockMockApi.mockDeleteOrder.mockResolvedValue(undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Act
    const result = await ordersApi.deleteOrder('order-uuid-001')

    // Assert
    expect(mockMockApi.mockDeleteOrder).toHaveBeenCalledWith('order-uuid-001')
    expect(result).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith('Falling back to mock deleteOrder:', error)

    warnSpy.mockRestore()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS: clearOrders
// ════════════════════════════════════════════════════════════════════════════

describe('orders.clearOrders()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use mock when ENV.USE_MOCK is true', async () => {
    // Arrange
    mockEnv.USE_MOCK = true
    mockMockApi.mockClearOrders.mockResolvedValue(undefined)

    // Act
      await ordersApi.clearOrders()

    // Assert
    expect(mockMockApi.mockClearOrders).toHaveBeenCalled()
    expect(mockHttp).not.toHaveBeenCalled()
  })

  it('should call http with DELETE method on /orders when ENV.USE_MOCK is false', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(undefined)

    // Act
    const result = await ordersApi.clearOrders()

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders', {
      method: 'DELETE',
      kitchenToken: undefined,
    })
    expect(result).toBeUndefined()
  })

  it('should include kitchenToken in DELETE request when provided', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(undefined)

    // Act
    await ordersApi.clearOrders(KITCHEN_TOKEN)

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders', {
      method: 'DELETE',
      kitchenToken: KITCHEN_TOKEN,
    })
  })

  it('should throw error when http fails without fallback', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const error = new Error('Permission denied')
    mockHttp.mockRejectedValue(error)

    // Act & Assert
    await expect(ordersApi.clearOrders()).rejects.toThrow('Permission denied')
  })

  it('should fall back to mock when http fails and fallback enabled', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = true
    const error = new Error('Backend unavailable')
    mockHttp.mockRejectedValue(error)
    mockMockApi.mockClearOrders.mockResolvedValue(undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Act
    const result = await ordersApi.clearOrders()

    // Assert
    expect(mockMockApi.mockClearOrders).toHaveBeenCalled()
    expect(result).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith('Falling back to mock clearOrders:', error)

    warnSpy.mockRestore()
  })

  it('should handle both with and without kitchenToken', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue(undefined)

    // Act - sin token
    await ordersApi.clearOrders()

    // Assert
    expect(mockHttp).toHaveBeenLastCalledWith('/orders', {
      method: 'DELETE',
      kitchenToken: undefined,
    })

    // Act - con token
    mockHttp.mockClear()
    await ordersApi.clearOrders(KITCHEN_TOKEN)

    // Assert
    expect(mockHttp).toHaveBeenCalledWith('/orders', {
      method: 'DELETE',
      kitchenToken: KITCHEN_TOKEN,
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TESTS DE INTEGRACIÓN: Comportamiento cross-cutting
// ════════════════════════════════════════════════════════════════════════════

describe('orders API - Integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should prioritize ENV.USE_MOCK over ALLOW_MOCK_FALLBACK', async () => {
    // Arrange
    mockEnv.USE_MOCK = true
    mockEnv.ALLOW_MOCK_FALLBACK = false // aunque sea false, USE_MOCK tiene prioridad
    mockMockApi.mockCreateOrder.mockResolvedValue(SAMPLE_ORDER_RESPONSE)

    // Act
    const result = await ordersApi.createOrder(SAMPLE_ORDER_REQUEST)

    // Assert
    expect(mockMockApi.mockCreateOrder).toHaveBeenCalled()
    expect(mockHttp).not.toHaveBeenCalled()
    expect(result).toEqual(SAMPLE_ORDER_RESPONSE)
  })

  it('should work correctly with all order statuses in list', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    const allStatuses = ['PENDING', 'IN_PREPARATION', 'READY'] as const
    const orders: Order[] = allStatuses.map((status, idx) => ({
      ...SAMPLE_ORDER,
      id: `order-${idx}`,
      status,
    }))
    mockHttp.mockResolvedValue(orders)

    // Act
    const result = await ordersApi.listOrders({ status: Array.from(allStatuses) })

    // Assert
    expect(result).toEqual(orders)
    expect(result).toHaveLength(3)
    expect(result.every((o) => allStatuses.includes(o.status))).toBe(true)
  })

  it('should maintain table ID and items consistency through create and patch cycles', async () => {
    // Arrange
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false

    mockHttp.mockResolvedValueOnce(SAMPLE_ORDER_RESPONSE) // createOrder response

    // Act
    const createResult = await ordersApi.createOrder(SAMPLE_ORDER_REQUEST)

    // Assert - verify create preserved tableId
    expect(createResult).toEqual(SAMPLE_ORDER_RESPONSE)
  })

  it('should handle consecutive operations with different configs', async () => {
    // Arrange
    mockEnv.USE_MOCK = true
    mockMockApi.mockListOrders.mockResolvedValue([SAMPLE_ORDER])

    // Act 1 - USE_MOCK=true
    const list1 = await ordersApi.listOrders({ status: ['PENDING'] })
    expect(list1).toEqual([SAMPLE_ORDER])
    expect(mockHttp).not.toHaveBeenCalled()

    // Change env
    mockEnv.USE_MOCK = false
    mockEnv.ALLOW_MOCK_FALLBACK = false
    mockHttp.mockResolvedValue([SAMPLE_ORDER])
    mockHttp.mockClear()

    // Act 2 - USE_MOCK=false
    const list2 = await ordersApi.listOrders({ status: ['PENDING'] })
    expect(list2).toEqual([SAMPLE_ORDER])
    expect(mockHttp).toHaveBeenCalled()
  })
})
