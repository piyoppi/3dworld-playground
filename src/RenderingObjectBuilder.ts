import { Item } from './Item.js'

export interface RenderingObjectBuilder<T> {
  makeVectorRenderingObject: (norm: number, baseItem: Item) => T
}
