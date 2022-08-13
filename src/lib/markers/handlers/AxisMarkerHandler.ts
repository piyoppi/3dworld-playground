import { Camera } from "../../Camera.js"
import { Item } from "../../Item.js"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { MouseDragHandler } from "../../mouse/MouseDragHandler.js"
import { MouseControllable } from "../../mouse/MouseControllable.js"
import { AlignmentAdapter } from "./AlignmentAdapter.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { NoneAlignment } from "./NoneAlignment.js"

export class AxisMarkerHandler implements MouseControllable {
  #manipulateItem: Item
  #mouseDragHandler
  #direction: VectorArray3
  #scale: number
  #camera: Camera
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter
  #alignment: AlignmentAdapter

  constructor(manipulateItem: Item, directionInLocal: VectorArray3, scale: number, camera: Camera) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#manipulateItem = manipulateItem
    this.#direction = directionInLocal
    this.#scale = scale
    this.#camera = camera
    this.#cursorDirectionConverter = new CursorDirectionScreenToWorldConverter()
    this.#alignment = new NoneAlignment()
  }

  get isStart() {
    return this.#mouseDragHandler.isStart
  }

  setAlignment(alignment: AlignmentAdapter) {
    this.#alignment = alignment
  }

  start(cursorX: number, cursorY: number) {
    if (this.#mouseDragHandler.isStart) return

    this.#alignment.reset(this.#manipulateItem.parentCoordinate.position)
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

    this.#alignment.add(addingVector)

    this.#manipulateItem.parentCoordinate.x = this.#alignment.alignedPosition[0]
    this.#manipulateItem.parentCoordinate.y = this.#alignment.alignedPosition[1]
    this.#manipulateItem.parentCoordinate.z = this.#alignment.alignedPosition[2]
  }

  end() {
    this.#mouseDragHandler.end()
  }
}
