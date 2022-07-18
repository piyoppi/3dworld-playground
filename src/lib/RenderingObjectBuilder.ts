import { RGBColor } from './helpers/color.js'
import { Item } from './Item.js'

export interface RenderingObjectBuilder<T> {
  makeVector: (norm: number, shaftColor: RGBColor) => T
  makeBox: (width: number, height: number, depth: number, color: RGBColor) => T
}
