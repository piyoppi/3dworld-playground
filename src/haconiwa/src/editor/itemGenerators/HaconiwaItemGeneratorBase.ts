import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import { Marker } from "../../../../lib/markers/Marker"
import { HaconiwaWorldItem } from "../../World/HaconiwaWorldItem.js"
import { Item } from "../../../../lib/Item.js"
import { Coordinate } from "../../../../lib/Coordinate.js"
import { MouseButton, MouseControllableCallbackFunction, WindowCursor } from "../../../../lib/mouse/MouseControllable.js"
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
import type { Raycaster } from "../../../../lib/Raycaster"

export type CreateParams = {
  cursor: WindowCursor,
  button: MouseButton,
  cameraCoordinate: Coordinate,
  unselected: () => void,
  selected: () => void,
  registerItem: (item: Item) => void,
  removeMarker: (marker: Marker) => void,
}

export abstract class HaconiwaItemGeneratorBase<T> {
  #onGeneratedCallbacks: Array<HaconiwaItemGeneratedCallback> = []
  #addMarkerCallbacks = new CallbackFunctions<AddMarkerCallbackFunction>()
  #removeMarkerCallbacks = new CallbackFunctions<RemoveMarkerCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<EndedCallbackFunction>()
  #selectedCallbacks = new CallbackFunctions<SelectedCallbackFunction<T>>()
  #unselectedCallbacks = new CallbackFunctions<SelectedCallbackFunction<T>>()
  #generatedItem: HaconiwaWorldItem | null = null
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #uuid = uuidv4()
  #selected = false
  #isStart = false
  #markers: Array<Marker> = []
  protected markerRaycaster: Raycaster

  constructor(markerRaycaster: Raycaster) {
    this.markerRaycaster = markerRaycaster
  }

  get generatedItem() {
    return this.#generatedItem
  }

  get generated() {
    return !!this.#generatedItem
  }

  get uuid() {
    return this.#uuid
  }

  get isSelected() {
    return this.#selected
  }

  get isStart() {
    return this.#isStart
  }

  registerOnGeneratedCallback(callback: HaconiwaItemGeneratedCallback) {
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

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  start(cursor: WindowCursor, button: MouseButton, cameraCoordinate: Coordinate) {
    if (this.#isStart) return false
    if (this.markerRaycaster.colidedColiders.length > 0 && !this.isOwnMarkerSelected()) {
      this.unselect()
      this.unselected(this)
      return false
    }

    const result = this.create(
      {
        cursor,
        button,
        cameraCoordinate,
        unselected: () => this.unselected(this),
        selected: () => this.selected(this),
        registerItem: (item: Item) => this.registerItem(item),
        removeMarker: (marker: Marker) => this.removeMarker(marker)
      }
    )

    if (result) {
      this.#startedCallbacks.call()
      this.#isStart = true
    }
  }

  move() {

  }

  protected abstract create(params: CreateParams): boolean | undefined
  protected abstract unselect(): void

  protected registerMarker(marker: Marker) {
    this.#markers.push(marker)
    this.#addMarkerCallbacks.call(marker)
  }

  private registerItem(item: Item) {
    const haconiwaItem = new HaconiwaWorldItem(item, [], [])

    this.#onGeneratedCallbacks.forEach(func => func([haconiwaItem]))
    this.#generatedItem = haconiwaItem

    return haconiwaItem
  }

  protected removeMarker(marker: Marker) {
    const index = this.#markers.findIndex(found => found === marker)

    if (index >= 0) {
      this.#markers.splice(index, 1)
      this.#removeMarkerCallbacks.call(marker)
    }
  }

  private selected(self: HaconiwaItemGenerator<T>) {
    this.#selectedCallbacks.call(self)
    this.#selected = true
  }

  private unselected(self: HaconiwaItemGenerator<T>) {
    this.#unselectedCallbacks.call(self)
    this.#selected = false
  }

  private isOwnMarkerSelected() {
    return this.#markers.some(handlingMarker => this.markerRaycaster.colidedColiders.has(...handlingMarker.coliders))
  }

  end() {
    this.#endedCallbacks.call()
    this.#isStart = false
  }

  dispose() {
  }
}
