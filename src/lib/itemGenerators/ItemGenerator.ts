import { RenderingObject } from "../RenderingObject"

export type GeneratedItem<T, U extends RenderingObject<U>> = {item: T, renderingObject: U}
export type GenerateItemFactory<T, U extends RenderingObject<U>> = () => GeneratedItem<T, U>

export interface ItemGenerator<T, U extends RenderingObject<U>> {
  readonly generated: Array<GeneratedItem<T, U>>
}
