import { Colider } from "../../lib/Colider.js"
import { Item } from "../../lib/Item.js"
import type { Renderer } from "../../lib/Renderer"
import type { Raycaster } from "../../lib/Raycaster"
import type { MouseHandlers } from "../../lib/mouse/MouseInteractionHandler"
import type { Marker } from "../../lib/markers/Marker"

export class HaconiwaWorld<T> {
  #items: Array<HaconiwaWorldItem<T>> = []
  
  constructor() {

  }

  get items() {
    return this.#items
  }

  addItem(item: HaconiwaWorldItem<T>) {
    this.#items.push(item)
  }
}

export class HaconiwaWorldItem<T> {
  #coliders: Array<Colider>
  #markers: Array<Marker>
  #item: Item
  #disposed = false

  constructor(item: Item, coliders: Array<Colider>, markers: Array<Marker>) {
    this.#item = item
    this.#coliders = coliders
    this.#markers = markers
  }

  dispose(raycaster: Raycaster, renderer: Renderer<T>, mouseHandlers: MouseHandlers) {
    this.#coliders.forEach(colider => raycaster.removeTarget(colider))
    renderer.removeItem(this.#item.parentCoordinate)

    this.#disposed = true
  }
}
