import { MouseDragHandler } from "../../mouse/MouseDragHandler.js"
import { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable.js"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { NoneAlignment } from "./NoneAlignment.js"
import type { AlignmentAdapter } from "./AlignmentAdapter.js"
import type { Coordinate } from "../../Coordinate.js"
import { CallbackFunctions } from "../../CallbackFunctions.js"

export class PlaneMoveHandler implements MouseControllable {
  #mouseDragHandler
  manipulateCoordinate: Coordinate
  #planeXAxis: VectorArray3
  #planeZAxis: VectorArray3
  #scale: number
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter
  #alignment: AlignmentAdapter
  #updatedCallbacks: Array<() => void> = []
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

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

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  addUpdatedCallback(callback: () => void) {
    this.#updatedCallbacks.push(callback)
  }

  setAlignment(alignment: AlignmentAdapter) {
    this.#alignment = alignment
  }

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    console.log('started')
    if (this.#mouseDragHandler.isStart) return

    this.#mouseDragHandler.start(cursorX, cursorY)
    this.#alignment.reset(this.manipulateCoordinate.position)
    this.#cursorDirectionConverter.calcTransformMatrix(this.manipulateCoordinate, cameraCoordinate)

    this.#startedCallbacks.call()
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

    const isChanged =
      this.manipulateCoordinate.x !== this.#alignment.alignedPosition[0] ||
      this.manipulateCoordinate.y !== this.#alignment.alignedPosition[1] ||
      this.manipulateCoordinate.z !== this.#alignment.alignedPosition[2]

    if (isChanged) {
      this.manipulateCoordinate.x = this.#alignment.alignedPosition[0]
      this.manipulateCoordinate.y = this.#alignment.alignedPosition[1]
      this.manipulateCoordinate.z = this.#alignment.alignedPosition[2]

      this.#updatedCallbacks.forEach(callback => callback())
    }
  }

  end() {
    this.#mouseDragHandler.end()
  }
}
