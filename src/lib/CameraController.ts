import { InfiniteColider } from './Colider.js'
import { LookAtCameraHandler } from './LookAtCameraHandler.js'
import type { Camera } from './Camera'
import { Raycaster } from './Raycaster.js'
import { MouseControlHandles } from './mouse/MouseControlHandles.js'
import { Renderer } from './Renderer.js'

export class CameraController {
  #cameraHandler = new LookAtCameraHandler()
  #raycaster: Raycaster
  #colider = new InfiniteColider()

  constructor(camera: Camera) {
    this.#raycaster = new Raycaster(camera)
    this.#raycaster.addTarget(this.#colider)
  }

  get raycaster() {
    return this.#raycaster
  }

  get changed() {
    return this.#cameraHandler.changed
  }

  update(camera: Camera) {
    if (this.changed) {
      camera.coordinate.setMatrix(this.getLookAtMatrix())
    }
  }

  setMouseHandlers(mouseControlHandles: MouseControlHandles) {
    mouseControlHandles.add({colider: this.#colider, handled: this.#cameraHandler})
  }

  setDefaultMouseDownHandler(mouseControlHandles: MouseControlHandles) {
    mouseControlHandles.addBeforeMouseDownCallback((x, y, mouseButton) => {
      switch(mouseButton) {
        case 'primary':
          this.setTargetPositionHandler()
          break
        case 'wheel':
          this.setRotationHandler()
          break
      }
    })
  }

  setTargetPositionHandler() {
    this.#cameraHandler.setTargetPositionHandler()
  }

  setRotationHandler() {
    this.#cameraHandler.setRotationHandler()
  }

  getLookAtMatrix() {
    return this.#cameraHandler.getLookAtMatrix()
  }
}
