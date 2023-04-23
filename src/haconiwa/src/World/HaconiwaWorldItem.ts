import { Colider } from "../../../lib/Colider.js"
import { Item } from "../../../lib/Item.js"
import type { Renderer } from "../../../lib/Renderer"
import type { Raycaster } from "../../../lib/Raycaster"
import type { Marker } from "../../../lib/markers/Marker"
import { VectorArray3 } from "../../../lib/Matrix"

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

  get original() {
    return this.#item
  }

  get uuid() {
    return this.#item.uuid
  }

  set position(position: VectorArray3) {
    this.#item.parentCoordinate.position = position
  }

  get position() {
    return this.#item.parentCoordinate.position
  }

  removeTargetColider(raycaster: Raycaster) {
    this.#coliders.forEach(colider => raycaster.removeTarget(colider))
  }

  removeRenderingItem<T>(renderer: Renderer<T>) {
    renderer.removeItem(this.#item.parentCoordinate)
  }

  dispose() {
    this.#item.dispose()
  }
}
