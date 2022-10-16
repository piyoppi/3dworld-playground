import { RGBColor } from './helpers/color.js'

export interface RenderingObjectBuilder<T> {
  makeVector: (norm: number, radius: number, shaftColor: RGBColor) => T
  makeBox: (width: number, height: number, depth: number, color: RGBColor) => T
  makeSphere: (radius: number, color: RGBColor) => T
  makePlane: (width: number, height: number, color: RGBColor) => T
  makeCircle: (radius: number, angle: number, color: RGBColor) => T
}
