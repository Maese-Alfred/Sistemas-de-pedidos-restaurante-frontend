import type { OrderStatus } from '@/api/contracts'

export const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'IN_PREPARATION', 'READY']
export const OCCUPIED_TABLE_STATUSES: OrderStatus[] = ['PENDING', 'IN_PREPARATION']

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  IN_PREPARATION: 'En preparacion',
  READY: 'Listo',
}

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING: 'IN_PREPARATION',
  IN_PREPARATION: 'READY',
  READY: null,
}

export const PREVIOUS_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING: null,
  IN_PREPARATION: 'PENDING',
  READY: 'IN_PREPARATION',
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_STATUS[from] === to || PREVIOUS_STATUS[from] === to
}
