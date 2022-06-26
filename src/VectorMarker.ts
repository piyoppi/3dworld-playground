import { Coordinate } from "./Coordinate.js"
import { Item } from "./Item.js"
import { makeItem } from "./ItemFactory.js"
import { VectorArray3 } from "./Matrix.js"
import { Mat4 } from './Matrix.js'

export function makeMarker(vector: VectorArray3, coordinate: Coordinate): Item {
  const item = makeItem()

  item.parentCoordinate.matrix = Mat4.mulAll([
    Mat4.rotateX(Math.PI / 2),
    coordinate.matrix,
  ])

  return item
}
