import type { Item } from "../../../../lib/Item"
import type { Renderer } from "../../../../lib/Renderer"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Clonable } from "../../clonable"
import type { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import { HaconiwaWorldItem } from "../../world"
import { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder"

export interface HaconiwaItemGenerator<T> extends MouseControllable {
  setOriginal: (original: HaconiwaItemGeneratorClonedItem<T>) => void
  registerOnGeneratedCallback: (callback: HaconiwaItemGeneratedCallback<T>) => void
}

export type HaconiwaItemGeneratedCallback<T> = (generates: Array<HaconiwaWorldItem<T>>) => void
export type HaconiwaItemGeneratorClonedItem<T> = {
  item: Item,
  renderingObject: T
}

export interface HaconiwaItemGeneratorFactory<T extends Clonable<T>> {
  create: (renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, initialClonedItem: HaconiwaItemGeneratorClonedItem<T>, renderingObjectBuilder: RenderingObjectBuilder<T>) => HaconiwaItemGenerator<T>
}
