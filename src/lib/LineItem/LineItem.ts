import { Line } from "../lines/line.js"
import { Item } from "../Item.js"
import { LineItemConnection } from './LineItemConnection.js'
import { CallbackFunctions } from '../CallbackFunctions.js'

export class LineItem extends Item {
  #line: Line
  #connections: [LineItemConnection, LineItemConnection]
  #updatedCallbacks = new CallbackFunctions<() => void>()
  #connectedLineUpdatedCallbacks = new CallbackFunctions<() => void>()

  constructor(line: Line) {
    super()
    this.#line = line
    this.#connections = [
      new LineItemConnection(this.#line.edges[0], this),
      new LineItemConnection(this.#line.edges[1], this)
    ]

    this.#line.setUpdatedCallback(() => {
      this.connections.forEach(childConnection => {
        this.#updatedCallbacks.call()

        this.connections.forEach(connection => {
          connection.connections.forEach(connection => {
            connection.parent.callConnectedLineUpdatedCallbacks()
          })
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

  private callConnectedLineUpdatedCallbacks() {
    this.#connectedLineUpdatedCallbacks.call()
  }

  setUpdatedCallback(func: () => void) {
    this.#updatedCallbacks.add(func)
  }

  setConnectedLineUpdatedCallback(func: () => void) {
    this.#connectedLineUpdatedCallbacks.add(func)
  }

  dispose() {
    this.#connections.forEach(connection => connection.disconnectAll())
  }
}
