import type { ColiderItemMap } from "../../ColiderItemMap"
import type { Coordinate } from "../../Coordinate"
import { LineItemConnection } from "../../LineItem"
import { LineEdge } from "../../lines/lineEdge"
import type { MouseButton, MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Raycaster } from "../../Raycaster"

export class JointHandler implements MouseControllable {
  #isStart = false
  #raycaster: Raycaster
  #coliderItemMap: ColiderItemMap<LineItemConnection>
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #edge: LineEdge
  #ignoredConnections: LineItemConnection[]

  constructor(edge: LineEdge, ignoredConnections: LineItemConnection[], raycaster: Raycaster, coliderItemMap: ColiderItemMap<LineItemConnection>) {
    this.#raycaster = raycaster
    this.#coliderItemMap = coliderItemMap
    this.#edge = edge
    this.#ignoredConnections = ignoredConnections
  }

  get isStart() {
    return this.#isStart
  }

  setStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.add(func)
  }

  removeStartedCallback(func: MouseControllableCallbackFunction) {
    this.#startedCallbacks.remove(func)
  }

  start(cursorX: number, cursorY: number, _button: MouseButton, cameraCoordinate: Coordinate) {
    this.#isStart = true
    this.#startedCallbacks.call()
    console.log('start_joint')
  }

  move() {
    if (!this.#isStart) return
    this.#raycaster.colidedColiders.forEach(colider => {
      const item = this.#coliderItemMap.getItem(colider)

      if (item && this.#ignoredConnections.indexOf(item) < 0) {
        item?.connect(this.#edge)
        console.log('connected', item, this.#edge);
      }
    })
  }

  end() {
    this.#isStart = false
    console.log('end_joint')
  }
}
