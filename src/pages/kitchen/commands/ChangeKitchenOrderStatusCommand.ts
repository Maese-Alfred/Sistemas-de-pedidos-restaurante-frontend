import type { OrderStatus } from '@/api/contracts'
import { patchOrderStatus } from '@/api/orders'
import type { KitchenCommand } from '@/pages/kitchen/commands/KitchenCommand'

export class ChangeKitchenOrderStatusCommand implements KitchenCommand<void> {
  constructor(
    private readonly orderId: string,
    private readonly nextStatus: OrderStatus,
    private readonly kitchenToken: string,
  ) {}

  async execute(): Promise<void> {
    await patchOrderStatus(this.orderId, this.nextStatus, this.kitchenToken)
  }
}
