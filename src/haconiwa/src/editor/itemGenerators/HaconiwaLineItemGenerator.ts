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

export class HaconiwaLineItemGenerator<T extends Clonable<T>> implements HaconiwaItemGenerator<T> {
  #itemGenerator: LineRenderingItemGenerator<T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  constructor(renderer: Renderer<T>, raycaster: Raycaster) {
    this.#itemGenerator = new LineRenderingItemGenerator(new LineSegmentGenerator(), () => this.itemFactory(), renderer, 1, raycaster)
  }

  get isStart() {
    return this.#itemGenerator.isStart
  }

  registerOnGeneratedCallback(func: HaconiwaItemGeneratedCallback<T>) {
    this.#onGeneratedCallbacks.push(func) 
  }

  setItem(original: HaconiwaItemGeneratorClonedItem<T>) {
    this.original = original
  }

  start(x: number, y: number) {
    this.#itemGenerator.start(x, y)
  }

  move(x: number, y: number) {
    this.#itemGenerator.move(x, y)
  }

  end() {
    this.#itemGenerator.end()

    const item = new Item()
    this.#itemGenerator.generated.forEach(generatedItem => {
      item.parentCoordinate.addChild(generatedItem.item)
    })

    const marker = new CenterMarker(0.1)

    this.#onGeneratedCallbacks.forEach(func => func([new HaconiwaWorldItem(item, [], [])]))
  }

  private itemFactory() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    const renderingObject = this.original.renderingObject.clone()
  
    return {item: new Coordinate(), renderingObject}
  }
}

export class HaconiwaLineItemGeneratorFactory<T extends Clonable<T>> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, initialClonedItem: HaconiwaItemGeneratorClonedItem<T>) {
    const generator = new HaconiwaLineItemGenerator(renderer, raycaster)
    generator.setItem(initialClonedItem)

    return generator
  }
}
