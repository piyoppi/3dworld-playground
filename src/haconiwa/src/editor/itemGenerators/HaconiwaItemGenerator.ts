import type { Item } from "../../../../lib/Item"
import type { Renderer } from "../../../../lib/Renderer"
import type { Raycaster } from "../../../../lib/Raycaster"
import { GeneratedItem } from "../../../../lib/itemGenerators/ItemGenerator"
import type { Clonable } from "../../clonable"
import type { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import { Coordinate } from "../../../../lib/Coordinate.js"

export interface HaconiwaItemGenerator<T> extends MouseControllable {
  setItem: (original: HaconiwaItemGeneratorClonedItem<T>) => void
  registerOnGeneratedCallback: (callback: HaconiwaItemGeneratedCallback<T>) => void
}

export type HaconiwaItemGeneratedCallback<T> = (generates: Array<Item>) => void
export type HaconiwaItemGeneratorClonedItem<T> = {
  item: Item,
  renderingObject: T
}

export interface HaconiwaItemGeneratorFactory<T extends Clonable<T>> {
  create: (renderer: Renderer<T>, raycaster: Raycaster, initialClonedItem: HaconiwaItemGeneratorClonedItem<T>) => HaconiwaItemGenerator<T>
}
