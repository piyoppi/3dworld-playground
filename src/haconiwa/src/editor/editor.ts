import { LookAtCameraHandler } from '../../../lib/LookAtCameraHandler.js'
import { HaconiwaMouseHandler } from './mouseHandler.js'
import { Raycaster, ItemRaycaster } from '../../../lib/Raycaster.js'
import { Item } from '../../../lib/Item.js'
import type { HaconiwaRenderer } from '../renderer'
import type { MouseCapturer } from '../../../lib/mouse/MouseCapturer'
import type { VectorArray2, VectorArray3 } from '../../../lib/Matrix'
import type { HaconiwaItemGeneratorFactory, HaconiwaItemGenerator, HaconiwaItemGeneratorClonedItem } from './itemGenerators/HaconiwaItemGenerator'
import type { Clonable } from "../clonable"
import { Camera } from '../../../lib/Camera.js'
import { PlaneColider } from '../../../lib/Colider.js'
import { HaconiwaWorld, HaconiwaWorldItem } from '../world.js'

type Plane = {
  position: VectorArray3,
  normal: VectorArray3
}

export class HaconiwaEditor<T extends Clonable<T>> {
  #cameraHandler: LookAtCameraHandler
  #mouseHandlers: HaconiwaMouseHandler
  #editingPlane: EditingPlane

  #renderer: HaconiwaRenderer<T>
  #mouseCapturer: MouseCapturer
  #currentItemGenerator: HaconiwaItemGenerator<T> | null = null

  #world: HaconiwaWorld<T>

  constructor(world: HaconiwaWorld<T>, renderer: HaconiwaRenderer<T>, mouseCapturer: MouseCapturer) {
    this.#cameraHandler = new LookAtCameraHandler()

    this.#mouseHandlers = new HaconiwaMouseHandler(renderer.renderer.camera)
    this.#mouseHandlers.add(this.#cameraHandler)
    this.#mouseHandlers.addBeforeMouseDownCallback((x, y, mouseButton) => this.#mouseDownHandler(x, y, mouseButton))
    this.#mouseHandlers.addBeforeMouseMoveCallback((_x, _y) => this.#mouseMoveHandler())

    this.#mouseCapturer = mouseCapturer
    this.#mouseCapturer.capture()

    this.#renderer = renderer
    this.#renderer.setBeforeRenderCallback(() => this.#renderingLoop())

    this.#editingPlane = new EditingPlane(this.#renderer.renderer.camera)

    this.#world = world
  }

  get hasCurrentItemGenerator() {
    return !!this.#currentItemGenerator
  }

  captureMouseEvent() {
    this.#mouseHandlers.captureMouseEvent()
  }

  setItemGeneratorFactory(generator: HaconiwaItemGeneratorFactory<T>, original: HaconiwaItemGeneratorClonedItem<T>) {
    this.#currentItemGenerator = generator.create(this.#renderer.renderer, this.#editingPlane.raycaster, original)
    this.#currentItemGenerator.registerOnGeneratedCallback(generates => generates.forEach(item => this.#world.addItem(item)))
    this.#mouseHandlers.add(this.#currentItemGenerator)
    this.#cameraHandler.isLocked = true
  }

  clearItemGenerator() {
    if (!this.#currentItemGenerator) return

    this.#mouseHandlers.remove(this.#currentItemGenerator)
    this.#currentItemGenerator = null
    this.#cameraHandler.isLocked = false
  }

  handleMouseEvent() {
    const pos = this.#mouseCapturer.getNormalizedPosition()
    this.#editingPlane.mouseDown(pos)
  }

  #mouseDownHandler(x: number, y: number, mouseButton: number) {
    switch(mouseButton) {
      case 0:
        this.#cameraHandler.setTargetPositionHandler()
        break
      case 1:
        this.#cameraHandler.setRotationHandler()
        break
    }
    this.#cameraHandler.isLocked = this.hasCurrentItemGenerator
    this.handleMouseEvent()
  }

  #mouseMoveHandler() {
    this.handleMouseEvent()
  }

  #renderingLoop() {
    if (this.#cameraHandler.changed) {
      this.#renderer.renderer.camera.coordinate.matrix = this.#cameraHandler.getLookAtMatrix()
    }
  }
}

export class EditingPlane {
  #raycaster : Raycaster
  #editingPlane: Plane = {position: [0, 0, 0], normal: [0, 1, 0]}

  constructor(camera: Camera) {
    this.#raycaster = new Raycaster(camera)
    this.#raycaster.addTarget(new PlaneColider(this.#editingPlane.position, this.#editingPlane.normal))
  }

  get raycaster() {
    return this.#raycaster
  }

  mouseDown(pos: VectorArray2) {
    this.#raycaster.check(pos[0], pos[1])
  }
}
