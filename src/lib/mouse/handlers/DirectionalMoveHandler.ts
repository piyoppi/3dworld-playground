import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable.js"
import type { CursorModifier } from "./cursorModifiers/CursorModifier.js"
import type { Coordinate } from "../../Coordinate"
import { Vec3, VectorArray3 } from "../../Matrix.js"
import { CursorNoneModifier } from "./cursorModifiers/CursorNoneModifier.js"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { CursorTrackDifferentialCalculator } from "../../mouse/CursorTrackDifferenceCalculator.js"
import { CallbackFunctions } from "../../CallbackFunctions.js"

export class DirectionalMoveHandler implements MouseControllable {
  manipulateCoordinate: Coordinate
  #cursorTrackDifference = new CursorTrackDifferentialCalculator()
  #direction: VectorArray3
  #scale: number
  #cursorDirectionConverter: CursorDirectionScreenToWorldConverter
  #cursorModifier: CursorModifier 
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  constructor(manipulateCoordinate: Coordinate, directionInLocal: VectorArray3, scale: number) {
    this.manipulateCoordinate = manipulateCoordinate
    this.#direction = directionInLocal
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

  setCursorModifier(cursorModifier: CursorModifier) {
    this.#cursorModifier = cursorModifier
  }

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    if (this.#cursorTrackDifference.isStart) return

    this.#cursorModifier.reset(this.manipulateCoordinate.position)
    this.#cursorTrackDifference.start(cursorX, cursorY)
    this.#cursorDirectionConverter.calcTransformMatrix(this.manipulateCoordinate, cameraCoordinate)

    this.#startedCallbacks.call()
  }

  move(cursorX: number, cursorY: number) {
    if (!this.#cursorTrackDifference.isStart) return

    const mouseDelta = this.#cursorTrackDifference.calculate(cursorX, cursorY)
    const mouseDeltaInItemCoordinate = this.#cursorDirectionConverter.convert(mouseDelta)
    const len = Vec3.dotprod(mouseDeltaInItemCoordinate, this.#direction)
    const scale = len * this.#scale
    const addingVector = Vec3.mulScale(this.#direction, scale)

    this.#cursorModifier.add(addingVector)

    this.manipulateCoordinate.x = this.#cursorModifier.alignedPosition[0]
    this.manipulateCoordinate.y = this.#cursorModifier.alignedPosition[1]
    this.manipulateCoordinate.z = this.#cursorModifier.alignedPosition[2]
  }

  end() {
    this.#cursorTrackDifference.end()
  }
}
