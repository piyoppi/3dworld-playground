import { Item } from "../../lib/Item.js"

export class HaconiwaWorld {
  #items: Array<Item> = []
  
  constructor() {

  }

  addItem(item: Item) {
    this.#items.push(item)
  }
}
