import { LookAtCamera } from "../../LookAtCamera.js"
import type { MouseControllable, MouseControllableCallbackFunction, WindowCursor } from "../MouseControllable"

export class LookAtCameraHandler implements MouseControllable {
  #lookAtCamera: LookAtCamera

  constructor() {
    this.#lookAtCamera = new LookAtCamera()
  }

  get isStart() {
    return this.#lookAtCamera.isStart
  }

  get changed() {
    return this.#lookAtCamera.changed
  }

  setTargetPositionHandler() {
    this.#lookAtCamera.setTargetPositionHandler()
  }

  setRotationHandler() {
    this.#lookAtCamera.setRotationHandler()
  }

  getLookAtMatrix() {
    return this.#lookAtCamera.getLookAtMatrix()
  }

  setStartedCallback (func: MouseControllableCallbackFunction) {
    this.#lookAtCamera.setStartedCallback(func)
  }

  removeStartedCallback (func: MouseControllableCallbackFunction) {
    this.#lookAtCamera.removeStartedCallback(func)
  }

  start(cursor: WindowCursor) {
    this.#lookAtCamera.start(cursor.screenX, cursor.screenY)
  }

  move(cursor: WindowCursor) {
    this.#lookAtCamera.move(cursor.screenX, cursor.screenY)
  }

  wheel(delta: number) {
    this.#lookAtCamera.wheel(delta)
  }

  end() {
    this.#lookAtCamera.end() 
  }
}
