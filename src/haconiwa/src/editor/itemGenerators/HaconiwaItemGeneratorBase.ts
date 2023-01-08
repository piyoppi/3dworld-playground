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
  UnselectedCallbackFunction,
  HaconiwaItemGenerator
} from './HaconiwaItemGenerator'
import { v4 as uuidv4 } from 'uuid'

export class HaconiwaItemGeneratorBase<T> {
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback<T>> = []
  #addMarkerCallbacks = new CallbackFunctions<AddMarkerCallbackFunction>()
  #removeMarkerCallbacks = new CallbackFunctions<RemoveMarkerCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<EndedCallbackFunction>()
  #selectedCallbacks = new CallbackFunctions<SelectedCallbackFunction<T>>()
  #unselectedCallbacks = new CallbackFunctions<SelectedCallbackFunction<T>>()
  #generatedItem: HaconiwaWorldItem | null = null
  #uuid = uuidv4()

  get generatedItem() {
    return this.#generatedItem
  }

  get generated() {
    return !!this.#generatedItem
  }

  get uuid() {
    return this.#uuid
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

  addSelectedCallback(func: SelectedCallbackFunction<T>) {
    this.#selectedCallbacks.add(func)
  }

  addUnselectedCallback(func: UnselectedCallbackFunction<T>) {
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

  protected selected(self: HaconiwaItemGenerator<T>) {
    this.#selectedCallbacks.call(self)
  }

  protected unselected(self: HaconiwaItemGenerator<T>) {
    this.#unselectedCallbacks.call(self)
  }

  end() {
    this.#endedCallbacks.call()
  }

  dispose() {
  }
}
