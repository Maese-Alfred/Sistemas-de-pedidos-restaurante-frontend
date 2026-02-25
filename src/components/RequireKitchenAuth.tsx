import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { getKitchenToken } from '@/store/kitchenAuth'

export function RequireKitchenAuth({ children }: { children: ReactElement }) {
  const token = getKitchenToken()
  if (!token) {
    return <Navigate to="/kitchen" replace />
  }
  return children
}
