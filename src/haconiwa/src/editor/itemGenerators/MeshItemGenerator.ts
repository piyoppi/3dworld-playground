import { Coordinate } from "../../../../lib/Coordinate.js"
import { RenderingObject } from "../../../../lib/RenderingObject"
import {
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorItemClonable,
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGeneratorClonedItem,
  HaconiwaItemGeneratedCallback,
  AddMarkerCallbackFunction,
  RemoveMarkerCallbackFunction,
  EndedCallbackFunction
} from './HaconiwaItemGenerator'
import { HaconiwaWorldItem } from "../../world.js"
import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import { MouseButton, MouseControllableCallbackFunction } from "../../../../lib/mouse/MouseControllable.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { Item } from "../../../../lib/Item.js"
import { CenterMarker } from "../../../../lib/markers/CenterMarker.js"
import { PlaneMoveHandler } from "../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { DirectionalMarker } from "../../../../lib/markers/DirectionalMarker.js"
import { DirectionalMoveHandler } from "../../../../lib/mouse/handlers/DirectionalMoveHandler.js"
import { RotateHandler } from "../../../../lib/mouse/handlers/RotateHandler.js"
import { RotateMarker } from "../../../../lib/markers/RotateMarker.js"
import { BoxMarker } from "../../../../lib/markers/BoxMarker.js"
import { ProxyHandler } from "../../../../lib/mouse/handlers/ProxyHandler.js"
import { Marker, MarkerRenderable } from "../../../../lib/markers/Marker.js"
import { CoordinateMarker } from "../../../../lib/markers/CoordinateMarker.js"

export class MeshItemGenerator<T extends RenderingObject>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorItemClonable<T> {

  private original: HaconiwaItemGeneratorClonedItem<T> | null = null
  #isStarted = false
  #mounted = false
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderer: Renderer<T>
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #addMarkerCallbacks = new CallbackFunctions<AddMarkerCallbackFunction>()
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<EndedCallbackFunction>()
  #removeMarkerCallbacks = new CallbackFunctions<RemoveMarkerCallbackFunction>()
  #handlingMarkers: Array<Marker & MarkerRenderable> = []
  #itemMarker: BoxMarker | null = null
  #generatedItem: Item | null = null

  constructor(
    renderer: Renderer<T>,
    planeRaycaster: Raycaster,
    markerRaycaster: Raycaster,
    renderingObjectBuilder: RenderingObjectBuilder<T>
  ) {
    this.#planeRaycaster = planeRaycaster
    this.#markerRaycaster = markerRaycaster

    this.#renderer = renderer
    this.#renderingObjectBuilder = renderingObjectBuilder
  }

  get isStart() {
    return this.#isStarted
  }

  registerOnGeneratedCallback(func: HaconiwaItemGeneratedCallback<T>) {
    this.#onGeneratedCallbacks.push(func)
  }

  addMarkerCallback(func: AddMarkerCallbackFunction) {
    this.#addMarkerCallbacks.add(func)
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  removeMarkerCallback(func: RemoveMarkerCallbackFunction) {
    this.#removeMarkerCallbacks.add(func)
  }

  addEndedCallback(func: EndedCallbackFunction) {
    this.#endedCallbacks.add(func)
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  start(x: number, y: number, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.#planeRaycaster.hasColided || this.#isStarted) {
      return false
    }

    const itemClicked = this.#markerRaycaster.colidedColiders.some(item => item.uuid === this.#itemMarker?.coliders[0].uuid)
    const myMarkersClicked =
      this.#handlingMarkers.some(marker => 
        this.#markerRaycaster.colidedColiders.find(item =>
          marker.coliders.find(colider => item.uuid === colider.uuid)
        )
      ) ||
      itemClicked

    if (this.#mounted) {
      if (!myMarkersClicked) {
        this.#handlingMarkers.forEach(marker => {
          this.#removeMarkerCallbacks.call(marker)
          marker.markerCoordinates.forEach(coord => this.#renderer.removeItem(coord))
        })
        this.#handlingMarkers = []
        if (this.#itemMarker) this.#itemMarker.coliders.forEach(colider => colider.enabled = true)

        this.#mounted = false
      }

      return false
    } else if (this.#markerRaycaster.colidedColiders.length > 0) {
      return false
    }

    if (!this.#generatedItem) {
      const item = new Item()
      this.#generatedItem = item
      const coordinateForRendering = new Coordinate()
      item.parentCoordinate.addChild(coordinateForRendering)

      const renderingObject = this.makeRenderingObject()
      this.#renderer.addItem(coordinateForRendering, renderingObject)
      renderingObject.material.setOpacity(0.7)

      this.#itemMarker = new BoxMarker(renderingObject.size)
      const itemMarker = this.#itemMarker
      const proxyHandler = new ProxyHandler(this.#markerRaycaster, itemMarker.coliders)
      itemMarker.setParentCoordinate(item.parentCoordinate)
      itemMarker.addHandler(proxyHandler)
      this.#addMarkerCallbacks.call(itemMarker)

      proxyHandler.setStartedCallback(() => {
        if (this.#mounted) return

        this.#mounted = true

        itemMarker.coliders.forEach(colider => colider.enabled = false)

        const startingHookFn = () => !yzRotateHandler.isStart && !xyRotateHandler.isStart && !xzRotateHandler.isStart && !xyzHandlers.some(handler => handler.isStart)

        const xzMarker = new RotateMarker(2, [0, 0, 0], [0, 1, 0])
        const yzMarker = new RotateMarker(2, [0, 0, 0], [1, 0, 0])
        const xyMarker = new RotateMarker(2, [0, 0, 0], [0, 0, 1])
        xzMarker.setParentCoordinate(item.parentCoordinate)
        xzMarker.attachRenderingObject<T>({r: 255, g: 0, b: 255}, this.#renderingObjectBuilder, this.#renderer)
        yzMarker.setParentCoordinate(item.parentCoordinate)
        yzMarker.attachRenderingObject<T>({r: 0, g: 255, b: 255}, this.#renderingObjectBuilder, this.#renderer)
        xyMarker.setParentCoordinate(item.parentCoordinate)
        xyMarker.attachRenderingObject<T>({r: 255, g: 255, b: 0}, this.#renderingObjectBuilder, this.#renderer)

        const marker = new CenterMarker(0.5)
        marker.setParentCoordinate(item.parentCoordinate)
        marker.attachRenderingObject({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, this.#renderer)

        const xzRotateHandler = new RotateHandler(xzMarker.parentCoordinate, this.#markerRaycaster, [0, 1, 0], xzMarker.coliders[0])
        const yzRotateHandler = new RotateHandler(yzMarker.parentCoordinate, this.#markerRaycaster, [1, 0, 0], yzMarker.coliders[0])
        const xyRotateHandler = new RotateHandler(xyMarker.parentCoordinate, this.#markerRaycaster, [0, 0, 1], xyMarker.coliders[0])
        xzRotateHandler.setStartingCallback(startingHookFn)
        yzRotateHandler.setStartingCallback(startingHookFn)
        xyRotateHandler.setStartingCallback(startingHookFn)
        xzMarker.addHandler(xzRotateHandler)
        yzMarker.addHandler(yzRotateHandler)
        xyMarker.addHandler(xyRotateHandler)

        const xyzMarker = new CoordinateMarker(3, 0.1)
        const xyzHandlers = [
          new DirectionalMoveHandler(item.parentCoordinate, [1, 0, 0], 0.1),
          new DirectionalMoveHandler(item.parentCoordinate, [0, 1, 0], 0.1),
          new DirectionalMoveHandler(item.parentCoordinate, [0, 0, 1], 0.1)
        ]
        xyzMarker.addHandlers(xyzHandlers[0], xyzHandlers[1], xyzHandlers[2])
        xyzMarker.attachRenderingObject(this.#renderingObjectBuilder, this.#renderer)
        xyzMarker.setParentCoordinate(item.parentCoordinate)
        xyzHandlers.forEach(handler => handler.setStartedCallback(startingHookFn))

        const moveHandler = new PlaneMoveHandler(marker.parentCoordinate, this.#planeRaycaster, this.#markerRaycaster, marker.coliders)
        marker.addHandler(moveHandler)

        this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], [])]))

        this.#handlingMarkers = [
          xzMarker,
          yzMarker,
          xyMarker,
          xyzMarker,
          marker
        ]

        this.#addMarkerCallbacks.call(xzMarker)
        this.#addMarkerCallbacks.call(yzMarker)
        this.#addMarkerCallbacks.call(xyMarker)
        this.#addMarkerCallbacks.call(xyzMarker)
        this.#addMarkerCallbacks.call(marker)
      })
    } else {
      return false
    }

    this.#startedCallbacks.call()

    this.#isStarted = true
    return true
  }

  move() {
    // noop
  }

  end() {
    this.#isStarted = false
    this.#endedCallbacks.call()
  }

  private makeRenderingObject() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    return this.original.renderingObject.clone() as T
  }
}

export class MeshItemGeneratorFactory<T extends RenderingObject> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new MeshItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)

    return generator
  }
}
