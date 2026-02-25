import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { Product } from '@/api/contracts'

export type CartItem = {
  productId: number
  name: string
  quantity: number
  note?: string
}

type State = {
  tableId: number | null
  items: CartItem[]
  orderNote: string
}

type Action =
  | { type: 'SET_TABLE'; tableId: number }
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'SET_QTY'; productId: number; quantity: number }
  | { type: 'SET_ITEM_NOTE'; productId: number; note: string }
  | { type: 'SET_ORDER_NOTE'; note: string }
  | { type: 'CLEAR' }

const LS_KEY = 'orders_mvp_cart_v2'

function load(): State {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { tableId: null, items: [], orderNote: '' }
    const parsed = JSON.parse(raw) as State
    return {
      tableId: typeof parsed.tableId === 'number' ? parsed.tableId : null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      orderNote: typeof parsed.orderNote === 'string' ? parsed.orderNote : '',
    }
  } catch {
    return { tableId: null, items: [], orderNote: '' }
  }
}

function save(state: State) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TABLE':
      return { ...state, tableId: action.tableId }
    case 'ADD_ITEM': {
      const qty = Math.max(1, action.quantity)
      const existing = state.items.find((i) => i.productId === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.product.id ? { ...i, quantity: i.quantity + qty } : i,
          ),
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          { productId: action.product.id, name: action.product.name, quantity: qty },
        ],
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) }
    case 'SET_QTY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.productId !== action.productId) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, quantity: action.quantity } : i,
        ),
      }
    }
    case 'SET_ITEM_NOTE':
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, note: action.note } : i,
        ),
      }
    case 'SET_ORDER_NOTE':
      return { ...state, orderNote: action.note }
    case 'CLEAR':
      return { tableId: state.tableId, items: [], orderNote: '' }
    default:
      return state
  }
}

const CartCtx = createContext<{
  state: State
  actions: {
    setTable: (tableId: number) => void
    addItem: (product: Product, quantity?: number) => void
    removeItem: (productId: number) => void
    setQty: (productId: number, quantity: number) => void
    setItemNote: (productId: number, note: string) => void
    setOrderNote: (note: string) => void
    clear: () => void
  }
} | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => save(state), [state])

  const value = useMemo(
    () => ({
      state,
      actions: {
        setTable: (tableId: number) => dispatch({ type: 'SET_TABLE', tableId }),
        addItem: (product: Product, quantity = 1) => dispatch({ type: 'ADD_ITEM', product, quantity }),
        removeItem: (productId: number) => dispatch({ type: 'REMOVE_ITEM', productId }),
        setQty: (productId: number, quantity: number) =>
          dispatch({ type: 'SET_QTY', productId, quantity }),
        setItemNote: (productId: number, note: string) =>
          dispatch({ type: 'SET_ITEM_NOTE', productId, note }),
        setOrderNote: (note: string) => dispatch({ type: 'SET_ORDER_NOTE', note }),
        clear: () => dispatch({ type: 'CLEAR' }),
      },
    }),
    [state],
  )

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}

export function cartTotals(items: CartItem[]) {
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const distinct = items.length
  const withNotes = items.filter((i) => i.note && i.note.trim().length > 0).length
  return { totalItems, distinct, withNotes }
}
