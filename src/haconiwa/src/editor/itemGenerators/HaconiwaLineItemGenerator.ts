import { LineItem, LineItemConnection } from "../../../../lib/LineItem.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineRenderingItemGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/LineRenderingItemGenerator.js'
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type {
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGeneratorClonedItem,
  HaconiwaItemGeneratedCallback,
  HaconiwaItemGeneratorLineConnectable,
  HaconiwaItemGeneratorItemClonable,
  AddMarkerCallbackFunction,
  RemoveMarkerCallbackFunction,
  EndedCallbackFunction
} from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { HaconiwaWorldItem } from "../../world.js"
import { LineItemGenerator } from "../../../../lib/itemGenerators/lineItemGenerator/LineItemGenerator.js"
import type { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { MouseButton, MouseControllableCallbackFunction } from "../../../../lib/mouse/MouseControllable.js"
import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap.js"
import { makeConnectionMarker } from './Helpers/MakeConnectionMarker.js'
import { RenderingObject } from "../../../../lib/RenderingObject.js"

export class HaconiwaLineItemGenerator<T extends RenderingObject> implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorLineConnectable, HaconiwaItemGeneratorItemClonable<T>  {
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null
  #isStarted = false
  #renderer
  #coliderConnectionMap: ColiderItemMap<LineItemConnection> | null = null
  #addMarkerCallbacks = new CallbackFunctions<AddMarkerCallbackFunction>()
  #removeMarkerCallbacks = new CallbackFunctions<RemoveMarkerCallbackFunction>()

  constructor(renderer: Renderer<T>, planeRaycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#planeRaycaster = planeRaycaster
    this.#markerRaycaster = markerRaycaster
    this.#renderingObjectBuilder = renderingObjectBuilder
    this.#renderer = renderer
  }

  get isStart() {
    return this.#isStarted
  }

  setConnectorColiderMap(coliderConnectionMap: ColiderItemMap<LineItemConnection>) {
    this.#coliderConnectionMap = coliderConnectionMap
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  registerOnGeneratedCallback(func: HaconiwaItemGeneratedCallback<T>) {
    this.#onGeneratedCallbacks.push(func)
  }

  addMarkerCallback(func: AddMarkerCallbackFunction) {
    this.#addMarkerCallbacks.add(func)
  }

  removeMarkerCallback(func: RemoveMarkerCallbackFunction) {
    this.#removeMarkerCallbacks.add(func)
  }

  addEndedCallback(func: EndedCallbackFunction) {
    this.#endedCallbacks.add(func)
  }

  start(x: number, y: number, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')
    if (!this.#planeRaycaster.hasColided || !this.#coliderConnectionMap || this.#isStarted) return

    this.#isStarted = true

    const itemGenerator = new LineRenderingItemGenerator(this.#renderer)
    const lineGenerator = new LineSegmentGenerator()
    lineGenerator.setStartPosition(
      this.#markerRaycaster.colidedDetails[0]?.colider.parentCoordinate?.position || this.#planeRaycaster.colidedDetails[0].position
    )
    lineGenerator.setEndPosition(this.#planeRaycaster.colidedDetails[0].position)

    const lineItemGenerator = new LineItemGenerator<Coordinate, T>(() => this.itemFactory(), this.original.renderingObject.size[0])
    const line = lineGenerator.getLine()
    const item = new LineItem(line)
    const markers = makeConnectionMarker(item, this.#markerRaycaster, this.#planeRaycaster, this.#coliderConnectionMap)

    markers.forEach((marker, index) => {
      marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder,this.#renderer)

      marker.parentCoordinate.setUpdateCallback(() => {
        //item.line.setEdge(index, marker.parentCoordinate.position)
        const generated = lineItemGenerator.update(item.line)
        itemGenerator.update(generated, item.parentCoordinate)
      })
    })

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], [])]))
    markers.forEach(marker => this.#addMarkerCallbacks.call(marker))

    this.#startedCallbacks.call()

    markers[1]?.handlers.forEach(handler => handler.start(x, y, button, cameraCoordinate))

    return true
  }

  move() {
    // noop
  }

  end() {
    this.#isStarted = false
    this.#endedCallbacks.call()
  }

  private itemFactory() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    const renderingObject = this.original.renderingObject.clone() as T
  
    return {item: new Coordinate(), renderingObject}
  }
}

export class HaconiwaLineItemGeneratorFactory<T extends RenderingObject> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new HaconiwaLineItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)

    return generator
  }
}
