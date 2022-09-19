import type { Item } from "../../../../lib/Item"
import type { Renderer } from "../../../../lib/Renderer"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Clonable } from "../../clonable"
import type { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import type { HaconiwaWorldItem } from "../../world"
import type { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap"
import type { LineItemConnection } from "../../../../lib/LineItem"

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

export interface HaconiwaItemGeneratorLineConnectable {
  setConnectorColiderMap: (coliderConnectionMap: ColiderItemMap<LineItemConnection>) => void
}

export function isHaconiwaItemGeneratorLineConnectable(arg: any): arg is HaconiwaItemGeneratorLineConnectable {
  return 'setConnectorColiderMap' in arg
}
