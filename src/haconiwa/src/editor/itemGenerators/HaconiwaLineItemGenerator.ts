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
import { Coordinates } from "../../../../lib/Coordinates.js"
import { VectorArray3 } from "../../../../lib/Matrix.js"
import { LineItemGenerator } from "../../../../lib/itemGenerators/lineItemGenerator/LineItemGenerator.js"
import { ThreeRenderingObjectBuilder } from "../../../../lib/threeAdapter/ThreeRenderingObjectBuilder.js"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder.js"

export class HaconiwaLineItemGenerator<T extends Clonable<T>> implements HaconiwaItemGenerator<T> {
  #itemGenerator: LineRenderingItemGenerator<T>
  #lineItemGenerator: LineItemGenerator<Coordinate, T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #raycaster: Raycaster
  #generatedItem: Item | null = null
  #renderingObjectBuilder: RenderingObjectBuilder<T>
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  constructor(renderer: Renderer<T>, raycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) {
    this.#raycaster = raycaster
    this.#lineItemGenerator = new LineItemGenerator<Coordinate, T>(new LineSegmentGenerator(), () => this.itemFactory(), 1)
    this.#itemGenerator = new LineRenderingItemGenerator(this.#lineItemGenerator, renderer)
    this.#renderingObjectBuilder = renderingObjectBuilder
  }

  get isStart() {
    return this.#itemGenerator.isStart
  }

  registerOnGeneratedCallback(func: HaconiwaItemGeneratedCallback<T>) {
    this.#onGeneratedCallbacks.push(func) 
  }

  setOriginal(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  start() {
    if (!this.#raycaster.hasColided) return

    this._start(this.#raycaster.colidedDetails[0].position)
  }

  protected _start(pos: VectorArray3) {
    this.#itemGenerator.start(this.#raycaster.colidedDetails[0].position)
  }

  move() {
    if (!this.#raycaster.hasColided) return

    this.#itemGenerator.move(this.#raycaster.colidedDetails[0].position)
  }

  end() {
    this.#itemGenerator.end()

    const item = new Item()
    this.#generatedItem = item
    this.#itemGenerator.generated.forEach(generatedItem => {
      this.#generatedItem?.parentCoordinate.addChild(generatedItem.item)
    })

    const markers = this.#lineItemGenerator.line?.controlPoints.map(point => {
      const marker = new CenterMarker(0.2)
      marker.parentCoordinate.position = point
      marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, this.#renderingObjectBuilder, this.#itemGenerator.renderer)
      const handler = new PlaneMoveHandler(marker.parentCoordinate, [1, 0, 0], [0, 0, 1], 0.1)
      marker.setHandler(handler)
      const generator = new HaconiwaLineItemGenerator(this.#itemGenerator.renderer, this.#raycaster, this.#renderingObjectBuilder)

      generator._start(point)

      return marker
    }) || []

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], markers)]))
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
