export interface KitchenCommand<TResult> {
  execute(): Promise<TResult>
}
