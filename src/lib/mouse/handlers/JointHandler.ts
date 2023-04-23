import type { ColiderItemResolver } from "../../ColiderItemResolver"
import { LineItemConnection } from "../../LineItem/index.js"
import type { MouseControllable, MouseControllableCallbackFunction } from "../../mouse/MouseControllable"
import { CallbackFunctions } from "../../CallbackFunctions.js"
import type { Raycaster } from "../../Raycaster"
import { Colider } from "../../Colider"
import { ReadOnlyRaycaster } from "../../ReadOnlyRaycaster"

export class JointHandler implements MouseControllable {
  #isStart = false
  #raycaster: ReadOnlyRaycaster
  #coliderItemResolver: ColiderItemResolver<LineItemConnection>
  #startedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #endedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #connectedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #disconnectedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #connection: LineItemConnection
  #ignoredConnections: LineItemConnection[]
  #connecting: LineItemConnection[] = []
  #disconnectable = false

  constructor(connection: LineItemConnection, readonlyRaycaster: ReadOnlyRaycaster, coliderItemResolver: ColiderItemResolver<LineItemConnection>) {
    this.#raycaster = readonlyRaycaster
    this.#coliderItemResolver = coliderItemResolver
    this.#connection = connection
    this.#ignoredConnections = [connection]
  }

  get disconnectable() {
    return this.#disconnectable
  }

  set disconnectable(val: boolean) {
    this.#disconnectable = val
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

  start() {
    this.#isStart = true
    this.#startedCallbacks.call()
  }

  move() {
    if (!this.#isStart) return

  }

  end() {
    this.#isStart = false
    const connections = this.#raycaster.colidedColiders.map(colider => {
      const connection = this.#coliderItemResolver.resolve(colider)

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

    if (this.#disconnectable) {
      this.#connecting.forEach(connection => {
        if (connections.indexOf(connection) >= 0 || !connection.isConnected(this.#connection)) return

        connection.disconnect(this.#connection)
        this.#connection.disconnect(connection)

        this.#disconnectedCallbacks.call()
      })
    }

    this.#endedCallbacks.call()
  }
}
