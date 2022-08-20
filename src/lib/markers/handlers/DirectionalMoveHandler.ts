import type { MouseButton, MouseControllable } from "../../mouse/MouseControllable.js"
import type { AlignmentAdapter } from "./AlignmentAdapter.js"
import type { Coordinate } from "../../Coordinate"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { NoneAlignment } from "./NoneAlignment.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { MouseDragHandler } from "../../mouse/MouseDragHandler.js"

export class DirectionalMoveHandler implements MouseControllable {
  manipulateCoordinate: Coordinate
  #mouseDragHandler
  #direction: VectorArray3
  #scale: number
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter
  #alignment: AlignmentAdapter

  constructor(manipulateCoordinate: Coordinate, directionInLocal: VectorArray3, scale: number) {
    this.#mouseDragHandler = new MouseDragHandler()
    this.manipulateCoordinate = manipulateCoordinate
    this.#direction = directionInLocal
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

    this.#alignment.reset(this.manipulateCoordinate.position)
    this.#mouseDragHandler.start(cursorX, cursorY)
    this.#cursorDirectionConverter.calcTransformMatrix(this.manipulateCoordinate, cameraCoordinate)
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#mouseDragHandler.isStart) return

    const mouseDelta = this.#mouseDragHandler.move(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = this.#cursorDirectionConverter.convert(mouseDelta)
    const len = Vec3.dotprod(mouseDeltaInItemCoordinate, this.#direction)
    const scale = len * this.#scale
    const addingVector = Vec3.mulScale(this.#direction, scale)

    this.#alignment.add(addingVector)

    this.manipulateCoordinate.x = this.#alignment.alignedPosition[0]
    this.manipulateCoordinate.y = this.#alignment.alignedPosition[1]
    this.manipulateCoordinate.z = this.#alignment.alignedPosition[2]
  }

  end() {
    this.#mouseDragHandler.end()
  }
}
