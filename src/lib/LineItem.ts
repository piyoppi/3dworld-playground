import { Line } from "./lines/line.js"
import { Item } from "./Item.js";
import { LineEdge } from "./lines/lineEdge.js";

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
  #connectedEdges: LineEdge[] = []

  constructor(edge: LineEdge) {
    this.#edge = edge
  }

  get edge() {
    return this.#edge
  }

  connect(edge: LineEdge) {
    this.#connectedEdges.push(edge)
  }

  disconnect(edge: LineEdge) {
    const itemIndex = this.#connectedEdges.indexOf(edge)

    if (itemIndex < 0) return

    this.#connectedEdges.splice(itemIndex, 1)
  }
}
