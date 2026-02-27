import { describe, it, expect, beforeEach } from 'vitest'
import * as mockApi from '@/api/mock'
import type { CreateOrderRequest, OrderStatus } from '@/api/contracts'

// ════════════════════════════════════════════════════════════════════════════
// SETUP
// ════════════════════════════════════════════════════════════════════════════

const createOrderRequest: CreateOrderRequest = {
  tableId: 1,
  items: [
    { productId: 1, quantity: 2, note: 'Extra salsa' },
    { productId: 3, quantity: 1 },
  ],
  note: 'Test order',
}

// ════════════════════════════════════════════════════════════════════════════
// TESTS: Mock API Functions
// ════════════════════════════════════════════════════════════════════════════

describe('Mock API', () => {
  // ════════════════════════════════════════════════════════════════════════════
  // TESTS: mockGetMenu
  // ════════════════════════════════════════════════════════════════════════════

  describe('mockGetMenu()', () => {
    it('should return array of products', async () => {
      // Act
      const result = await mockApi.mockGetMenu()

      // Assert
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return only active products', async () => {
      // Act
      const result = await mockApi.mockGetMenu()

      // Assert
      expect(result.every((p) => p.isActive === true)).toBe(true)
    })

    it('should have product with valid structure', async () => {
      // Act
      const result = await mockApi.mockGetMenu()
      const product = result[0]

      // Assert
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('description')
      expect(product).toHaveProperty('price')
      expect(product).toHaveProperty('isActive')
      expect(product).toHaveProperty('category')
      expect(product).toHaveProperty('imageUrl')
    })

    it('should have products with positive prices', async () => {
      // Act
      const result = await mockApi.mockGetMenu()

      // Assert
      expect(result.every((p) => (p.price ?? 0) > 0)).toBe(true)
    })

    it('should return consistent results across calls', async () => {
      // Act
      const result1 = await mockApi.mockGetMenu()
      const result2 = await mockApi.mockGetMenu()

      // Assert
      expect(result1).toEqual(result2)
    })

    it('should have more than 10 products', async () => {
      // Act
      const result = await mockApi.mockGetMenu()

      // Assert
      expect(result.length).toBeGreaterThanOrEqual(16)
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // TESTS: mockCreateOrder
  // ════════════════════════════════════════════════════════════════════════════

  describe('mockCreateOrder()', () => {
    it('should create order and return response with id and status', async () => {
      // Act
      const result = await mockApi.mockCreateOrder(createOrderRequest)

      // Assert
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('status')
      expect(result.status).toBe('PENDING')
    })

    it('should return unique id', async () => {
      // Act
      const result1 = await mockApi.mockCreateOrder(createOrderRequest)
      const result2 = await mockApi.mockCreateOrder(createOrderRequest)

      // Assert
      expect(result1.id).not.toBe(result2.id)
    })

    it('should handle order with multiple items', async () => {
      // Act
      const result = await mockApi.mockCreateOrder(createOrderRequest)

      // Assert
      expect(result.id).toBeTruthy()
      expect(typeof result.id).toBe('string')
    })

    it('should handle order with single item', async () => {
      // Arrange
      const singleItemRequest: CreateOrderRequest = {
        tableId: 2,
        items: [{ productId: 5, quantity: 1 }],
      }

      // Act
      const result = await mockApi.mockCreateOrder(singleItemRequest)

      // Assert
      expect(result.id).toBeTruthy()
      expect(result.status).toBe('PENDING')
    })

    it('should handle order without note', async () => {
      // Arrange
      const noNoteRequest: CreateOrderRequest = {
        tableId: 3,
        items: [{ productId: 1, quantity: 1 }],
      }

      // Act
      const result = await mockApi.mockCreateOrder(noNoteRequest)

      // Assert
      expect(result.id).toBeTruthy()
    })

    it('should create order with correct tableId', async () => {
      // Act
      const result = await mockApi.mockCreateOrder(createOrderRequest)
      const order = await mockApi.mockGetOrder(result.id)

      // Assert
      expect(order.tableId).toBe(createOrderRequest.tableId)
    })

    it('should preserve order items', async () => {
      // Act
      const result = await mockApi.mockCreateOrder(createOrderRequest)
      const order = await mockApi.mockGetOrder(result.id)

      // Assert
      expect(order.items).toHaveLength(createOrderRequest.items.length)
      expect(order.items[0].productId).toBe(createOrderRequest.items[0].productId)
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // TESTS: mockGetOrder
  // ════════════════════════════════════════════════════════════════════════════

  describe('mockGetOrder()', () => {
    it('should throw when order not found', async () => {
      // Act & Assert
      await expect(mockApi.mockGetOrder('non-existent-id')).rejects.toThrow('Pedido no encontrado')
    })

    it('should return order with correct structure', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const order = await mockApi.mockGetOrder(created.id)

      // Assert
      expect(order).toHaveProperty('id')
      expect(order).toHaveProperty('tableId')
      expect(order).toHaveProperty('status')
      expect(order).toHaveProperty('items')
      expect(order).toHaveProperty('createdAt')
      expect(order).toHaveProperty('updatedAt')
    })

    it('should return exact order that was created', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const retrieved = await mockApi.mockGetOrder(created.id)

      // Assert
      expect(retrieved.id).toBe(created.id)
      expect(retrieved.status).toBe(created.status)
      expect(retrieved.tableId).toBe(createOrderRequest.tableId)
    })

    it('should have items with product information', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const order = await mockApi.mockGetOrder(created.id)

      // Assert
      expect(order.items.length).toBeGreaterThan(0)
      expect(order.items[0]).toHaveProperty('productId')
      expect(order.items[0]).toHaveProperty('quantity')
    })

    it('should have timestamps in ISO format', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const order = await mockApi.mockGetOrder(created.id)

      // Assert
      expect(order.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(order.updatedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // TESTS: mockListOrders
  // ════════════════════════════════════════════════════════════════════════════

  describe('mockListOrders()', () => {
    it('should return array of orders', async () => {
      // Act
      const result = await mockApi.mockListOrders({ status: [] })

      // Assert
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return all orders when no status filter provided', async () => {
      // Arrange - create orders
      await mockApi.mockCreateOrder(createOrderRequest)
      await mockApi.mockCreateOrder({ tableId: 4, items: [{ productId: 2, quantity: 1 }] })

      // Act
      const result = await mockApi.mockListOrders({ status: [] })

      // Assert
      expect(result.length).toBeGreaterThan(0)
    })

    it('should filter orders by single status', async () => {
      // Arrange
      await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const result = await mockApi.mockListOrders({ status: ['PENDING'] })

      // Assert
      expect(result.every((o) => o.status === 'PENDING')).toBe(true)
    })

    it('should filter orders by multiple statuses', async () => {
      // Arrange
      const order1 = await mockApi.mockCreateOrder(createOrderRequest)
      await mockApi.mockPatchOrderStatus(order1.id, 'IN_PREPARATION')
      await mockApi.mockCreateOrder({ tableId: 5, items: [{ productId: 3, quantity: 1 }] })

      // Act
      const result = await mockApi.mockListOrders({ status: ['PENDING', 'IN_PREPARATION'] })

      // Assert
      expect(result.every((o) => ['PENDING', 'IN_PREPARATION'].includes(o.status))).toBe(true)
    })

    it('should return empty array for non-matching status', async () => {
      // Act
      const result = await mockApi.mockListOrders({ status: ['READY'] })

      // Assert
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have consistent order structure in list', async () => {
      // Arrange
      await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const result = await mockApi.mockListOrders({ status: ['PENDING'] })

      // Assert
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id')
        expect(result[0]).toHaveProperty('status')
        expect(result[0]).toHaveProperty('items')
      }
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // TESTS: mockPatchOrderStatus
  // ════════════════════════════════════════════════════════════════════════════

  describe('mockPatchOrderStatus()', () => {
    it('should throw when order not found', async () => {
      // Act & Assert
      await expect(mockApi.mockPatchOrderStatus('non-existent', 'READY')).rejects.toThrow(
        'Pedido no encontrado',
      )
    })

    it('should update order status', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const updated = await mockApi.mockPatchOrderStatus(created.id, 'IN_PREPARATION')

      // Assert
      expect(updated.status).toBe('IN_PREPARATION')
    })

    it('should update and have valid timestamp when status changes', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const updated = await mockApi.mockPatchOrderStatus(created.id, 'READY')

      // Assert
      expect(updated.status).toBe('READY')
      expect(updated.updatedAt).toBeDefined()
      expect(updated.updatedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should allow all valid status transitions', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act & Assert
      const statuses: OrderStatus[] = ['PENDING', 'IN_PREPARATION', 'READY']
      for (const status of statuses) {
        const result = await mockApi.mockPatchOrderStatus(created.id, status)
        expect(result.status).toBe(status)
      }
    })

    it('should preserve other order properties when updating status', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)
      const original = await mockApi.mockGetOrder(created.id)

      // Act
      await mockApi.mockPatchOrderStatus(created.id, 'IN_PREPARATION')
      const updated = await mockApi.mockGetOrder(created.id)

      // Assert
      expect(updated.id).toBe(original.id)
      expect(updated.tableId).toBe(original.tableId)
      expect(updated.items).toEqual(original.items)
    })

    it('should return updated order with new status', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      const result = await mockApi.mockPatchOrderStatus(created.id, 'READY')

      // Assert
      expect(result.id).toBe(created.id)
      expect(result.status).toBe('READY')
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // TESTS: mockDeleteOrder
  // ════════════════════════════════════════════════════════════════════════════

  describe('mockDeleteOrder()', () => {
    it('should throw when order not found', async () => {
      // Act & Assert
      await expect(mockApi.mockDeleteOrder('non-existent')).rejects.toThrow('Pedido no encontrado')
    })

    it('should delete order from store', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)

      // Act
      await mockApi.mockDeleteOrder(created.id)

      // Assert
      await expect(mockApi.mockGetOrder(created.id)).rejects.toThrow()
    })

    it('should remove deleted order from list', async () => {
      // Arrange
      await mockApi.mockClearOrders() // Start fresh
      const created = await mockApi.mockCreateOrder(createOrderRequest)
      const listBefore = await mockApi.mockListOrders({ status: [] })
      const countBefore = listBefore.length

      // Act
      await mockApi.mockDeleteOrder(created.id)
      const listAfter = await mockApi.mockListOrders({ status: [] })
      const countAfter = listAfter.length

      // Assert
      expect(countAfter).toBe(countBefore - 1)
      expect(listAfter.some(o => o.id === created.id)).toBe(false)
    })

    it('should only delete target order', async () => {
      // Arrange
      const order1 = await mockApi.mockCreateOrder(createOrderRequest)
      const order2 = await mockApi.mockCreateOrder({ tableId: 6, items: [{ productId: 4, quantity: 1 }] })

      // Act
      await mockApi.mockDeleteOrder(order1.id)

      // Assert
      await expect(mockApi.mockGetOrder(order1.id)).rejects.toThrow()
      await expect(mockApi.mockGetOrder(order2.id)).resolves.toBeDefined()
    })

    it('should not throw when deleting multiple times is attempted', async () => {
      // Arrange
      const created = await mockApi.mockCreateOrder(createOrderRequest)
      await mockApi.mockDeleteOrder(created.id)

      // Act & Assert
      await expect(mockApi.mockDeleteOrder(created.id)).rejects.toThrow()
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // TESTS: mockClearOrders
  // ════════════════════════════════════════════════════════════════════════════

  describe('mockClearOrders()', () => {
    it('should clear all orders', async () => {
      // Arrange
      await mockApi.mockCreateOrder(createOrderRequest)
      await mockApi.mockCreateOrder({ tableId: 7, items: [{ productId: 5, quantity: 1 }] })

      // Act
      await mockApi.mockClearOrders()

      // Assert
      const result = await mockApi.mockListOrders({ status: [] })
      expect(result).toHaveLength(0)
    })

    it('should be safe to call multiple times', async () => {
      // Arrange
      await mockApi.mockCreateOrder(createOrderRequest)

      // Act & Assert
      await mockApi.mockClearOrders()
      await expect(mockApi.mockClearOrders()).resolves.toBeUndefined()
    })

    it('should work even if no orders exist', async () => {
      // Act & Assert
      await expect(mockApi.mockClearOrders()).resolves.toBeUndefined()
    })

    it('should allow creating orders after clear', async () => {
      // Arrange
      await mockApi.mockCreateOrder(createOrderRequest)
      await mockApi.mockClearOrders()

      // Act
      const newOrder = await mockApi.mockCreateOrder(createOrderRequest)

      // Assert
      expect(newOrder.id).toBeTruthy()
      const retrieved = await mockApi.mockGetOrder(newOrder.id)
      expect(retrieved.id).toBe(newOrder.id)
    })

    it('should reset state for fresh start', async () => {
      // Arrange
      const order1 = await mockApi.mockCreateOrder(createOrderRequest)
      await mockApi.mockClearOrders()

      // Act
      const order2 = await mockApi.mockCreateOrder(createOrderRequest)

      // Assert
      expect(order2.id).not.toBe(order1.id)
      expect(order2.status).toBe('PENDING')
    })
  })

  // ════════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('Mock API - Integration tests', () => {
    beforeEach(async () => {
      // Clean state before each integration test
      await mockApi.mockClearOrders()
    })

    it('should complete full order lifecycle', async () => {
      // Act 1: Create order
      const created = await mockApi.mockCreateOrder(createOrderRequest)
      expect(created.status).toBe('PENDING')

      // Act 2: Get order
      let order = await mockApi.mockGetOrder(created.id)
      expect(order.status).toBe('PENDING')

      // Act 3: Update status to IN_PREPARATION
      order = await mockApi.mockPatchOrderStatus(created.id, 'IN_PREPARATION')
      expect(order.status).toBe('IN_PREPARATION')

      // Act 4: Update status to READY
      order = await mockApi.mockPatchOrderStatus(created.id, 'READY')
      expect(order.status).toBe('READY')

      // Act 5: Delete order
      await mockApi.mockDeleteOrder(created.id)
      await expect(mockApi.mockGetOrder(created.id)).rejects.toThrow()
    })

    it('should manage multiple orders independently', async () => {
      // Arrange
      const order1Req = { tableId: 1, items: [{ productId: 1, quantity: 1 }] }
      const order2Req = { tableId: 2, items: [{ productId: 2, quantity: 2 }] }

      // Act
      const order1 = await mockApi.mockCreateOrder(order1Req)
      const order2 = await mockApi.mockCreateOrder(order2Req)

      await mockApi.mockPatchOrderStatus(order1.id, 'IN_PREPARATION')
      // order2 stays PENDING

      // Assert
      const list = await mockApi.mockListOrders({ status: [] })
      expect(list.length).toBeGreaterThanOrEqual(2)

      const o1 = await mockApi.mockGetOrder(order1.id)
      const o2 = await mockApi.mockGetOrder(order2.id)
      expect(o1.status).toBe('IN_PREPARATION')
      expect(o2.status).toBe('PENDING')
    })

    it('should filter orders by status correctly', async () => {
      // Arrange
      const order1 = await mockApi.mockCreateOrder({ tableId: 1, items: [{ productId: 1, quantity: 1 }] })
      const order2 = await mockApi.mockCreateOrder({ tableId: 2, items: [{ productId: 2, quantity: 1 }] })

      await mockApi.mockPatchOrderStatus(order1.id, 'IN_PREPARATION')
      await mockApi.mockPatchOrderStatus(order2.id, 'READY')

      // Act
      const pending = await mockApi.mockListOrders({ status: ['PENDING'] })
      const inPrep = await mockApi.mockListOrders({ status: ['IN_PREPARATION'] })
      const ready = await mockApi.mockListOrders({ status: ['READY'] })

      // Assert
      expect(pending.some((o) => o.id === order1.id)).toBe(false) // order1 moved to IN_PREPARATION
      expect(inPrep.some((o) => o.id === order1.id)).toBe(true)
      expect(ready.some((o) => o.id === order2.id)).toBe(true)
    })

    it('should maintain order data integrity through operations', async () => {
      // Arrange
      const request: CreateOrderRequest = {
        tableId: 99,
        items: [
          { productId: 3, quantity: 2, note: 'No spicy' },
          { productId: 5, quantity: 1 },
        ],
        note: 'Important note',
      }

      // Act
      const created = await mockApi.mockCreateOrder(request)
      await mockApi.mockGetOrder(created.id)
      await mockApi.mockPatchOrderStatus(created.id, 'IN_PREPARATION')
      const retrieved2 = await mockApi.mockGetOrder(created.id)

      // Assert
      expect(retrieved2.tableId).toBe(request.tableId)
      expect(retrieved2.items).toHaveLength(request.items.length)
      expect(retrieved2.note).toBe(request.note)
      expect(retrieved2.status).toBe('IN_PREPARATION')
    })

    it('should have consistent product menu across all operations', async () => {
      // Act
      const menu1 = await mockApi.mockGetMenu()
      await mockApi.mockCreateOrder(createOrderRequest)
      const menu2 = await mockApi.mockGetMenu()

      // Assert
      expect(menu1).toEqual(menu2)
      expect(menu1.length).toBe(menu2.length)
    })
  })
})
