import type { Order, OrderStatus } from '@/api/contracts'
import { listOrders } from '@/api/orders'
import type { KitchenCommand } from '@/pages/kitchen/commands/KitchenCommand'

export class LoadKitchenOrdersCommand implements KitchenCommand<Order[]> {
  constructor(
    private readonly statusFilter: OrderStatus[],
    private readonly kitchenToken: string,
  ) {}

  execute(): Promise<Order[]> {
    return listOrders({ status: this.statusFilter }, this.kitchenToken)
  }
}
