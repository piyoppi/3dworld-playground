import { Camera } from './Camera.js'
import { Coordinate } from './Coordinate.js'
import { RGBColor } from './helpers/color.js'
import { Item } from './Item.js'
import { Scene } from './Scene.js'

export interface Renderer<T> {
  setRenderingLoop: (callable: () => void) => void,
  addItem: (item: Item, renderingObject: T) => void,
  setColor: (item: Item, color: RGBColor) => void,
  addLight: (coordinate: Coordinate) => void
  readonly camera: Camera
  render: () => void,
  mount: () => void,
  resize: (width: number, height: number) => void
}
