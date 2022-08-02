import { Camera } from "../../Camera.js"
import { Item } from "../../Item.js"
import { MouseControllable, MouseDragHandler } from "../../mouse/MouseDragHandler.js"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { NoneAlignment } from "./NoneAlignment.js"
import { AlignmentAdapter } from "./AlignmentAdapter.js"

export class CenterMarkerHandler implements MouseControllable {
  #mouseDragHandler
  #manipulateItem: Item
  #planeXAxis: VectorArray3
  #planeZAxis: VectorArray3
  #scale: number
  #camera: Camera
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter
  #alignment: AlignmentAdapter

  constructor(manipulateItem: Item, planeXAxis: VectorArray3, planeZAxis: VectorArray3, scale: number, camera: Camera) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.#manipulateItem = manipulateItem
    this.#planeXAxis = planeXAxis
    this.#planeZAxis = planeZAxis
    this.#camera = camera
    this.#scale = scale
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

    this.#mouseDragHandler.start(cursorX, cursorY)
    this.#alignment.reset(this.#manipulateItem.parentCoordinate.position)
    this.#cursorDirectionConverter.calcTransformMatrix(this.#manipulateItem.parentCoordinate, this.#camera.coordinate)
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#mouseDragHandler.isStart) return

    const mouseDelta = this.#mouseDragHandler.move(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = this.#cursorDirectionConverter.convert(mouseDelta)
    const addingVector: VectorArray3 = [
      Vec3.dotprod(mouseDeltaInItemCoordinate, this.#planeXAxis) * this.#scale,
      0,
      Vec3.dotprod(mouseDeltaInItemCoordinate, this.#planeZAxis) * this.#scale,
    ]

    this.#alignment.add(addingVector)

    this.#manipulateItem.parentCoordinate.x = this.#alignment.alignedPosition[0]
    this.#manipulateItem.parentCoordinate.y = this.#alignment.alignedPosition[1]
    this.#manipulateItem.parentCoordinate.z = this.#alignment.alignedPosition[2]
  }

  end() {
    this.#mouseDragHandler.end()
  }
}
