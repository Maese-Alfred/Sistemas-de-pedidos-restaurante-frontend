import { ENV } from '@/api/env'
import { getKitchenToken } from '@/store/kitchenAuth'

export class HttpError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export async function http<T>(
  path: string,
  init?: RequestInit & { json?: unknown; kitchenToken?: string; baseUrl?: string },
): Promise<T> {
  const baseUrl = init?.baseUrl ?? ENV.API_BASE_URL
  const url = `${baseUrl}${path}`
  const headers = new Headers(init?.headers ?? {})

  headers.set('Accept', 'application/json')

  if (init?.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const kitchenToken =
    init?.kitchenToken ?? getKitchenToken() ?? ENV.KITCHEN_FIXED_TOKEN ?? ''
  if (kitchenToken) {
    headers.set(ENV.KITCHEN_TOKEN_HEADER, kitchenToken)
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  let body: unknown = undefined
  if (isJson) {
    try {
      body = await res.json()
    } catch {
      body = undefined
    }
  } else {
    try {
      body = await res.text()
    } catch {
      body = undefined
    }
  }

  if (!res.ok) {
    const msg = `HTTP ${res.status} al llamar ${path}`
    throw new HttpError(msg, res.status, body)
  }

  return body as T
}
