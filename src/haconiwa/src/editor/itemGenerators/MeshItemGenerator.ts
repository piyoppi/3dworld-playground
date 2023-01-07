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
import { BoxMarker } from "../../../../lib/markers/BoxMarker.js"
import { ProxyHandler } from "../../../../lib/mouse/handlers/ProxyHandler.js"
import { Marker, MarkerRenderable } from "../../../../lib/markers/Marker.js"
import { makeCoordinateMover } from "../../../../lib/markers/generators/CoordinateMover.js"

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

  get generated() {
    return !!this.#generatedItem
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
      this.#handlingMarkers.some(handlingMarker =>
        this.#markerRaycaster.colidedColiders.some(colidedColider =>
          handlingMarker.coliders.some(markersColider => colidedColider.uuid === markersColider.uuid)
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

        this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], [])]))

        const markers = makeCoordinateMover(this.#planeRaycaster, this.#markerRaycaster, item.parentCoordinate, this.#renderingObjectBuilder, this.#renderer)
        markers.forEach(marker => this.#addMarkerCallbacks.call(marker))
        this.#handlingMarkers = markers
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
  #original: HaconiwaItemGeneratorClonedItem<T>

  constructor(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.#original = original
  }

  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new MeshItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)
    generator.setOriginal(this.#original)

    return generator
  }
}
