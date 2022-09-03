import { CursorTrackDifferentialCalculator } from "../../mouse/CursorTrackDifferenceCalculator.js"
import { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable.js"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { CursorNoneModifier } from "./cursorModifiers/CursorNoneModifier.js"
import type { CursorModifier } from "./cursorModifiers/CursorModifier"
import type { Coordinate } from "../../Coordinate.js"
import { CallbackFunctions } from "../../CallbackFunctions.js"

export class PlaneMoveHandler implements MouseControllable {
  #cursorTrackDifference = new CursorTrackDifferentialCalculator()
  manipulateCoordinate: Coordinate
  #planeXAxis: VectorArray3
  #planeZAxis: VectorArray3
  #scale: number
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter
  #cursorModifier: CursorModifier
  #updatedCallbacks: Array<() => void> = []
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  constructor(manipulateCoordinate: Coordinate, planeXAxis: VectorArray3, planeZAxis: VectorArray3, scale: number) {
    this.manipulateCoordinate = manipulateCoordinate
    this.#planeXAxis = planeXAxis
    this.#planeZAxis = planeZAxis
    this.#scale = scale
    this.#cursorDirectionConverter = new CursorDirectionScreenToWorldConverter()
    this.#cursorModifier = new CursorNoneModifier()
  }

  get isStart() {
    return this.#cursorTrackDifference.isStart
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

  setCursorModifier(modifier: CursorModifier) {
    this.#cursorModifier = modifier
  }

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    if (this.#cursorTrackDifference.isStart) return

    this.#cursorTrackDifference.start(cursorX, cursorY)
    this.#cursorModifier.reset(this.manipulateCoordinate.position)
    this.#cursorDirectionConverter.calcTransformMatrix(this.manipulateCoordinate, cameraCoordinate)

    this.#startedCallbacks.call()
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#cursorTrackDifference.isStart) return

    const mouseDelta = this.#cursorTrackDifference.calculate(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = this.#cursorDirectionConverter.convert(mouseDelta)
    const addingVector: VectorArray3 = [
      Vec3.dotprod(mouseDeltaInItemCoordinate, this.#planeXAxis) * this.#scale,
      0,
      Vec3.dotprod(mouseDeltaInItemCoordinate, this.#planeZAxis) * this.#scale,
    ]

    this.#cursorModifier.add(addingVector)

    const isChanged =
      this.manipulateCoordinate.x !== this.#cursorModifier.alignedPosition[0] ||
      this.manipulateCoordinate.y !== this.#cursorModifier.alignedPosition[1] ||
      this.manipulateCoordinate.z !== this.#cursorModifier.alignedPosition[2]

    if (isChanged) {
      this.manipulateCoordinate.x = this.#cursorModifier.alignedPosition[0]
      this.manipulateCoordinate.y = this.#cursorModifier.alignedPosition[1]
      this.manipulateCoordinate.z = this.#cursorModifier.alignedPosition[2]

      this.#updatedCallbacks.forEach(callback => callback())
    }
  }

  end() {
    this.#cursorTrackDifference.end()
  }
}
