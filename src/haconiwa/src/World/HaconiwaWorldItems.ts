import { HaconiwaWorldItem } from './HaconiwaWorldItem.js'

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

    this.#items[index].dispose()

    this.#items.splice(index, 1)
  }

  clear() {
    this.#items = []
  }

  forEach(callback: (item: HaconiwaWorldItem) => void) {
    this.#items.forEach(item => callback(item))
  }
}

