import { Colider } from './Colider.js'

export class ColiderItemMap<T> {
  #coliderToItem = new Map<string, T>()

  getItem(colider: Colider) {
    return this.#coliderToItem.get(colider.uuid)
  }

  add(colider: Colider, item: T) {
    console.log(item)
    this.#coliderToItem.set(colider.uuid, item)
  }

  remove(obj: Colider) {
    this.#coliderToItem.delete(obj.uuid)
  }
}
