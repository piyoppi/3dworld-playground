import { Colider } from './Colider.js'
import { ColiderItemResolver } from './ColiderItemResolver.js'

export class ColiderItemMap<T> {
  #coliderToItem = new Map<string, T>()

  getItem(colider: Colider) {
    return this.#coliderToItem.get(colider.uuid)
  }

  getResolver(): ColiderItemResolver<T> {
    return new ColiderItemResolver(this)
  }

  add(colider: Colider, item: T) {
    this.#coliderToItem.set(colider.uuid, item)
  }

  remove(obj: Colider) {
    this.#coliderToItem.delete(obj.uuid)
  }
}
