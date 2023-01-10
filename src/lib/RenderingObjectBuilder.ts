import { RGBColor } from './helpers/color.js'
import { VectorArray3 } from './Matrix.js'

export interface RenderingObjectBuilder<T> {
  makeVector: (norm: number, radius: number, shaftColor: RGBColor) => T
  makeBox: (width: number, height: number, depth: number, color: RGBColor) => T
  makeSphere: (radius: number, color: RGBColor) => T
  makePlane: (width: number, height: number, color: RGBColor) => T
  makeCircle: (radius: number, angle: number, angleOffset: number, color: RGBColor) => T
  makeAnnulus: (innerRadius: number, outerRadius: number, color: RGBColor) => T
  makePolygones: (points: VectorArray3[], color: RGBColor) => T
}
