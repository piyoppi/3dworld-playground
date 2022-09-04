import { Item } from "../../../../lib/Item.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineRenderingItemGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/LineRenderingItemGenerator.js'
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type { Clonable } from "../../clonable"
import type { HaconiwaItemGenerator, HaconiwaItemGeneratorFactory, HaconiwaItemGeneratorClonedItem, HaconiwaItemGeneratedCallback } from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { HaconiwaWorldItem } from "../../world.js"
import { CenterMarker } from "../../../../lib/markers/CenterMarker.js"
import { PlaneMoveHandler } from "../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { Vec3 } from "../../../../lib/Matrix.js"
import { LineItemGenerator } from "../../../../lib/itemGenerators/lineItemGenerator/LineItemGenerator.js"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { Marker } from "../../../../lib/markers/Marker.js"
import { MouseButton, MouseControllableCallbackFunction } from "../../../../lib/mouse/MouseControllable.js"
import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import { CursorSnapColiderModifier } from "../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"

export class HaconiwaLineItemGenerator<T extends Clonable<T>> implements HaconiwaItemGenerator<T> {
  #itemGenerator: LineRenderingItemGenerator<T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #raycaster: Raycaster
  #markerRaycaster: Raycaster
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null
  #isStarted = false

  #markers: Array<Marker> = []

  constructor(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#raycaster = raycaster
    this.#markerRaycaster = markerRaycaster
    this.#itemGenerator = new LineRenderingItemGenerator(renderer)
    this.#renderingObjectBuilder = renderingObjectBuilder
  }

  get isStart() {
    return this.#isStarted
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

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  start(x: number, y: number, button: MouseButton, cameraCoordinate: Coordinate) {
    if (!this.#raycaster.hasColided || this.#isStarted) return
    this.#isStarted = true

    const lineGenerator = new LineSegmentGenerator()
    const startPosition = this.#markerRaycaster.colidedDetails[0]?.colider.parentCoordinate?.position || this.#raycaster.colidedDetails[0].position
    lineGenerator.setStartPosition(startPosition)

    lineGenerator.setEndPosition(this.#raycaster.colidedDetails[0].position)

    const lineItemGenerator = new LineItemGenerator<Coordinate, T>(() => this.itemFactory(), 1)
    const item = new Item()
    const line = lineGenerator.getLine()

    this.#markers = line.controlPoints.map((point, index) => {
      const marker = new CenterMarker(0.5)
      const handler = new PlaneMoveHandler(marker.parentCoordinate, this.#raycaster)
      const controlHandle = marker.setHandler(handler)
      handler.setCursorModifier(new CursorSnapColiderModifier(this.#markerRaycaster, [controlHandle.colider]))
      marker.parentCoordinate.position = point
      marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, this.#itemGenerator.renderer)
      marker.parentCoordinate.setUpdateCallback(() => {
        this.#isStarted = true
        line.setControlPoint(index, marker.parentCoordinate.position)
        const generated = lineItemGenerator.update(line)
        this.#itemGenerator.update(generated, item.parentCoordinate)
      })
      return marker
    }) || []

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], this.#markers)]))

    this.#startedCallbacks.call()

    this.#markers[1]?.handler?.start(x, y, button, cameraCoordinate)

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

export class HaconiwaLineItemGeneratorFactory<T extends Clonable<T>> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, initialClonedItem: HaconiwaItemGeneratorClonedItem<T>, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new HaconiwaLineItemGenerator(renderer, raycaster, markerRaycaster, renderingObjectBuilder)
    generator.setOriginal(initialClonedItem)

    return generator
  }
}
