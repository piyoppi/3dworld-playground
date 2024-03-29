import type { HaconiwaRenderer } from '../renderer'
import type { MouseCapturer } from '../../../lib/mouse/MouseCapturer'
import type { VectorArray3 } from '../../../lib/Matrix'
import {
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGenerator,
  isHaconiwaItemGeneratorLineConnectable,
} from './itemGenerators/HaconiwaItemGenerator.js'
import type { Camera } from '../../../lib/Camera'
import type { RenderingObjectBuilder } from '../../../lib/RenderingObjectBuilder'
import { Raycaster } from '../../../lib/Raycaster.js'
import { Colider, PlaneColider, CoordinatedColider } from '../../../lib/Colider.js'
import { HaconiwaWorld } from '../World/index.js'
import { ControlHandle, MouseControlHandles } from '../../../lib/mouse/MouseControlHandles.js'
import { Raycasters } from '../../../lib/Raycasters.js'
import { ColiderItemMap } from '../../../lib/ColiderItemMap.js'
import type { LineItemConnection } from '../../../lib/LineItem/index.js'
import { RenderingObject } from '../../../lib/RenderingObject'
import { CameraController } from '../../../lib/CameraController.js'
import { Coordinate } from '../../../lib/Coordinate.js'
import type { ItemGeneratorProcess } from './ItemGenerators/ItemGeneratorProcess'
import { ItemGenerateHandler } from './ItemGenerators/ItemGenerateHandler/ItemGenerateHandler.js'
import { Input } from './Inputs/Input'

type Plane = {
  position: VectorArray3,
  normal: VectorArray3
}

export class HaconiwaEditor<T extends RenderingObject> {
  #cameraController: CameraController
  #mouseControlHandles: MouseControlHandles

  #itemGeneratorsMouseControlHandles: MouseControlHandles
  #currentItemGeneratorHandler: ControlHandle | null = null

  #editingPlane: EditingPlane
  #markerRaycaster: Raycaster<CoordinatedColider>
  #renderer: HaconiwaRenderer<T>
  #mouseCapturer: MouseCapturer
  #raycasters = new Raycasters()
  #coliderConnectionMap = new ColiderItemMap<LineItemConnection>()

  #currentItemGenerator: HaconiwaItemGenerator<T> | null = null
  #selectedItemGenerators: HaconiwaItemGenerator<T>[] = []

  #renderingObjectBuilder: RenderingObjectBuilder<T>

  #itemGenerateHandler: ItemGenerateHandler<T> | null = null

  #world: HaconiwaWorld

  #inputDevice: Input

  constructor(
    world: HaconiwaWorld,
    renderer: HaconiwaRenderer<T>,
    mouseCapturer: MouseCapturer,
    renderingObjectBuilder: RenderingObjectBuilder<T>,
    inputDevice: Input
  ) {
    this.#renderer = renderer
    this.#renderer.setBeforeRenderCallback(() => this.#renderingLoop())
    this.#renderingObjectBuilder = renderingObjectBuilder

    this.#editingPlane = new EditingPlane(this.#renderer.renderer.camera)

    this.#markerRaycaster = new Raycaster(this.#renderer.renderer.camera)

    this.#mouseControlHandles = new MouseControlHandles(renderer.renderer.camera, this.#raycasters, this.#renderer.width, this.#renderer.height)
    this.#mouseControlHandles.addBeforeMouseDownCallback(() => this.handleMouseEvent())
    this.#mouseControlHandles.addBeforeMouseMoveCallback((_x, _y) => this.#mouseMoveHandler())

    this.#itemGeneratorsMouseControlHandles = new MouseControlHandles(renderer.renderer.camera, this.#raycasters, this.#renderer.width, this.#renderer.height)
    this.#itemGeneratorsMouseControlHandles.addBeforeMouseDownCallback(() => this.handleMouseEvent())
    this.#itemGeneratorsMouseControlHandles.addBeforeMouseMoveCallback((_x, _y) => this.#mouseMoveHandler())

    this.#cameraController = new CameraController(renderer.renderer.camera)
    this.#cameraController.setMouseHandlers(this.#mouseControlHandles)
    this.#cameraController.setDefaultMouseDownHandler(this.#mouseControlHandles)

    this.#raycasters.add(this.#editingPlane.raycaster)
    this.#raycasters.add(this.#markerRaycaster, {transparency: false})
    this.#raycasters.add(this.#cameraController.raycaster)

    this.#mouseCapturer = mouseCapturer
    this.#mouseCapturer.capture()

    this.#world = world

    this.#inputDevice = inputDevice
    this.#inputDevice.mount()
  }

  get hasCurrentItemGenerator() {
    return !!this.#currentItemGenerator
  }

  captureMouseEvent() {
    this.#mouseControlHandles.captureMouseEvent()
    this.#itemGeneratorsMouseControlHandles.captureMouseEvent('primary')
  }

  setItemGeneratorProcessFactory(factory: () => Promise<ItemGeneratorProcess<T>>) {
    this.#itemGenerateHandler = new ItemGenerateHandler(
      factory,
      this.#renderer.renderer,
      this.#markerRaycaster,
      this.#editingPlane.raycaster.getReadonly(),
      this.#mouseControlHandles,
      this.#renderingObjectBuilder,
      {
        onSelected: itemHandler => {
          const removeHandler = this.#inputDevice.addKeyDownCallback(command => {
            if (command.key === 'delete') {
              itemHandler.items.forEach(item => this.#world.removeItem(item))
              itemHandler.dispose(this.#renderer.renderer, this.#markerRaycaster, this.#mouseControlHandles)
            }
          })

          return () => removeHandler() 
        },
        onCompleted: itemHandler => itemHandler.items.forEach(item => this.#world.addItem(item))
      }
    )
    this.#currentItemGeneratorHandler = {
      colider: this.#editingPlane.colider,
      handled: this.#itemGenerateHandler
    }

    this.#itemGeneratorsMouseControlHandles.add(this.#currentItemGeneratorHandler)
  }

  clearItemGeneratorProcessFactory() {
    if (!this.#currentItemGeneratorHandler || !this.#itemGenerateHandler) return

    if (this.#itemGenerateHandler.isRunning) {
      throw new Error('Cannot clear item generator process factory while running')
    }

    this.#itemGeneratorsMouseControlHandles.remove(this.#currentItemGeneratorHandler)
    this.#itemGenerateHandler = null
    this.#currentItemGeneratorHandler = null
  }

  setItemGeneratorFactory(generator: HaconiwaItemGeneratorFactory<T>) {
    this.#selectedItemGenerators = []
    this.clearItemGenerator()

    this.#currentItemGenerator = generator.create(
      this.#renderer.renderer,
      this.#editingPlane.raycaster,
      this.#markerRaycaster,
      this.#renderingObjectBuilder
    )

    if (isHaconiwaItemGeneratorLineConnectable(this.#currentItemGenerator)) {
      this.#currentItemGenerator.setConnectorColiderMap(this.#coliderConnectionMap)
    }

    this.#currentItemGenerator.addMarkerCallback(marker => {
      marker.attach(this.#markerRaycaster, this.#itemGeneratorsMouseControlHandles)
    })

    this.#currentItemGenerator.removeMarkerCallback(marker => {
      marker.detach(this.#markerRaycaster, this.#itemGeneratorsMouseControlHandles)
    })

    this.#currentItemGenerator.registerOnGeneratedCallback(generates => {
      generates.forEach(item => {
        item.markers.forEach(marker => {
          marker.attach(this.#markerRaycaster, this.#itemGeneratorsMouseControlHandles)
        })
        this.#world.addItem(item)
      })
    })

    this.#currentItemGenerator.addEndedCallback(() => {
      this.setItemGeneratorFactory(generator)
    })

    this.#currentItemGenerator.addSelectedCallback(item => {
      this.#selectedItemGenerators.push(item)
    })

    this.#currentItemGenerator.addUnselectedCallback(item => {
      const index = this.#selectedItemGenerators.findIndex(registered => registered.uuid === item.uuid)

      if (index < 0) return
      this.#selectedItemGenerators.splice(index, 1)
    })

    this.#currentItemGeneratorHandler = {colider: this.#editingPlane.colider, handled: this.#currentItemGenerator}
    this.#itemGeneratorsMouseControlHandles.add(this.#currentItemGeneratorHandler)
    this.#raycasters.disable(this.#cameraController.raycaster)
  }

  clearItemGenerator() {
    if (!this.#currentItemGenerator || !this.#currentItemGeneratorHandler) return
    if (this.#currentItemGenerator && this.#currentItemGenerator.generated) return

    this.#itemGeneratorsMouseControlHandles.remove(this.#currentItemGeneratorHandler)
    this.#currentItemGenerator = null
    this.#raycasters.enable(this.#cameraController.raycaster)
  }

  removeSelectedItems() {
    this.#selectedItemGenerators.forEach(generator => {
      const item = generator.generatedItem
      if (!item) return

      item.removeRenderingItem(this.#renderer.renderer)
      this.#raycasters.forEach(raycaster => item.removeTargetColider(raycaster))
      this.#world.removeItem(item)
      generator.dispose()
    })
  }

  handleMouseEvent() {
    const pos = this.#mouseCapturer.getNormalizedPosition()
    this.#raycasters.check(pos)
  }

  #mouseMoveHandler() {
    this.handleMouseEvent()
  }

  #renderingLoop() {
    this.#cameraController.update(this.#renderer.renderer.camera)
  }
}

export class EditingPlane {
  #raycaster : Raycaster
  #editingPlane: Plane = {position: [0, 0, 0], normal: [0, 1, 0]}
  #colider: Colider

  constructor(camera: Camera) {
    this.#raycaster = new Raycaster(camera)
    this.#colider = new PlaneColider(new Coordinate(), this.#editingPlane.normal, false)
    this.#raycaster.addTarget(this.#colider)
  }

  get raycaster() {
    return this.#raycaster
  }

  get colider() {
    return this.#colider
  }
}
