import type { Item } from "../../../../lib/Item"
import type { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Renderer } from "../../../../lib/Renderer"
import { LineItemGeneratorAdapter } from '../../../../lib/itemGenerators/lineItemGenerator/LineItemGeneratorAdapter.js'
import { LineSegmentGenerator } from '../../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type { Clonable } from "../../clonable"
import type { HaconiwaItemGenerator, HaconiwaItemGeneratorFactory, HaconiwaItemGeneratorClonedItem, HaconiwaItemGeneratedCallback } from "./HaconiwaItemGenerator"

export class HaconiwaLineItemGenerator<T extends Clonable<T>> implements HaconiwaItemGenerator<T> {
  #itemGenerator: LineItemGeneratorAdapter<T>
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  private original: HaconiwaItemGeneratorClonedItem<T> | null = null

  constructor(renderer: Renderer<T>, raycaster: Raycaster) {
    this.#itemGenerator = new LineItemGeneratorAdapter(new LineSegmentGenerator(), () => this.itemFactory(), renderer, 1, raycaster)
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
    this.#onGeneratedCallbacks.forEach(func => func(this.#itemGenerator.generated))
  }

  private itemFactory() {
    if (!this.original) throw new Error('Item and RenderingObject is not set.')

    const renderingObject = this.original.renderingObject.clone()
    const item = this.original.item.clone()
  
    return {item, renderingObject}
  }
}

export class HaconiwaLineItemGeneratorFactory<T extends Clonable<T>> implements HaconiwaItemGeneratorFactory<T> {
  create(renderer: Renderer<T>, raycaster: Raycaster, initialClonedItem: HaconiwaItemGeneratorClonedItem<T>) {
    const generator = new HaconiwaLineItemGenerator(renderer, raycaster)
    generator.setItem(initialClonedItem)

    return generator
  }
}
