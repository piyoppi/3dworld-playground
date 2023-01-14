import { LookAtCamera } from "./LookAtCamera"

export class CameraKeyboardHandler {
  #lookAtCamera: LookAtCamera | null

  constructor() {
    this.#lookAtCamera = null 
  }

  setLookAtCameraHandler(handler: LookAtCamera) {
    this.#lookAtCamera = handler
  }

  keyDown(keyName: string) {
    this.handleLookAtCamera(keyName)
  }

  capture() {
    window.addEventListener('keydown', e => this.keyDown(e.key))
  }

  private handleLookAtCamera(keyName: string) {
    if (!this.#lookAtCamera) return
    switch(keyName) {
      case '1':
        this.#lookAtCamera.setXYRotation(Math.PI / 2.0)
        this.#lookAtCamera.setYZRotation(0)
        break

      case '2':
        this.#lookAtCamera.addYZRotation(-Math.PI / 12.0)
        break

      case '3':
        this.#lookAtCamera.setXYRotation(0)
        this.#lookAtCamera.setYZRotation(0)
        break

      case '4':
        this.#lookAtCamera.addXYRotation(Math.PI / 12.0)
        break

      case '6':
        this.#lookAtCamera.addXYRotation(-Math.PI / 12.0)
        break

      case '7':
        this.#lookAtCamera.setXYRotation(Math.PI / 2.0)
        this.#lookAtCamera.setYZRotation(Math.PI / 2.0)
        break

      case '8':
        this.#lookAtCamera.addYZRotation(Math.PI / 12.0)
        break
    }
  }
}
