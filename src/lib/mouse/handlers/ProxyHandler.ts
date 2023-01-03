import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Coordinate } from "../../Coordinate.js"
import type { Raycaster } from "../../Raycaster"
import { Mat4, Mat3, Vec3, VectorArray3 } from "../../Matrix.js"
import { Colider } from "../../Colider.js"

type StartingCallbackFunction = () => boolean

export class ProxyHandler implements MouseControllable {
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #startingCallbacks = new CallbackFunctions<StartingCallbackFunction>()
  #movingCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endingCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #isStart = false
  #raycaster: Raycaster
  #targetColider: Colider

  constructor(raycaster: Raycaster, targetColider: Colider) {
    this.#raycaster = raycaster
    this.#targetColider = targetColider
  }

  get isStart() {
    return this.#isStart
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  setStartingCallback(func: StartingCallbackFunction) {
    this.#startingCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  removeStartingCallback(func: StartingCallbackFunction) {
    this.#startingCallbacks.remove(func)
  }

  setMovingCallback(func: MouseControllableCallbackFunction) {
    this.#movingCallbacks.add(func)
  }

  removeMovingCallback(func: MouseControllableCallbackFunction) {
    this.#movingCallbacks.remove(func)
  }

  setEndingcallback(func: MouseControllableCallbackFunction) {
    this.#endingCallbacks.add(func)
  }

  removeEndingCallback(func: MouseControllableCallbackFunction) {
    this.#endingCallbacks.remove(func)
  }

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    if (this.#startingCallbacks.call().some(val => val === false)) return
    if (this.#raycaster.colidedDetails[0].colider.uuid !== this.#targetColider.uuid) return

    this.#isStart = true

    this.#startedCallbacks.call()
  }

  move(cursorX: number, cursorY: number) {
    if (this.#raycaster.colidedDetails.length === 0) return

    this.#movingCallbacks.call()
  }

  end() {
    this.#endingCallbacks.call()
    this.#isStart = false
  }
}
