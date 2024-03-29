import { Coordinate } from "../../../../lib/Coordinate.js"
import { RenderingObject } from "../../../../lib/RenderingObject"
import {
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorItemClonable,
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGeneratorClonedItem,
} from './HaconiwaItemGenerator'
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { Item } from "../../../../lib/Item.js"
import { BoxMarker } from "../../../../lib/markers/BoxMarker.js"
import { ProxyHandler } from "../../../../lib/mouse/handlers/ProxyHandler.js"
import { Marker, MarkerRenderable } from "../../../../lib/markers/Marker.js"
import { makeCoordinateMover } from "../../../../lib/markers/generators/CoordinateMover.js"
import { CreateParams, HaconiwaItemGeneratorBase } from "./HaconiwaItemGeneratorBase.js"

export class MeshItemGenerator<T extends RenderingObject>
  extends HaconiwaItemGeneratorBase<T>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorItemClonable<T> {

  private original: HaconiwaItemGeneratorClonedItem<T> | null = null
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderer: Renderer<T>
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #handlingMarkers: Array<Marker & MarkerRenderable> = []
  #itemMarker: BoxMarker | null = null

  constructor(
    renderer: Renderer<T>,
    planeRaycaster: Raycaster,
    markerRaycaster: Raycaster,
    renderingObjectBuilder: RenderingObjectBuilder<T>
  ) {
    super(markerRaycaster)

    this.#planeRaycaster = planeRaycaster
    this.#markerRaycaster = markerRaycaster
    this.#renderer = renderer
    this.#renderingObjectBuilder = renderingObjectBuilder
  }

  get mounted() {
    return this.#handlingMarkers.length > 0
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  create({selected, registerItem}: CreateParams) {
   // if (!this.#planeRaycaster.colided || this.generated) {
   //   return false
   // }

   // const item = new Item()
   // registerItem(item)

   // const coordinateForRendering = new Coordinate()
   // item.parentCoordinate.addChild(coordinateForRendering)
   // item.parentCoordinate.position = this.#planeRaycaster.colidedDetails[0].position

   // const renderingObject = this.makeRenderingObject()
   // this.#renderer.addItem(coordinateForRendering, renderingObject)
   // renderingObject.material.setOpacity(0.4)

   // this.#itemMarker = new BoxMarker(renderingObject.size, item.parentCoordinate)
   // const itemMarker = this.#itemMarker
   // const proxyHandler = new ProxyHandler(this.#markerRaycaster.getReadonly(), itemMarker.coliders)
   // itemMarker.addHandler(proxyHandler)
   // this.registerMarker(itemMarker)

   // proxyHandler.setStartedCallback(() => {
   //   if (this.mounted) return

   //   itemMarker.coliders.forEach(colider => colider.enabled = false)

   //   const markers = makeCoordinateMover(this.#planeRaycaster, this.#markerRaycaster, item.parentCoordinate, this.#renderingObjectBuilder, this.#renderer)
   //   markers.forEach(marker => this.registerMarker(marker))
   //   this.#handlingMarkers = markers

   //   selected()
   // })

    return true
  }

  unselect() {
    this.removeHandlingMarker()
  }

  dispose() {
    if (!this.generated) return

    this.removeHandlingMarker()    
    this.removeItemMarker()
  }

  private removeHandlingMarker() {
    this.#handlingMarkers.forEach(marker => {
      this.removeMarker(marker)
      marker.markerCoordinates.forEach(coord => this.#renderer.removeItem(coord))
    })
    this.#handlingMarkers = []
    if (this.#itemMarker) this.#itemMarker.coliders.forEach(colider => colider.enabled = true)
  }

  private removeItemMarker() {
    if (!this.#itemMarker) return

    this.removeMarker(this.#itemMarker)
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
