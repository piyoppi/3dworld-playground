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
import { Colider, PlaneColider } from '../../../lib/Colider.js'
import { HaconiwaWorld, HaconiwaWorldItem } from '../world.js'
import { ControlHandle, MouseHandlers } from '../../../lib/mouse/MouseHandlers.js'
import { InfiniteColider } from '../../../lib/Colider.js'
import { MouseButton } from '../../../lib/mouse/MouseControllable.js'
import { RenderingObjectBuilder } from '../../../lib/RenderingObjectBuilder.js'

type Plane = {
  position: VectorArray3,
  normal: VectorArray3
}

export class HaconiwaEditor<T extends Clonable<T>> {
  #cameraHandler: LookAtCameraHandler
  #mouseHandlers: MouseHandlers
  #editingPlane: EditingPlane
  #raycaster: Raycaster
  #renderer: HaconiwaRenderer<T>
  #mouseCapturer: MouseCapturer

  #currentItemGenerator: HaconiwaItemGenerator<T> | null = null
  #currentItemGeneratorHandler: ControlHandle | null = null

  #renderingObjectBuilder: RenderingObjectBuilder<T>

  #world: HaconiwaWorld<T>

  constructor(world: HaconiwaWorld<T>, renderer: HaconiwaRenderer<T>, mouseCapturer: MouseCapturer, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#cameraHandler = new LookAtCameraHandler()

    this.#renderer = renderer
    this.#renderer.setBeforeRenderCallback(() => this.#renderingLoop())
    this.#renderingObjectBuilder = renderingObjectBuilder

    this.#editingPlane = new EditingPlane(this.#renderer.renderer.camera)

    const screenColider = new InfiniteColider()
    this.#raycaster = new Raycaster(this.#renderer.renderer.camera)
    this.#raycaster.addTarget(screenColider)

    this.#mouseHandlers = new MouseHandlers(renderer.renderer.camera)
    this.#mouseHandlers.add({colider: screenColider, handled: this.#cameraHandler})
    this.#mouseHandlers.addBeforeMouseDownCallback((x, y, mouseButton) => this.#mouseDownHandler(x, y, mouseButton))
    this.#mouseHandlers.addBeforeMouseMoveCallback((_x, _y) => this.#mouseMoveHandler())
    this.#mouseHandlers.addRaycaster(this.#editingPlane.raycaster)
    this.#mouseHandlers.addRaycaster(this.#raycaster)

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
    this.#currentItemGenerator = generator.create(this.#renderer.renderer, this.#editingPlane.raycaster, original, this.#renderingObjectBuilder)
    this.#currentItemGenerator.registerOnGeneratedCallback(generates => {
      generates.forEach(item => {
        item.markers.forEach(marker => marker.attach(this.#raycaster, this.#mouseHandlers))
        this.#world.addItem(item)
      })
    })
    this.#currentItemGeneratorHandler = {colider: this.#editingPlane.colider, handled: this.#currentItemGenerator}
    this.#mouseHandlers.add(this.#currentItemGeneratorHandler)
    this.#cameraHandler.isLocked = true
  }

  clearItemGenerator() {
    if (!this.#currentItemGenerator || !this.#currentItemGeneratorHandler) return

    this.#mouseHandlers.remove(this.#currentItemGeneratorHandler)
    this.#currentItemGenerator = null
    this.#cameraHandler.isLocked = false
  }

  handleMouseEvent() {
    const pos = this.#mouseCapturer.getNormalizedPosition()
    this.#editingPlane.mouseDown(pos)
    this.#raycaster.check(pos[0], pos[1])
  }

  #mouseDownHandler(x: number, y: number, mouseButton: MouseButton) {
    switch(mouseButton) {
      case 'primary':
        this.#cameraHandler.setTargetPositionHandler()
        break
      case 'wheel':
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

  mouseDown(pos: VectorArray2) {
    this.#raycaster.check(pos[0], pos[1])
  }
}
