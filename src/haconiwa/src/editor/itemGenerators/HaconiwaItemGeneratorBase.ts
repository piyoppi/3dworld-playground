import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import { Marker } from "../../../../lib/markers/Marker"
import { HaconiwaWorldItem } from "../../world.js"
import { Item } from "../../../../lib/Item.js"
import {
  HaconiwaItemGeneratedCallback,
  AddMarkerCallbackFunction,
  RemoveMarkerCallbackFunction,
  EndedCallbackFunction,
  SelectedCallbackFunction,
  UnselectedCallbackFunction
} from './HaconiwaItemGenerator'

export class HaconiwaItemGeneratorBase<T> {
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #addMarkerCallbacks = new CallbackFunctions<AddMarkerCallbackFunction>()
  #removeMarkerCallbacks = new CallbackFunctions<RemoveMarkerCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<EndedCallbackFunction>()
  #selectedCallbacks = new CallbackFunctions<SelectedCallbackFunction>()
  #unselectedCallbacks = new CallbackFunctions<SelectedCallbackFunction>()
  #generatedItem: HaconiwaWorldItem | null = null

  get generatedItem() {
    return this.#generatedItem
  }

  get generated() {
    return !!this.#generatedItem
  }

  registerOnGeneratedCallback(callback: HaconiwaItemGeneratedCallback<T>) {
    this.#onGeneratedCallbacks.push(callback)
  }

  addMarkerCallback(func: AddMarkerCallbackFunction) {
    this.#addMarkerCallbacks.add(func)
  }

  removeMarkerCallback(func: RemoveMarkerCallbackFunction) {
    this.#removeMarkerCallbacks.add(func)
  }

  addEndedCallback(func: EndedCallbackFunction) {
    this.#endedCallbacks.add(func)
  }

  addSelectedCallback(func: SelectedCallbackFunction) {
    this.#selectedCallbacks.add(func)
  }

  addUnselectedCallback(func: UnselectedCallbackFunction) {
    this.#unselectedCallbacks.add(func)
  }

  protected registerMarker(marker: Marker) {
    this.#addMarkerCallbacks.call(marker)
  }

  protected registerItem(item: Item) {
    const haconiwaItem = new HaconiwaWorldItem(item, [], [])

    this.#onGeneratedCallbacks.forEach(func => func([haconiwaItem]))
    this.#generatedItem = haconiwaItem

    return haconiwaItem
  }

  protected removeMarker(marker: Marker) {
    this.#removeMarkerCallbacks.call(marker)
  }

  protected selected() {
    if (!this.#generatedItem) throw new Error('Item is not genetarted yet.')
    this.#selectedCallbacks.call(this.#generatedItem)
  }

  protected unselected() {
    if (!this.#generatedItem) throw new Error('Item is not genetarted yet.')
    this.#unselectedCallbacks.call(this.#generatedItem)
  }

  end() {
    this.#endedCallbacks.call()
  }

  dispose() {
  }
}
