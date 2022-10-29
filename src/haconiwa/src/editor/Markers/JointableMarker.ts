import type { LineItem, LineItemConnection } from "../../../../lib/LineItem"
import type { Raycaster } from "../../../../lib/Raycaster"
import { CenterMarker } from "../../../../lib/markers/CenterMarker.js"
import { PlaneMoveHandler } from "../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { JointHandler } from "../../../../lib/mouse/handlers/JointHandler.js"
import { CursorSnapColiderModifier } from "../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap"

export class JointableMarker {
  #marker = new CenterMarker(0.5)
  #jointHandler: JointHandler
  #moveHandler: PlaneMoveHandler
  #connection: LineItemConnection

  constructor(
    connection: LineItemConnection,
    markerRaycaster: Raycaster,
    planeRaycaster: Raycaster,
    coliderConnectionMap: ColiderItemMap<LineItemConnection>
  ) {
    this.#marker.setParentCoordinate(connection.edge.coordinate)
    const snapModifier = new CursorSnapColiderModifier(markerRaycaster, [this.#marker.colider])
    this.#connection = connection
    this.#moveHandler = new PlaneMoveHandler(this.#marker.parentCoordinate, planeRaycaster)
    this.#jointHandler = new JointHandler(connection, markerRaycaster, coliderConnectionMap)

    this.#jointHandler.setEndedCallback(() => {
      if (connection.connections.length > 0) {
        this.#moveHandler.clearCursorModifier()
      }
    })

    this.#marker.addHandler(this.#jointHandler)
    coliderConnectionMap.add(this.#marker.colider, connection)

    this.#marker.addHandler(this.#moveHandler)

    this.#moveHandler.setCursorModifier(snapModifier)
    this.#marker.parentCoordinate.position = connection.edge.position
  }

  setIgnoredConnection(connection: LineItemConnection) {
    this.#jointHandler.addIgnoredConnection(connection)
  }

  get moveHandler() {
    return this.#moveHandler
  }

  get jointHandler() {
    return this.#jointHandler
  }

  get marker() {
    return this.#marker
  }

  get connection() {
    return this.#connection
  }
}
