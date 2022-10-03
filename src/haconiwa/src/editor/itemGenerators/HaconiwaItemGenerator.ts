import type { Item } from "../../../../lib/Item"
import type { Renderer } from "../../../../lib/Renderer"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { Clonable } from "../../clonable"
import type { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import type { HaconiwaWorldItem } from "../../world"
import type { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap"
import type { LineItemConnection } from "../../../../lib/LineItem"
import { RenderingObject } from "../../../../lib/RenderingObject"

export interface HaconiwaItemGenerator<T extends RenderingObject<T>> extends MouseControllable {
  registerOnGeneratedCallback: (callback: HaconiwaItemGeneratedCallback<T>) => void
}


export type HaconiwaItemGeneratedCallback<T extends RenderingObject<T>> = (generates: Array<HaconiwaWorldItem<T>>) => void
export type HaconiwaItemGeneratorClonedItem<T> = {
  item: Item,
  renderingObject: T
}

export interface HaconiwaItemGeneratorFactory<T extends RenderingObject<T>> {
  create: (renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) => HaconiwaItemGenerator<T>
}

export interface HaconiwaItemGeneratorLineConnectable {
  setConnectorColiderMap: (coliderConnectionMap: ColiderItemMap<LineItemConnection>) => void
}

export interface HaconiwaItemGeneratorItemClonable<T extends RenderingObject<T>> {
  setOriginal: (orignal: HaconiwaItemGeneratorClonedItem<T>) => void
}

export function isHaconiwaItemGeneratorLineConnectable(arg: any): arg is HaconiwaItemGeneratorLineConnectable {
  return 'setConnectorColiderMap' in arg
}
export function isHaconiwaItemGeneratorItemClonable<T extends RenderingObject<T>>(arg: any): arg is HaconiwaItemGeneratorItemClonable<T> {
  return 'setOriginal' in arg
}
