import { LookAtCameraHandler } from '../../../lib/LookAtCameraHandler.js'
import { VectorArray3 } from '../../../lib/Matrix.js'
import { Raycaster } from '../../../lib/Raycaster.js'
import { HaconiwaMouseHandler } from './mouseHandler.js'
import { ItemRaycaster } from '../../../lib/Raycaster.js'
import { Item } from '../../../lib/Item.js'
import { HaconiwaRenderer } from '../renderer.js'
import { MouseCapturer } from '../../../lib/mouse/MouseCapturer.js'
import { HaconiwaItemGenerator } from './itemGenerator.js'

type Plane = {
  position: VectorArray3,
  normal: VectorArray3
}

export class HaconiwaEditor<T> {
  #cameraHandler: LookAtCameraHandler
  #mouseHandlers = new HaconiwaMouseHandler()
  #raycaster: ItemRaycaster<Item>
  #editingPlane: Plane = {position: [0, 0, 0], normal: [0, 1, 0]}
  #renderer: HaconiwaRenderer<T>
  #mouseCapturer: MouseCapturer
  #currentItemGenerator: HaconiwaItemGenerator<T> | null = null

  constructor(renderer: HaconiwaRenderer<T>, mouseCapturer: MouseCapturer) {
    this.#cameraHandler = new LookAtCameraHandler()
    this.#renderer = renderer
    this.#raycaster = new ItemRaycaster<Item>(new Raycaster(renderer.renderer.camera))

    this.#mouseHandlers.add(this.#cameraHandler)
    this.#mouseHandlers.addBeforeMouseDownCallback(this.mouseDownHandler)

    this.#mouseCapturer = mouseCapturer
  }

  captureMouseClicked() {
    const pos = this.#mouseCapturer.getNormalizedPosition()
    this.#raycaster.check(pos[0], pos[1])
  }

  private mouseDownHandler(x: number, y: number, mouseButton: number) {
    switch(mouseButton) {
      case 0:
        this.#cameraHandler.setTargetPositionHandler()
        break
      case 1:
        this.#cameraHandler.setRotationHandler()
        break
    }
    this.captureMouseClicked()
  }
}
