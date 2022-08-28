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
import { PlaneMoveHandler } from "../../../../lib/markers/handlers/PlaneMoveHandler.js"
import { Vec3 } from "../../../../lib/Matrix.js"
import { LineItemGenerator } from "../../../../lib/itemGenerators/lineItemGenerator/LineItemGenerator.js"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"
import { Marker } from "../../../../lib/markers/Marker.js"
import { LineGenerator } from "../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineGenerator.js"
import { MouseButton, MouseControllableCallbackFunction } from "../../../../lib/mouse/MouseControllable.js"
import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"

export class HaconiwaLineItemGenerator<T extends Clonable<T>> implements HaconiwaItemGenerator<T> {
  #itemGenerator: LineRenderingItemGenerator<T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #raycaster: Raycaster
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  #markers: Array<Marker> = []

  constructor(renderer: Renderer<T>, raycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#raycaster = raycaster
    this.#itemGenerator = new LineRenderingItemGenerator(renderer)
    this.#renderingObjectBuilder = renderingObjectBuilder
  }

  get isStart() {
    return false
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
    if (!this.#raycaster.hasColided) return

    const lineGenerator = new LineSegmentGenerator()
    lineGenerator.setStartPosition(this.#raycaster.colidedDetails[0].position)
    lineGenerator.setEndPosition(Vec3.add([1, 0, 0], this.#raycaster.colidedDetails[0].position))

    const lineItemGenerator = new LineItemGenerator<Coordinate, T>(() => this.itemFactory(), 1)
    const item = new Item()
    const line = lineGenerator.getLine()

    this.#markers = line.controlPoints.map((point, index) => {
      const marker = new CenterMarker(0.2)
      const handler = new PlaneMoveHandler(marker.parentCoordinate, [1, 0, 0], [0, 0, 1], 0.1)
      marker.parentCoordinate.position = point
      marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, this.#itemGenerator.renderer)
      marker.setHandler(handler)
      marker.parentCoordinate.setUpdateCallback(() => {
        line.setControlPoint(index, marker.parentCoordinate.position)
        const generated = lineItemGenerator.update(line)
        this.#itemGenerator.update(generated, item.parentCoordinate)
      })
      return marker
    }) || []

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], this.#markers)]))

    this.#markers[0]?.handler?.start(x, y, button, cameraCoordinate)

    this.#startedCallbacks.call()
  }

  move() {
    // noop
  }

  end() {
    // noop
  }

  private itemFactory() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    const renderingObject = this.original.renderingObject.clone()
  
    return {item: new Coordinate(), renderingObject}
  }
}

export class HaconiwaLineItemGeneratorFactory<T extends Clonable<T>> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, initialClonedItem: HaconiwaItemGeneratorClonedItem<T>, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    const generator = new HaconiwaLineItemGenerator(renderer, raycaster, renderingObjectBuilder)
    generator.setOriginal(initialClonedItem)

    return generator
  }
}
