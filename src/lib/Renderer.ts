import { Camera } from './Camera.js'
import { Coordinate } from './Coordinate.js'
import { RGBColor } from './helpers/color.js'

export interface Renderer<T> {
  initialize: (width: number, height: number) => void
  setRenderingLoop: (callable: () => void) => void,
  addItem: (coordinate: Coordinate, renderingObject: T) => void,
  removeItem: (coordinate: Coordinate) => void,
  setColor: (coordinate: Coordinate, color: RGBColor) => void,
  addLight: (coordinate: Coordinate) => void
  readonly camera: Camera
  render: () => void,
  mount: () => void,
  resize: (width: number, height: number) => void
}
