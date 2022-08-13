export type GeneratedItem<T, U> = {item: T, renderingObject: U}
export type GenerateItemFactory<T, U> = () => GeneratedItem<T, U>

export interface ItemGenerator<T, U> {
  readonly generated: Array<GeneratedItem<T, U>>
}
