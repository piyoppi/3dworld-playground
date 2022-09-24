import type { HaconiwaRenderer } from '../renderer'
import type { MouseCapturer } from '../../../lib/mouse/MouseCapturer'
import type { VectorArray3 } from '../../../lib/Matrix'
import {
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorClonedItem,
  HaconiwaItemGeneratorLineConnectable,
  isHaconiwaItemGeneratorLineConnectable,
  isHaconiwaItemGeneratorItemClonable
} from './itemGenerators/HaconiwaItemGenerator.js'
import type { Clonable } from "../clonable"
import type { Camera } from '../../../lib/Camera'
import type { RenderingObjectBuilder } from '../../../lib/RenderingObjectBuilder'
import type { MouseButton } from '../../../lib/mouse/MouseControllable'
import { LookAtCameraHandler } from '../../../lib/LookAtCameraHandler.js'
import { Raycaster } from '../../../lib/Raycaster.js'
import { Colider, PlaneColider } from '../../../lib/Colider.js'
import { HaconiwaWorld } from '../world.js'
import { ControlHandle, MouseControlHandles } from '../../../lib/mouse/MouseControlHandles.js'
import { InfiniteColider } from '../../../lib/Colider.js'
import { Raycasters } from '../../../lib/Raycasters.js'
import { ColiderItemMap } from '../../../lib/ColiderItemMap.js'
import type { LineItemConnection } from '../../../lib/LineItem'

type Plane = {
  position: VectorArray3,
  normal: VectorArray3
}

export class HaconiwaEditor<T extends Clonable<T>> {
  #cameraController: CameraController
  #mouseControlHandles: MouseControlHandles
  #editingPlane: EditingPlane
  #markerRaycaster: Raycaster
  #renderer: HaconiwaRenderer<T>
  #mouseCapturer: MouseCapturer
  #raycasters = new Raycasters()
  #coliderConnectionMap = new ColiderItemMap<LineItemConnection>()

  #currentItemGenerator: HaconiwaItemGenerator<T> | null = null
  #currentItemGeneratorHandler: ControlHandle | null = null

  #renderingObjectBuilder: RenderingObjectBuilder<T>

  #world: HaconiwaWorld<T>

  constructor(world: HaconiwaWorld<T>, renderer: HaconiwaRenderer<T>, mouseCapturer: MouseCapturer, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#renderer = renderer
    this.#renderer.setBeforeRenderCallback(() => this.#renderingLoop())
    this.#renderingObjectBuilder = renderingObjectBuilder

    this.#editingPlane = new EditingPlane(this.#renderer.renderer.camera)

    this.#markerRaycaster = new Raycaster(this.#renderer.renderer.camera)

    this.#mouseControlHandles = new MouseControlHandles(renderer.renderer.camera, this.#raycasters)
    this.#mouseControlHandles.addBeforeMouseDownCallback((x, y, mouseButton) => this.#mouseDownHandler(x, y, mouseButton))
    this.#mouseControlHandles.addBeforeMouseMoveCallback((_x, _y) => this.#mouseMoveHandler())

    this.#cameraController = new CameraController(renderer.renderer.camera)
    this.#cameraController.setMouseHandlers(this.#mouseControlHandles)

    this.#raycasters.add(this.#editingPlane.raycaster)
    this.#raycasters.add(this.#markerRaycaster, {transparency: false})
    this.#raycasters.add(this.#cameraController.raycaster)

    this.#mouseCapturer = mouseCapturer
    this.#mouseCapturer.capture()

    this.#world = world
  }

  get hasCurrentItemGenerator() {
    return !!this.#currentItemGenerator
  }

  captureMouseEvent() {
    this.#mouseControlHandles.captureMouseEvent()
  }

  setItemGeneratorFactory(generator: HaconiwaItemGeneratorFactory<T>, original: HaconiwaItemGeneratorClonedItem<T> | undefined = undefined) {
    this.#currentItemGenerator = generator.create(
      this.#renderer.renderer,
      this.#editingPlane.raycaster,
      this.#markerRaycaster,
      this.#renderingObjectBuilder
    )

    if (isHaconiwaItemGeneratorLineConnectable(this.#currentItemGenerator)) {
      this.#currentItemGenerator.setConnectorColiderMap(this.#coliderConnectionMap)
    }

    if (isHaconiwaItemGeneratorItemClonable(this.#currentItemGenerator)) {
      if (!original) {
        throw new Error('Original-item is required')
      }

      this.#currentItemGenerator.setOriginal(original)
    }

    this.#currentItemGenerator.registerOnGeneratedCallback(generates => {
      generates.forEach(item => {
        item.markers.forEach(marker => {
          marker.attach(this.#markerRaycaster, this.#mouseControlHandles)
        })
        this.#world.addItem(item)
      })
    })

    this.#currentItemGeneratorHandler = {colider: this.#editingPlane.colider, handled: this.#currentItemGenerator}
    this.#mouseControlHandles.add(this.#currentItemGeneratorHandler)
    this.#raycasters.disable(this.#cameraController.raycaster)
  }

  clearItemGenerator() {
    if (!this.#currentItemGenerator || !this.#currentItemGeneratorHandler) return

    this.#mouseControlHandles.remove(this.#currentItemGeneratorHandler)
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
      this.#renderer.renderer.camera.coordinate.setMatrix(this.#cameraController.getLookAtMatrix())
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

  setMouseHandlers(mouseControlHandles: MouseControlHandles) {
    mouseControlHandles.add({colider: this.#colider, handled: this.#cameraHandler})
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
