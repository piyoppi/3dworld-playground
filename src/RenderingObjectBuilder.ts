import { RGBColor } from './helpers/color.js'
import { Item } from './Item.js'

export interface RenderingObjectBuilder<T> {
  makeVectorRenderingObject: (norm: number, shaftColor: RGBColor) => T
}
