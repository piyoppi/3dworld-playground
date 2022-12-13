import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Coordinate } from "../../Coordinate.js"
import type { Raycaster } from "../../Raycaster"
import { CursorDirectionScreenToWorldConverter } from "./CursorDirectionScreenToWorldConverter.js"
import { Mat4 } from '../../Matrix.js'

export class RotateHandler implements MouseControllable {
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #manipulateCoordinate: Coordinate
  #cursorDirectionConverter = new CursorDirectionScreenToWorldConverter()
  #isStart = false
  #raycaster: Raycaster

  constructor(manipulateCoordinate: Coordinate, raycaster: Raycaster) {
    this.#manipulateCoordinate = manipulateCoordinate
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

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    this.#cursorDirectionConverter.calcTransformMatrix(this.#manipulateCoordinate, cameraCoordinate)
    this.#isStart = true
    this.#startedCallbacks.call()
  }

  move(cursorX: number, cursorY: number) {
    if (this.#raycaster.colidedDetails.length === 0) return

    const position = this.#raycaster.colidedDetails[0].position
    this.#manipulateCoordinate.lookAt(position)
  }

  end() {
    this.#isStart = false
  }
}
