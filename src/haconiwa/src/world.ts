import { Colider } from "../../lib/Colider.js"
import { Item } from "../../lib/Item.js"
import type { Renderer } from "../../lib/Renderer"
import type { Raycaster } from "../../lib/Raycaster"
import type { MouseControlHandles } from "../../lib/mouse/MouseControlHandles"
import type { Marker } from "../../lib/markers/Marker"

export class HaconiwaWorld {
  #items = new HaconiwaWorldItems()
  
  constructor() {

  }

  get items() {
    return this.#items
  }

  addItem(item: HaconiwaWorldItem) {
    this.#items.add(item)
  }

  removeItem(item: HaconiwaWorldItem) {
    this.#items.remove(item)
  }
}

export class HaconiwaWorldItems {
  #items: Array<HaconiwaWorldItem> = []

  add(item: HaconiwaWorldItem) {
    if (this.#items.find(registered => registered.uuid === item.uuid)) {
      throw new Error('The item is already registered.')
    }

    this.#items.push(item)
  }

  remove(item: HaconiwaWorldItem) {
    const index = this.#items.findIndex(registered => registered.uuid === item.uuid)

    if (index < 0) return

    this.#items.splice(index, 1)
  }

  clear() {
    this.#items = []
  }

  forEach(callback: (item: HaconiwaWorldItem) => void) {
    this.#items.forEach(item => callback(item))
  }
}

export class HaconiwaWorldItem {
  #coliders: Array<Colider>
  #markers: Array<Marker>
  #item: Item

  constructor(item: Item, coliders: Array<Colider>, markers: Array<Marker>) {
    this.#item = item
    this.#coliders = coliders
    this.#markers = markers
  }

  get markers() {
    return this.#markers
  }

  get item() {
    return this.#item
  }

  get uuid() {
    return this.#item.uuid
  }

  removeTargetColider(raycaster: Raycaster) {
    this.#coliders.forEach(colider => raycaster.removeTarget(colider))
  }

  removeRenderingItem<T>(renderer: Renderer<T>) {
    renderer.removeItem(this.#item.parentCoordinate)
  }
}
