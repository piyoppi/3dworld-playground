import { RGBColor } from './helpers/color.js'
import { RenderingObject } from './RenderingObject.js'

export interface RenderingObjectBuilder<T extends RenderingObject<unknown>> {
  makeVector: (norm: number, radius: number, shaftColor: RGBColor) => T
  makeBox: (width: number, height: number, depth: number, color: RGBColor) => T
  makeSphere: (radius: number, color: RGBColor) => T
  makePlane: (width: number, height: number, color: RGBColor) => T
  makeCircle: (radius: number, angle: number, color: RGBColor) => T
}
