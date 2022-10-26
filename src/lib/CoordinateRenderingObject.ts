import type { RenderingObjectBuilder } from './RenderingObjectBuilder'
import type { Renderer } from "./Renderer"
import { Vec3, VectorArray3 } from "./Matrix.js"
import { RenderingObject } from "./RenderingObject.js"
import { Coordinate } from './Coordinate.js'

export const attachCoordinateRenderingItem = <T extends RenderingObject<unknown>>(coordinate: Coordinate, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) => {
  const norm = 0.5
  const radius = 0.1;

  [
    {direction: [1, 0, 0] as VectorArray3, color: {r: 255, g: 0, b: 0}},
    {direction: [0, 1, 0] as VectorArray3, color: {r: 0, g: 255, b: 0}},
    {direction: [0, 0, 1] as VectorArray3, color: {r: 0, g: 0, b: 255}}
  ].forEach(params => {
    const coord = new Coordinate()
    coordinate.addChild(coord)

    const {direction, color} = params
    coord.setDirectionYAxis(direction, Vec3.mulScale(direction, norm / 2))
    renderer.addItem(coord, builder.makeVector(norm, radius, color))
  })
}
