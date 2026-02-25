const KEY = 'orders_mvp_kitchen_token_v1'

export function getKitchenToken(): string {
  try {
    return sessionStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function isKitchenAuthenticated(): boolean {
  return getKitchenToken().length > 0
}

export function setKitchenToken(token: string) {
  try {
    sessionStorage.setItem(KEY, token)
  } catch {
    // ignore
  }
}

export function issueKitchenToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `kitchen-${crypto.randomUUID()}`
  }
  return `kitchen-${Date.now()}`
}

export function clearKitchenToken() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
