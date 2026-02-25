function required(name: string, fallback?: string): string {
  const v = import.meta.env[name] as string | undefined
  if (v && v.trim().length > 0) return v
  if (fallback) return fallback
  return ''
}

function flag(name: string, fallback = false): boolean {
  const v = import.meta.env[name] as string | undefined
  if (!v) return fallback
  return v.trim().toLowerCase() === 'true'
}

export const ENV = {
  API_BASE_URL: required('VITE_API_BASE_URL', 'http://localhost:8080'),
  REPORT_API_BASE_URL: required('VITE_REPORT_API_BASE_URL', 'http://localhost:8082'),
  USE_MOCK: flag('VITE_USE_MOCK', false),
  ALLOW_MOCK_FALLBACK: flag('VITE_ALLOW_MOCK_FALLBACK', false),
  KITCHEN_TOKEN_HEADER: required('VITE_KITCHEN_TOKEN_HEADER', 'X-Kitchen-Token'),
  KITCHEN_PIN: required('VITE_KITCHEN_PIN', 'cocina123'),
  KITCHEN_FIXED_TOKEN: (import.meta.env.VITE_KITCHEN_FIXED_TOKEN as string | undefined) ?? '',
} as const
