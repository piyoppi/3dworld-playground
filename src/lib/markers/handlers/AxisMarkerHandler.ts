import { Camera } from "../../Camera.js"
import { Item } from "../../Item.js"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { MouseControllable, MouseDragHandler } from "../../mouse/MouseDragHandler.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"

export class AxisMarkerHandler implements MouseControllable {
  #manipulateItem: Item
  #mouseDragHandler
  #direction: VectorArray3
  #scale: number
  #camera: Camera
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter

  constructor(manipulateItem: Item, directionInLocal: VectorArray3, scale: number, camera: Camera) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#manipulateItem = manipulateItem
    this.#direction = directionInLocal
    this.#scale = scale
    this.#camera = camera
    this.#cursorDirectionConverter = new CursorDirectionScreenToWorldConverter()
  }

  get isStart() {
    return this.#mouseDragHandler.isStart
  }

  start(cursorX: number, cursorY: number) {
    if (this.#mouseDragHandler.isStart) return

    this.#mouseDragHandler.start(cursorX, cursorY)
    this.#cursorDirectionConverter.calcTransformMatrix(this.#manipulateItem.parentCoordinate, this.#camera.coordinate)
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#mouseDragHandler.isStart) return

    const mouseDelta = this.#mouseDragHandler.move(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = this.#cursorDirectionConverter.convert(mouseDelta)
    const len = Vec3.dotprod(mouseDeltaInItemCoordinate, this.#direction)
    const scale = len * this.#scale
    const addingVector = Vec3.mulScale(this.#direction, scale)

    this.#manipulateItem.parentCoordinate.x += addingVector[0]
    this.#manipulateItem.parentCoordinate.y += addingVector[1]
    this.#manipulateItem.parentCoordinate.z += addingVector[2]
  }

  end() {
    this.#mouseDragHandler.end()
  }
}
