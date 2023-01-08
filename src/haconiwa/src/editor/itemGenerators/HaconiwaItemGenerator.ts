import type { Item } from "../../../../lib/Item"
import type { Renderer } from "../../../../lib/Renderer"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import type { HaconiwaWorldItem } from "../../world"
import type { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap"
import type { LineItemConnection } from "../../../../lib/LineItem"
import { Marker } from "../../../../lib/markers/Marker"

export type AddMarkerCallbackFunction = (marker: Marker) => void
export type RemoveMarkerCallbackFunction = (marker: Marker) => void
export type EndedCallbackFunction = () => void
export type SelectedCallbackFunction = (item: HaconiwaWorldItem) => void
export type UnselectedCallbackFunction = (item: HaconiwaWorldItem) => void

// 選択アイテムフック
// 削除
export interface HaconiwaItemGenerator<T> extends MouseControllable {
  registerOnGeneratedCallback: (callback: HaconiwaItemGeneratedCallback<T>) => void
  addMarkerCallback: (callback: AddMarkerCallbackFunction) => void
  removeMarkerCallback: (callback: RemoveMarkerCallbackFunction) => void
  addEndedCallback: (callback: EndedCallbackFunction) => void
  addSelectedCallback: (callback: SelectedCallbackFunction) => void
  addUnselectedCallback: (callback: SelectedCallbackFunction) => void
  dispose: () => void
  readonly generated: boolean
  readonly generatedItem: HaconiwaWorldItem | null
}

export type HaconiwaItemGeneratedCallback<T> = (generates: Array<HaconiwaWorldItem>) => void

export type HaconiwaItemGeneratorClonedItem<T> = {
  item: Item,
  renderingObject: T
}

export interface HaconiwaItemGeneratorFactory<T> {
  create: (renderer: Renderer<T>, raycaster: Raycaster, markerRaycaster: Raycaster, renderingObjectBuilder: RenderingObjectBuilder<T>) => HaconiwaItemGenerator<T>
}

export interface HaconiwaItemGeneratorLineConnectable {
  setConnectorColiderMap: (coliderConnectionMap: ColiderItemMap<LineItemConnection>) => void
}

export interface HaconiwaItemGeneratorItemClonable<T> {
  setOriginal: (orignal: HaconiwaItemGeneratorClonedItem<T>) => void
}

export function isHaconiwaItemGeneratorLineConnectable(arg: any): arg is HaconiwaItemGeneratorLineConnectable {
  return 'setConnectorColiderMap' in arg
}

export function isHaconiwaItemGeneratorItemClonable<T>(arg: any): arg is HaconiwaItemGeneratorItemClonable<T> {
  return 'setOriginal' in arg
}
