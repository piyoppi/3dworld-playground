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
  #endedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #connectedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #disconnectedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #connection: LineItemConnection
  #ignoredConnections: LineItemConnection[]
  #connecting: LineItemConnection[] = []

  constructor(connection: LineItemConnection, raycaster: Raycaster, coliderItemMap: ColiderItemMap<LineItemConnection>) {
    this.#raycaster = raycaster
    this.#coliderItemMap = coliderItemMap
    this.#connection = connection
    this.#ignoredConnections = [connection]
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

  setEndedCallback(func: MouseControllableCallbackFunction) {
    this.#endedCallbacks.add(func)
  }

  removeEndedCallback(func: MouseControllableCallbackFunction) {
    this.#endedCallbacks.remove(func)
  }

  setConnectedCallbacks(func: MouseControllableCallbackFunction) {
    this.#connectedCallbacks.add(func)
  }

  removeConnectedCallbacks(func: MouseControllableCallbackFunction) {
    this.#connectedCallbacks.remove(func)
  }

  setDisconnectedCallbacks(func: MouseControllableCallbackFunction) {
    this.#disconnectedCallbacks.add(func)
  }

  removeDisconnectedCallbacks(func: MouseControllableCallbackFunction) {
    this.#disconnectedCallbacks.remove(func)
  }

  addIgnoredConnection(connection: LineItemConnection) {
    this.#ignoredConnections.push(connection)
  }

  start(_cursorX: number, _cursorY: number, _button: MouseButton, _cameraCoordinate: Coordinate) {
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
      if (!connection.isConnected(this.#connection)) {
        connection.connect(this.#connection)
        this.#connecting.push(connection)
        this.#connectedCallbacks.call()
      }
    })

    this.#connecting.forEach(connection => {
      if (connections.indexOf(connection) >= 0 || !connection.isConnected(this.#connection)) return

      connection.disconnect(this.#connection)
      this.#disconnectedCallbacks.call()
    })
  }

  end() {
    this.#isStart = false
    this.#endedCallbacks.call()
  }
}
