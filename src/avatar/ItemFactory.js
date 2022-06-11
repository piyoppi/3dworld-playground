import { RenderingObject } from './RenderingObject.js'
import { ThreeCoordinate, Item } from './Item.js'

export const makeItem = (renderingObject) => {
  const coordinate = new ThreeCoordinate()
  const item = new Item()
  item.renderingObject = renderingObject
  coordinate.addItem(item)

  return item
}
