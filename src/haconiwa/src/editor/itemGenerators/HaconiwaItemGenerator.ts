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
export type SelectedCallbackFunction<T> = (item: HaconiwaItemGenerator<T>) => void
export type UnselectedCallbackFunction<T> = (item: HaconiwaItemGenerator<T>) => void

export interface HaconiwaItemGenerator<T> extends MouseControllable {
  registerOnGeneratedCallback: (callback: HaconiwaItemGeneratedCallback<T>) => void
  addMarkerCallback: (callback: AddMarkerCallbackFunction) => void
  removeMarkerCallback: (callback: RemoveMarkerCallbackFunction) => void
  addEndedCallback: (callback: EndedCallbackFunction) => void
  addSelectedCallback: (callback: SelectedCallbackFunction<T>) => void
  addUnselectedCallback: (callback: SelectedCallbackFunction<T>) => void
  dispose: () => void
  readonly generated: boolean
  readonly generatedItem: HaconiwaWorldItem | null
  readonly uuid: string
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
