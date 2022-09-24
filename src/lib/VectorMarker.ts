import { Coordinate } from "./Coordinate.js"
import { makeItem } from "./ItemFactory.js"
import { VectorArray3 } from "./Matrix.js"
import { Mat4 } from './Matrix.js'
import { Item } from './Item.js'

export function makeMarker(position: VectorArray3, direction: VectorArray3): Item {
  const item = makeItem()

  item.parentCoordinate.setDirectionYAxis(direction, position)

  return item
}
