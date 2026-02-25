import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { Order, Product } from '@/api/contracts'

type CartItem = {
  productId: number
  name: string
  quantity: number
  note?: string
}

type CartState = {
  tableId: number | null
  items: CartItem[]
  orderNote: string
}

type CartAction =
  | { type: 'SET_TABLE'; tableId: number }
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'SET_QTY'; productId: number; quantity: number }
  | { type: 'SET_ITEM_NOTE'; productId: number; note: string }
  | { type: 'SET_ORDER_NOTE'; note: string }
  | { type: 'CLEAR_CART' }

type AppContextValue = {
  tableNumber: number | null
  setTableNumber: (tableId: number) => void
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  updateCartItem: (productId: number, quantity: number, note?: string) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  orderNote: string
  setOrderNote: (note: string) => void
  kitchenDetailOrderId: string | null
  openKitchenOrderDetail: (order: Order | string) => void
  closeKitchenOrderDetail: () => void
}

const LS_KEY = 'orders_mvp_cart_v2'

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { tableId: null, items: [], orderNote: '' }
    const parsed = JSON.parse(raw) as CartState
    return {
      tableId: typeof parsed.tableId === 'number' ? parsed.tableId : null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      orderNote: typeof parsed.orderNote === 'string' ? parsed.orderNote : '',
    }
  } catch {
    return { tableId: null, items: [], orderNote: '' }
  }
}

function saveCart(state: CartState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_TABLE':
      return { ...state, tableId: action.tableId }

    case 'ADD_ITEM': {
      const qty = Math.max(1, action.quantity)
      const existing = state.items.find((item) => item.productId === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === action.product.id ? { ...item, quantity: item.quantity + qty } : item,
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
      return { ...state, items: state.items.filter((item) => item.productId !== action.productId) }

    case 'SET_QTY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.productId !== action.productId) }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.productId ? { ...item, quantity: action.quantity } : item,
        ),
      }
    }

    case 'SET_ITEM_NOTE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.productId ? { ...item, note: action.note } : item,
        ),
      }

    case 'SET_ORDER_NOTE':
      return { ...state, orderNote: action.note }

    case 'CLEAR_CART':
      return { tableId: state.tableId, items: [], orderNote: '' }

    default:
      return state
  }
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartState, dispatch] = useReducer(cartReducer, undefined, loadCart)
  const [kitchenDetailOrderId, setKitchenDetailOrderId] = useState<string | null>(null)

  useEffect(() => {
    saveCart(cartState)
  }, [cartState])

  const value = useMemo<AppContextValue>(
    () => ({
      tableNumber: cartState.tableId,
      setTableNumber: (tableId: number) => dispatch({ type: 'SET_TABLE', tableId }),
      cart: cartState.items,
      addToCart: (product: Product, quantity = 1) => dispatch({ type: 'ADD_ITEM', product, quantity }),
      updateCartItem: (productId: number, quantity: number, note?: string) => {
        dispatch({ type: 'SET_QTY', productId, quantity })
        if (typeof note === 'string') dispatch({ type: 'SET_ITEM_NOTE', productId, note })
      },
      removeFromCart: (productId: number) => dispatch({ type: 'REMOVE_ITEM', productId }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      orderNote: cartState.orderNote,
      setOrderNote: (note: string) => dispatch({ type: 'SET_ORDER_NOTE', note }),
      kitchenDetailOrderId,
      openKitchenOrderDetail: (order: Order | string) =>
        setKitchenDetailOrderId(typeof order === 'string' ? order : order.id),
      closeKitchenOrderDetail: () => setKitchenDetailOrderId(null),
    }),
    [cartState, kitchenDetailOrderId],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}

