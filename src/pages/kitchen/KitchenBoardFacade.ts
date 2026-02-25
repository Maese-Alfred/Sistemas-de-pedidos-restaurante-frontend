import type { Order, OrderStatus } from '@/api/contracts'
import { HttpError } from '@/api/http'
import { ChangeKitchenOrderStatusCommand } from '@/pages/kitchen/commands/ChangeKitchenOrderStatusCommand'
import { LoadKitchenOrdersCommand } from '@/pages/kitchen/commands/LoadKitchenOrdersCommand'
import { clearKitchenToken, getKitchenToken } from '@/store/kitchenAuth'

type NavigateFn = (to: string, options?: { replace?: boolean }) => void

export class KitchenUnauthorizedError extends Error {
  constructor() {
    super('Kitchen session is not authorized')
  }
}

export class KitchenBoardFacade {
  constructor(private readonly navigate: NavigateFn) {}

  async loadOrders(statusFilter: OrderStatus[]): Promise<Order[]> {
    const kitchenToken = this.requireKitchenToken()
    const command = new LoadKitchenOrdersCommand(statusFilter, kitchenToken)
    return this.executeWithKitchenAuth(command.execute.bind(command))
  }

  async changeOrderStatus(orderId: string, nextStatus: OrderStatus): Promise<void> {
    const kitchenToken = this.requireKitchenToken()
    const command = new ChangeKitchenOrderStatusCommand(orderId, nextStatus, kitchenToken)
    await this.executeWithKitchenAuth(command.execute.bind(command))
  }

  logout(): void {
    clearKitchenToken()
    this.navigate('/kitchen', { replace: true })
  }

  private requireKitchenToken(): string {
    const kitchenToken = getKitchenToken()
    if (!kitchenToken) {
      this.navigate('/kitchen', { replace: true })
      throw new KitchenUnauthorizedError()
    }
    return kitchenToken
  }

  private async executeWithKitchenAuth<TResult>(action: () => Promise<TResult>): Promise<TResult> {
    try {
      return await action()
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        this.logout()
        throw new KitchenUnauthorizedError()
      }
      throw err
    }
  }
}
