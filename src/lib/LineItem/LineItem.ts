import { Line } from "../lines/line.js"
import { Item } from "../Item.js"
import { LineItemConnection } from './LineItemConnection.js'

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
