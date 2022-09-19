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
  #connecting: LineItemConnection[] = []

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
  }

  move() {
    if (!this.#isStart) return

    const connections = this.#raycaster.colidedColiders.map(colider => {
      const connection = this.#coliderItemMap.getItem(colider)

      if (!connection) return null
      if (this.#ignoredConnections.indexOf(connection) >= 0) return null

      return connection
    }).filter((item): item is LineItemConnection => !!item)

    connections.forEach(connection => {
      if (!connection.isConnected(this.#edge)) {
        connection.connect(this.#edge)
        this.#connecting.push(connection)
        console.log('connect')
      }
    })

    this.#connecting.forEach(connection => {
      if (connections.indexOf(connection) >= 0 || !connection.isConnected(this.#edge)) return

      connection.disconnect(this.#edge)
      console.log('disconnect')
    })
  }

  end() {
    this.#isStart = false
  }
}
