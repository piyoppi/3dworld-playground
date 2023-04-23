import { HaconiwaWorldItem } from './HaconiwaWorldItem.js'
import { HaconiwaWorldItems } from './HaconiwaWorldItems.js'

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

