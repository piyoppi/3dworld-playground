import { Coordinate } from "../../../../lib/Coordinate.js"
import { RenderingObject } from "../../../../lib/RenderingObject"
import {
  HaconiwaItemGenerator,
  HaconiwaItemGeneratorItemClonable,
  HaconiwaItemGeneratorFactory,
  HaconiwaItemGeneratorClonedItem,
  HaconiwaItemGeneratedCallback
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

export class MeshItemGenerator<T extends RenderingObject>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorItemClonable<T> {

  private original: HaconiwaItemGeneratorClonedItem<T> | null = null
  #isStarted = false
  #planeRaycaster: Raycaster
  #renderer: Renderer<T>
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  constructor(
    renderer: Renderer<T>,
    planeRaycaster: Raycaster,
    renderingObjectBuilder: RenderingObjectBuilder<T>
  ) {
    this.#planeRaycaster = planeRaycaster
    this.#renderer = renderer
    this.#renderingObjectBuilder = renderingObjectBuilder
  }

  get isStart() {
    return this.#isStarted
  }

  registerOnGeneratedCallback(func: HaconiwaItemGeneratedCallback<T>) {
    this.#onGeneratedCallbacks.push(func)
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  start(x: number, y: number, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.#planeRaycaster.hasColided || this.#isStarted) return

    this.#isStarted = true

    const item = new Item()
    const coordinateForRendering = new Coordinate()
    item.parentCoordinate.addChild(coordinateForRendering)

    const marker = new CenterMarker(2)
    marker.setParentCoordinate(item.parentCoordinate)
    marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, this.#renderer)

    const moveHandler = new PlaneMoveHandler(marker.parentCoordinate, this.#planeRaycaster)
    marker.addHandler(moveHandler)

    this.#renderer.addItem(coordinateForRendering, this.makeRenderingObject())

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], [marker])]))
    this.#startedCallbacks.call()

    return true
  }

  move() {
    // noop
  }

  end() {

  }

  private makeRenderingObject() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    return this.original.renderingObject.clone() as T
  }
}

export class MeshItemGeneratorFactory<T extends RenderingObject> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new MeshItemGenerator(renderer, raycaster, renderingObjectBuilder)

    return generator
  }
}
