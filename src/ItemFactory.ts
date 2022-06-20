import { Item } from './Item.js'
import { Coordinate } from './Coordinate.js'

export const makeItem = () => {
  const coordinate = new Coordinate()
  const item = new Item()
  coordinate.addItem(item)

  return item
}
