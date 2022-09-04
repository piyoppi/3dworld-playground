import { CursorTrackDifferentialCalculator } from "../../mouse/CursorTrackDifferenceCalculator.js"
import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { CursorNoneModifier } from "./cursorModifiers/CursorNoneModifier.js"
import type { CursorModifier } from "./cursorModifiers/CursorModifier"
import type { Coordinate } from "../../Coordinate.js"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Raycaster } from "../../Raycaster"

export class PlaneMoveHandler implements MouseControllable {
  manipulateCoordinate: Coordinate
  #cursorModifier: CursorModifier
  #updatedCallbacks: Array<() => void> = []
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #raycaster
  #isStart = false

  constructor(manipulateCoordinate: Coordinate, raycaster: Raycaster) {
    this.manipulateCoordinate = manipulateCoordinate
    this.#cursorModifier = new CursorNoneModifier()
    this.#raycaster = raycaster
  }

  get isStart() {
    return this.#isStart
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
    this.#isStart = true
    this.#cursorModifier.reset(this.manipulateCoordinate.position)

    this.#startedCallbacks.call()
  }

  move() {
    if (!this.#isStart || !this.#raycaster.hasColided) return

    this.#cursorModifier.setPosition(this.#raycaster.colidedDetails[0].position)

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
    this.#isStart = false
  }
}
