import type { LineItem } from '../../../../../lib/LineItem/LineItem'
import type { HandlingProcess as IHandlingProcess } from '../HandlingProcess'

export class HandlingProcess implements IHandlingProcess {
  constructor(private lineItem: LineItem) {

  }

  dispose () {
    this.lineItem.connections.forEach(connection => {
      connection.disconnectAll()
    })
  }
}
