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
import { DirectionalMarker } from "../../../../lib/markers/DirectionalMarker.js"
import { DirectionalMoveHandler } from "../../../../lib/mouse/handlers/DirectionalMoveHandler.js"
import { RotateHandler } from "../../../../lib/mouse/handlers/RotateHandler.js"
import { RotateMarker } from "../../../../lib/markers/RotateMarker.js"
import { PlaneColider } from "../../../../lib/Colider.js"

export class MeshItemGenerator<T extends RenderingObject>
  implements HaconiwaItemGenerator<T>, HaconiwaItemGeneratorItemClonable<T> {

  private original: HaconiwaItemGeneratorClonedItem<T> | null = null
  #isStarted = false
  #planeRaycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderer: Renderer<T>
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

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

    const xzRotateHandler = new RotateHandler(xzMarker.parentCoordinate, this.#markerRaycaster, [0, 1, 0], xzMarker.colider)
    const yzRotateHandler = new RotateHandler(yzMarker.parentCoordinate, this.#markerRaycaster, [1, 0, 0], yzMarker.colider)
    const xyRotateHandler = new RotateHandler(xyMarker.parentCoordinate, this.#markerRaycaster, [0, 0, 1], xyMarker.colider)
    xzRotateHandler.setStartingCallback(() => !yzRotateHandler.isStart && !xyRotateHandler.isStart)
    yzRotateHandler.setStartingCallback(() => !xzRotateHandler.isStart && !xyRotateHandler.isStart)
    xyRotateHandler.setStartingCallback(() => !xzRotateHandler.isStart && !yzRotateHandler.isStart)
    xzMarker.addHandler(xzRotateHandler)
    yzMarker.addHandler(yzRotateHandler)
    xyMarker.addHandler(xyRotateHandler)

    const moveHandler = new PlaneMoveHandler(marker.parentCoordinate, this.#planeRaycaster, this.#markerRaycaster, marker.colider)
    marker.addHandler(moveHandler)

    const renderingObject = this.makeRenderingObject()
    this.#renderer.addItem(coordinateForRendering, renderingObject)
    renderingObject.material.setOpacity(0.7)

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], [xzMarker, yzMarker, xyMarker, marker])]))
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
    const generator = new MeshItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)

    return generator
  }
}
