import { Line } from "./lines/line.js"
import { Item } from "./Item.js"
import { LineEdge } from "./lines/lineEdge.js"

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

  isConnected(connection: LineItemConnection) {
    return this._connections.indexOf(connection) >= 0
  }

  connect(connection: LineItemConnection) {
    this._connections.push(connection)
    connection._connections.push(this)
  }

  disconnect(connection: LineItemConnection) {
    const itemIndex = this._connections.indexOf(connection)

    if (itemIndex < 0) return

    const pairItemIndex = this._connections[itemIndex]._connections.indexOf(this)
    if (pairItemIndex >= 0) {
      this._connections[itemIndex]._connections.splice(pairItemIndex, 1)
    }

    this._connections.splice(itemIndex, 1)
  }
}
