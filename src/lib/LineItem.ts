import { Line } from "./lines/line.js"
import { Item } from "./Item.js"
import { LineEdge } from "./lines/lineEdge.js"
import { CallbackFunctions } from "./CallbackFunctions.js"
import { MouseControllableCallbackFunction } from "./mouse/MouseControllable.js"
import { Vec3 } from "./Matrix.js"

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

    this.#line.setUpdatedCallback(() => {
      this.connections.forEach(childConnection => {
        childConnection.connections.forEach(connection => {
          connection.edge.updateCoordinate()
        })
      })
    })
  }

  get connections() {
    return this.#connections
  }

  get line() {
    return this.#line
  }

  dispose() {
    this.#connections.forEach(connection => connection.disconnectAll())
  }
}

export class LineItemConnection {
  #edge: LineEdge
  #connectedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()
  private disconnectedCallbacks = new CallbackFunctions<MouseControllableCallbackFunction>()

  protected _updatedCallbacks = new Map<LineItemConnection, () => void>()
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
    this.disconnectedCallbacks.add(func)
  }

  removeDisconnectedCallbacks(func: MouseControllableCallbackFunction) {
    this.disconnectedCallbacks.remove(func)
  }

  hasConnections() {
    return this._connections.length > 0
  }

  isConnected(connection: LineItemConnection) {
    return this._connections.indexOf(connection) >= 0
  }

  private setSyncPairConnectionCoordinate(pair: LineItemConnection) {
    let pairPosition = pair.edge.coordinate.position

    const callback = () => {
      if (Vec3.norm(Vec3.subtract(pairPosition, pair.edge.coordinate.position)) < 0.001) return
      if (Vec3.norm(Vec3.subtract(this.edge.coordinate.position, pair.edge.coordinate.position)) < 0.001) return

      this.edge.coordinate.position = pair.edge.coordinate.position
      pairPosition = pair.edge.coordinate.position
    }

    this._updatedCallbacks.set(pair, callback)
    pair.edge.coordinate.setUpdateCallback(callback)
  }

  private removeSyncPairConnectionCoordinate(pair: LineItemConnection) {
    const callback = this._updatedCallbacks.get(pair)

    if (callback) {
      pair.edge.coordinate.removeUpdateCallback(callback)

      this._updatedCallbacks.delete(pair)
    }
  }

  connect(connection: LineItemConnection) {
    this._connections.push(connection)
    connection._connections.push(this)

    this.setSyncPairConnectionCoordinate(connection)
    connection.setSyncPairConnectionCoordinate(this)

    this.#connectedCallbacks.call()
    connection.#connectedCallbacks.call()
  }

  disconnect(connection: LineItemConnection) {
    const itemIndex = this._connections.indexOf(connection)
    const pairItemIndex = connection._connections.indexOf(this)

    if (itemIndex < 0 || pairItemIndex < 0) return

    this.removeSyncPairConnectionCoordinate(connection)
    connection.removeSyncPairConnectionCoordinate(this)

    this._connections.splice(itemIndex, 1)
    connection._connections.splice(pairItemIndex, 1)

    this.disconnectedCallbacks.call()
    connection.disconnectedCallbacks.call()
  }

  disconnectAll() {
    this._connections.forEach(conn => this.disconnect(conn))
  }
}
