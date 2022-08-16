import { Item } from "../../../../lib/Item.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineRenderingItemGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/LineItemGeneratorAdapter.js'
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type { Clonable } from "../../clonable"
import type { HaconiwaItemGenerator, HaconiwaItemGeneratorFactory, HaconiwaItemGeneratorClonedItem, HaconiwaItemGeneratedCallback } from "./HaconiwaItemGenerator"
import { Coordinate } from "../../../../lib/Coordinate.js"

export class HaconiwaLineItemGenerator<T extends Clonable<T>> implements HaconiwaItemGenerator<T> {
  #itemGenerator: LineRenderingItemGenerator<T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<Item>> = []
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  constructor(renderer: Renderer<T>, raycaster: Raycaster) {
    this.#itemGenerator = new LineRenderingItemGenerator(new LineSegmentGenerator(), () => this.itemFactory(), renderer, 1, raycaster)
  }

  get isStart() {
    return this.#itemGenerator.isStart
  }

  registerOnGeneratedCallback(func: HaconiwaItemGeneratedCallback<Item>) {
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

    this.#onGeneratedCallbacks.forEach(func => func([item]))
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
