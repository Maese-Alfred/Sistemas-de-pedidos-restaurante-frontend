import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Order, OrderStatus } from '@/api/contracts'
import { ACTIVE_STATUSES } from '@/domain/orderStatus'
import { KitchenBoardFacade, KitchenUnauthorizedError } from '@/pages/kitchen/KitchenBoardFacade'

export function useKitchenBoardController(navigate: (to: string, options?: { replace?: boolean }) => void) {
  const facade = useMemo(() => new KitchenBoardFacade(navigate), [navigate])

  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>(ACTIVE_STATUSES)
  const [orders, setOrders] = useState<Order[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string>('')
  const [patching, setPatching] = useState(false)

  const inFlightRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const mountedRef = useRef(false)

  const loadOrders = useCallback(
    async ({ block }: { block: boolean }) => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      if (block) setInitialLoading(true)
      else setRefreshing(true)

      try {
        const data = await facade.loadOrders(statusFilter)
        if (!mountedRef.current) return
        setOrders(data)
        setError('')
      } catch (err) {
        if (err instanceof KitchenUnauthorizedError) return
        if (!mountedRef.current) return
        const msg = err instanceof Error ? err.message : 'No pudimos cargar pedidos'
        setError(msg)
      } finally {
        if (mountedRef.current) {
          inFlightRef.current = false
          if (block) setInitialLoading(false)
          else setRefreshing(false)
          timeoutRef.current = window.setTimeout(() => {
            if (mountedRef.current) loadOrders({ block: false })
          }, 3000)
        }
      }
    },
    [facade, statusFilter],
  )

  const changeOrderStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      try {
        setPatching(true)
        await facade.changeOrderStatus(orderId, nextStatus)
        const data = await facade.loadOrders(statusFilter)
        if (!mountedRef.current) return
        setOrders(data)
        setError('')
      } catch (err) {
        if (err instanceof KitchenUnauthorizedError) return
        throw err
      } finally {
        if (mountedRef.current) setPatching(false)
      }
    },
    [facade, statusFilter],
  )

  const logout = useCallback(() => {
    facade.logout()
  }, [facade])

  useEffect(() => {
    mountedRef.current = true
    loadOrders({ block: true })
    return () => {
      mountedRef.current = false
      inFlightRef.current = false
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [loadOrders])

  return {
    statusFilter,
    setStatusFilter,
    orders,
    initialLoading,
    refreshing,
    error,
    patching,
    loadOrders,
    changeOrderStatus,
    logout,
  }
}
