import { Camera } from "../../Camera.js"
import { MouseDragHandler } from "../../mouse/MouseDragHandler.js"
import { MouseButton, MouseControllable } from "../../mouse/MouseControllable.js"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { NoneAlignment } from "./NoneAlignment.js"
import type { AlignmentAdapter } from "./AlignmentAdapter.js"
import type { Coordinate } from "../../Coordinate.js"

export class PlaneMoveHandler implements MouseControllable {
  #mouseDragHandler
  manipulateCoordinate: Coordinate
  #planeXAxis: VectorArray3
  #planeZAxis: VectorArray3
  #scale: number
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter
  #alignment: AlignmentAdapter

  constructor(manipulateCoordinate: Coordinate, planeXAxis: VectorArray3, planeZAxis: VectorArray3, scale: number) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.manipulateCoordinate = manipulateCoordinate
    this.#planeXAxis = planeXAxis
    this.#planeZAxis = planeZAxis
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

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    if (this.#mouseDragHandler.isStart) return

    this.#mouseDragHandler.start(cursorX, cursorY)
    this.#alignment.reset(this.manipulateCoordinate.position)
    this.#cursorDirectionConverter.calcTransformMatrix(this.manipulateCoordinate, cameraCoordinate)
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

    this.manipulateCoordinate.x = this.#alignment.alignedPosition[0]
    this.manipulateCoordinate.y = this.#alignment.alignedPosition[1]
    this.manipulateCoordinate.z = this.#alignment.alignedPosition[2]
  }

  end() {
    this.#mouseDragHandler.end()
  }
}
