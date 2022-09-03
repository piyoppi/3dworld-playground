import type { HaconiwaRenderer } from '../renderer'
import type { MouseCapturer } from '../../../lib/mouse/MouseCapturer'
import type { VectorArray3 } from '../../../lib/Matrix'
import type { HaconiwaItemGeneratorFactory, HaconiwaItemGenerator, HaconiwaItemGeneratorClonedItem } from './itemGenerators/HaconiwaItemGenerator'
import type { Clonable } from "../clonable"
import type { Camera } from '../../../lib/Camera.js'
import type { RenderingObjectBuilder } from '../../../lib/RenderingObjectBuilder.js'
import type { MouseButton } from '../../../lib/mouse/MouseControllable.js'
import { LookAtCameraHandler } from '../../../lib/LookAtCameraHandler.js'
import { Raycaster } from '../../../lib/Raycaster.js'
import { Colider, PlaneColider } from '../../../lib/Colider.js'
import { HaconiwaWorld } from '../world.js'
import { ControlHandle, MouseHandlers } from '../../../lib/mouse/MouseHandlers.js'
import { InfiniteColider } from '../../../lib/Colider.js'
import { Raycasters } from '../../../lib/Raycasters.js'

type Plane = {
  position: VectorArray3,
  normal: VectorArray3
}

export class HaconiwaEditor<T extends Clonable<T>> {
  #cameraController: CameraController
  #mouseHandlers: MouseHandlers
  #editingPlane: EditingPlane
  #raycaster: Raycaster
  #renderer: HaconiwaRenderer<T>
  #mouseCapturer: MouseCapturer
  #raycasters = new Raycasters()

  #currentItemGenerator: HaconiwaItemGenerator<T> | null = null
  #currentItemGeneratorHandler: ControlHandle | null = null

  #renderingObjectBuilder: RenderingObjectBuilder<T>

  #world: HaconiwaWorld<T>

  constructor(world: HaconiwaWorld<T>, renderer: HaconiwaRenderer<T>, mouseCapturer: MouseCapturer, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#renderer = renderer
    this.#renderer.setBeforeRenderCallback(() => this.#renderingLoop())
    this.#renderingObjectBuilder = renderingObjectBuilder

    this.#editingPlane = new EditingPlane(this.#renderer.renderer.camera)

    this.#raycaster = new Raycaster(this.#renderer.renderer.camera)

    this.#mouseHandlers = new MouseHandlers(renderer.renderer.camera, this.#raycasters)
    this.#mouseHandlers.addBeforeMouseDownCallback((x, y, mouseButton) => this.#mouseDownHandler(x, y, mouseButton))
    this.#mouseHandlers.addBeforeMouseMoveCallback((_x, _y) => this.#mouseMoveHandler())

    this.#cameraController = new CameraController(renderer.renderer.camera)
    this.#cameraController.setMouseHandlers(this.#mouseHandlers)

    this.#raycasters.add(this.#editingPlane.raycaster)
    this.#raycasters.add(this.#raycaster, {transparency: false})
    this.#raycasters.add(this.#cameraController.raycaster)

    this.#mouseCapturer = mouseCapturer
    this.#mouseCapturer.capture()

    this.#world = world
  }

  get hasCurrentItemGenerator() {
    return !!this.#currentItemGenerator
  }

  captureMouseEvent() {
    this.#mouseHandlers.captureMouseEvent()
  }

  setItemGeneratorFactory(generator: HaconiwaItemGeneratorFactory<T>, original: HaconiwaItemGeneratorClonedItem<T>) {
    this.#currentItemGenerator = generator.create(
      this.#renderer.renderer,
      this.#editingPlane.raycaster,
      this.#raycaster,
      original,
      this.#renderingObjectBuilder
    )
    this.#currentItemGenerator.registerOnGeneratedCallback(generates => {
      generates.forEach(item => {
        item.markers.forEach(marker => marker.attach(this.#raycaster, this.#mouseHandlers))
        this.#world.addItem(item)
      })
    })
    this.#currentItemGeneratorHandler = {colider: this.#editingPlane.colider, handled: this.#currentItemGenerator}
    this.#mouseHandlers.add(this.#currentItemGeneratorHandler)
    this.#raycasters.disable(this.#cameraController.raycaster)
  }

  clearItemGenerator() {
    if (!this.#currentItemGenerator || !this.#currentItemGeneratorHandler) return

    this.#mouseHandlers.remove(this.#currentItemGeneratorHandler)
    this.#currentItemGenerator = null
    this.#raycasters.enable(this.#cameraController.raycaster)
  }

  handleMouseEvent() {
    const pos = this.#mouseCapturer.getNormalizedPosition()
    this.#raycasters.check(pos)
  }

  #mouseDownHandler(x: number, y: number, mouseButton: MouseButton) {
    switch(mouseButton) {
      case 'primary':
        this.#cameraController.setTargetPositionHandler()
        break
      case 'wheel':
        this.#cameraController.setRotationHandler()
        break
    }
    this.handleMouseEvent()
  }

  #mouseMoveHandler() {
    this.handleMouseEvent()
  }

  #renderingLoop() {
    if (this.#cameraController.changed) {
      this.#renderer.renderer.camera.coordinate.matrix = this.#cameraController.getLookAtMatrix()
    }
  }
}

export class EditingPlane {
  #raycaster : Raycaster
  #editingPlane: Plane = {position: [0, 0, 0], normal: [0, 1, 0]}
  #colider: Colider

  constructor(camera: Camera) {
    this.#raycaster = new Raycaster(camera)
    this.#colider = new PlaneColider(this.#editingPlane.position, this.#editingPlane.normal)
    this.#raycaster.addTarget(this.#colider)
  }

  get raycaster() {
    return this.#raycaster
  }

  get colider() {
    return this.#colider
  }
}

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

  setMouseHandlers(mouseHandlers: MouseHandlers) {
    mouseHandlers.add({colider: this.#colider, handled: this.#cameraHandler})
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
