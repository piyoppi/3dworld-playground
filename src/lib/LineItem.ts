import { Line } from "./lines/line.js"
import { Item } from "./Item.js"
import { LineEdge } from "./lines/lineEdge.js"
import { CallbackFunctions } from "./CallbackFunctions.js"
import { MouseControllableCallbackFunction } from "./mouse/MouseControllable.js"

export class LineItem extends Item {
  #line: Line
  #connections: [LineItemConnection, LineItemConnection]

  constructor(line: Line) {
    super()
    this.#line = line
    this.#connections = [
      new LineItemConnection(this.#line.edges[0]),
      new LineItemConnection(this.#line.edges[1])
    ]
  }

  get connections() {
    return this.#connections
  }

  get line() {
    return this.#line
  }
}

export class LineItemConnection {
  #edge: LineEdge
  #connectedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  #disconnectedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  protected _connections: LineItemConnection[] = []

  constructor(edge: LineEdge) {
    this.#edge = edge
  }

  get edge() {
    return this.#edge
  }

  get connections() {
    return this._connections
  }

  get position() {
    return this.#edge.position
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

  hasConnections() {
    return this._connections.length > 0
  }

  isConnected(connection: LineItemConnection) {
    return this._connections.indexOf(connection) >= 0
  }

  connect(connection: LineItemConnection) {
    this._connections.push(connection)
    connection._connections.push(this)

    this.#connectedCallbacks.call()
    connection.#connectedCallbacks.call()
  }

  disconnect(connection: LineItemConnection) {
    const itemIndex = this._connections.indexOf(connection)

    if (itemIndex < 0) return

    const pairItemIndex = this._connections[itemIndex]._connections.indexOf(this)
    if (pairItemIndex >= 0) {
      this._connections[itemIndex]._connections.splice(pairItemIndex, 1)
    }

    this._connections.splice(itemIndex, 1)

    this.#disconnectedCallbacks.call()
  }
}
