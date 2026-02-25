import type { OrderItem, Product } from '@/api/contracts'

export function buildProductNameMap(products: Product[] | undefined): Map<number, string> {
  const map = new Map<number, string>()
  for (const product of products ?? []) {
    if (product.name) map.set(product.id, product.name)
  }
  return map
}

export function resolveOrderItemName(item: OrderItem, productNames: Map<number, string>): string {
  const explicitName = item.name?.trim()
  if (explicitName) return explicitName
  return productNames.get(item.productId) ?? `Producto ${item.productId}`
}

