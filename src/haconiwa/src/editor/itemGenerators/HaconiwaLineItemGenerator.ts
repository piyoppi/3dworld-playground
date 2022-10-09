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
  HaconiwaItemGeneratorItemClonable
} from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { HaconiwaWorldItem } from "../../world.js"
import { LineItemGenerator } from "../../../../lib/itemGenerators/lineItemGenerator/LineItemGenerator.js"
import type { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { MouseButton, MouseControllableCallbackFunction } from "../../../../lib/mouse/MouseControllable.js"
import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap.js"
import { makeConnectionMarker } from './MakeConnectionMarker.js'
import { RenderingObject } from "../../../../lib/RenderingObject.js"

export class HaconiwaLineItemGenerator<T extends RenderingObject<T>> implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorLineConnectable, HaconiwaItemGeneratorItemClonable<T>  {
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

  start(x: number, y: number, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')
    if (!this.#planeRaycaster.hasColided || this.#isStarted) return

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
    const markers = makeConnectionMarker(item, this.#renderer, this.#renderingObjectBuilder, this.#markerRaycaster, this.#planeRaycaster, this.#coliderConnectionMap)

    markers.forEach((marker, index) => {
      marker.parentCoordinate.setUpdateCallback(() => {
        item.line.setEdge(index, marker.parentCoordinate.position)
        const generated = lineItemGenerator.update(item.line)
        itemGenerator.update(generated, item.parentCoordinate)
      })
    })

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], markers)]))

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

    const renderingObject = this.original.renderingObject.clone()
  
    return {item: new Coordinate(), renderingObject}
  }
}

export class HaconiwaLineItemGeneratorFactory<T extends RenderingObject<T>> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new HaconiwaLineItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)

    return generator
  }
}
