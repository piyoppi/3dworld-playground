import { Colider } from "../../lib/Colider.js"
import { Item } from "../../lib/Item.js"

export class HaconiwaWorld {
  #items: Array<HaconiwaWorldItem> = []
  
  constructor() {

  }

  get items() {
    return this.#items
  }

  addItem(item: HaconiwaWorldItem) {
    this.#items.push(item)
  }
}

export class HaconiwaWorldItem {
  #coliders: Array<Colider>
  #item: Item

  constructor(item: Item, coliders: Array<Colider> = []) {
    this.#item = item
    this.#coliders = coliders
  }
}
