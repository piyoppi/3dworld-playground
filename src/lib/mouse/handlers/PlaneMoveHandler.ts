import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import { CursorNoneModifier } from "./cursorModifiers/CursorNoneModifier.js"
import type { CursorModifier } from "./cursorModifiers/CursorModifier"
import type { Coordinate } from "../../Coordinate.js"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Raycaster } from "../../Raycaster"
import { VectorArray3 } from "../../Matrix"

export type PlaneMoveHandlerApplyer = (coordinate: Coordinate, position: VectorArray3) => void

export class PlaneMoveHandler implements MouseControllable {
  manipulateCoordinate: Coordinate
  #cursorModifier: CursorModifier
  #beforeUpdateCallbacks = new CallbackFunctions<() => void>()
  #updatedCallbacks: Array<() => void> = []
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #raycaster
  #applyer: PlaneMoveHandlerApplyer = (coordinate: Coordinate, position: VectorArray3) => coordinate.position = position
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

  addBeforeUpdateCallback(callback: () => void) {
    this.#beforeUpdateCallbacks.add(callback)
  }

  addUpdatedCallback(callback: () => void) {
    this.#updatedCallbacks.push(callback)
  }

  setCursorModifier(modifier: CursorModifier) {
    this.#cursorModifier = modifier
  }

  setApplyer(applyer: PlaneMoveHandlerApplyer) {
    this.#applyer = applyer
  }

  clearCursorModifier() {
    this.#cursorModifier = new CursorNoneModifier()
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
      this.#applyer(this.manipulateCoordinate, this.#cursorModifier.alignedPosition)

      this.#updatedCallbacks.forEach(callback => callback())
    }
  }

  end() {
    this.#isStart = false
  }
}
