import { Camera } from './Camera.js'
import { Coordinate } from './Coordinate.js'
import { RGBColor } from './helpers/color.js'
import { RenderingObject } from './RenderingObject.js'

export interface Renderer<T extends RenderingObject<unknown>> {
  initialize: (width: number, height: number) => void
  setRenderingLoop: (callable: () => void) => void
  addItem: (coordinate: Coordinate, renderingObject: T) => void
  removeItem: (coordinate: Coordinate) => void
  setColor: (coordinate: Coordinate, color: RGBColor) => void
  addLight: (coordinate: Coordinate) => void
  renderingObjectFromCoordinate: (coordinate: Coordinate) => T | null
  readonly camera: Camera
  render: () => void
  mount: () => void
  resize: (width: number, height: number) => void
}
