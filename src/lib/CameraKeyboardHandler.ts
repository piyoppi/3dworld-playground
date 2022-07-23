import { LookAtCameraHandler } from "./LookAtCameraHandler"

export class CameraKeyboardHandler {
  #lookAtCameraHandler: LookAtCameraHandler | null

  constructor() {
    this.#lookAtCameraHandler = null 
  }

  setLookAtCameraHandler(handler: LookAtCameraHandler) {
    this.#lookAtCameraHandler = handler
  }

  keyDown(keyName: string) {
    this.handleLookAtCamera(keyName)
  }

  capture() {
    window.addEventListener('keydown', e => this.keyDown(e.key))
  }

  private handleLookAtCamera(keyName: string) {
    if (!this.#lookAtCameraHandler) return
    switch(keyName) {
      case '1':
        this.#lookAtCameraHandler.setXYRotation(Math.PI / 2.0)
        this.#lookAtCameraHandler.setYZRotation(0)
        break

      case '2':
        this.#lookAtCameraHandler.addYZRotation(-Math.PI / 12.0)
        break

      case '3':
        this.#lookAtCameraHandler.setXYRotation(0)
        this.#lookAtCameraHandler.setYZRotation(0)
        break

      case '4':
        this.#lookAtCameraHandler.addXYRotation(Math.PI / 12.0)
        break

      case '6':
        this.#lookAtCameraHandler.addXYRotation(-Math.PI / 12.0)
        break

      case '7':
        this.#lookAtCameraHandler.setXYRotation(Math.PI / 2.0)
        this.#lookAtCameraHandler.setYZRotation(Math.PI / 2.0)
        break

      case '8':
        this.#lookAtCameraHandler.addYZRotation(Math.PI / 12.0)
        break
    }
  }
}
