import type { Item } from "../../../lib/Item"
import type { MouseControllable } from "../../../lib/mouse/MouseControllable"
import type { Raycaster } from "../../../lib/Raycaster"
import type { Renderer } from "../../../lib/Renderer"
import { LineItemGeneratorAdapter } from '../../../lib/itemGenerators/lineItemGenerator/LineItemGeneratorAdapter.js'
import { LineSegmentGenerator } from '../../../lib/itemGenerators/lineItemGenerator/lineGenerator/LineSegmentGenerator.js'
import type { Clonable } from "../clonable"
import { GeneratedItem } from "../../../lib/itemGenerators/ItemGenerator"

export interface HaconiwaItemGenerator<T> {
  setItem: (item: Item, renderingObject: T) => void
  registerOnGeneratedCallback: (callback: HaconiwaItemGeneratedCallback<T>) => void
}

export type HaconiwaItemGeneratedCallback<T> = (generates: Array<GeneratedItem<Item, T>>) => void

export class HaconiwaLineItemGenerator<T extends Clonable<T>> implements HaconiwaItemGenerator<T>, MouseControllable {
  #itemGenerator: LineItemGeneratorAdapter<T>
  #original: {
    item: Item,
    renderingObject: T
  } | null = null
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []

  constructor(renderer: Renderer<T>, raycaster: Raycaster) {
    this.#itemGenerator = new LineItemGeneratorAdapter(new LineSegmentGenerator(), this.itemFactory, renderer, 1, raycaster)
  }

  get isStart() {
    return this.#itemGenerator.isStart
  }

  registerOnGeneratedCallback(func: HaconiwaItemGeneratedCallback<T>) {
    this.#onGeneratedCallbacks.push(func) 
  }

  setItem(item: Item, renderingObject: T) {
    this.#original = {item, renderingObject}
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
    if (!this.#original) throw new Error('Item and RenderingObject is not set.')

    const renderingObject = this.#original.renderingObject.clone()
    const item = this.#original.item.clone()
  
    return {item, renderingObject}
  }
}
