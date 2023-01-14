import type { MouseButton, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import type { Coordinate } from "../../Coordinate"
import { CallbackFunctions } from "../../CallbackFunctions.js"

export abstract class HandlerBase {
  #isStart = false
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  get isStart() {
    return this.#isStart
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  start(cursorX: number, cursorY: number, button: MouseButton, cameraCoordinate: Coordinate) {
    this.#isStart = true

    this.startingHook(cursorX, cursorY, button, cameraCoordinate)
    this.#startedCallbacks.call()
  }

  move(cursorX: number, cursorY: number, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.#isStart) return

    this.movingHook(cursorX, cursorY, button, cameraCoordinate)
  }

  end() {
    this.#isStart = false

    this.endingHook()

    this.#endedCallbacks.call()
  }

  protected abstract startingHook(cursorX: number, cursorY: number, button: MouseButton, cameraCoordinate: Coordinate): boolean | void
  protected abstract movingHook(cursorX: number, cursorY: number, button: MouseButton, cameraCoordinate: Coordinate): void
  protected abstract endingHook(): void
}
