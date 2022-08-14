import { Item } from "../../lib/Item.js"

export class HaconiwaWorld {
  #items: Array<Item> = []
  
  constructor() {

  }

  get items() {
    return this.#items
  }

  addItem(item: Item) {
    this.#items.push(item)
  }
}
