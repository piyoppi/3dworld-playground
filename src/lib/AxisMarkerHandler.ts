import { Item } from "./Item.js"
import { Vec3, VectorArray3 } from "./Matrix.js"
import { MouseDraggable, MouseDragHandler } from "./MouseDragHandler.js"

export class AxisMarkerHandler implements MouseDraggable  {
  #axisItem: Item
  #mouseDragHandler
  #direction: VectorArray3
  #scale: number

  constructor(axisItem: Item, directionInLocal: VectorArray3, scale: number) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#axisItem = axisItem
    this.#direction = directionInLocal
    this.#scale = scale
  }

  start(cursorX: number, cursorY: number) {
    this.#mouseDragHandler.start(cursorX, cursorY)
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#mouseDragHandler.isStart) return

    const [dx, dy] = this.#mouseDragHandler.move(cursorX, cursorY)
    const len2 = Math.pow(dx, 2) + Math.pow(dy, 2)
    const scale = len2 * this.#scale
    const addingVector = Vec3.mulScale(this.#direction, scale)

    this.#axisItem.parentCoordinate.x = addingVector[0]
    this.#axisItem.parentCoordinate.y = addingVector[1]
    this.#axisItem.parentCoordinate.z = addingVector[2]
  }

  end() {
    this.#mouseDragHandler.end()
  }
}
