import { CenterMarker } from "../../../../../lib/markers/CenterMarker.js"
import { PlaneMoveHandler } from "../../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { JointHandler } from "../../../../../lib/mouse/handlers/JointHandler.js"
import { CursorSnapColiderModifier } from "../../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import type { LineItem, LineItemConnection } from "../../../../../lib/LineItem"
import type { Raycaster } from "../../../../../lib/Raycaster"
import type { ColiderItemMap } from "../../../../../lib/ColiderItemMap"
import { RenderingObject } from "../../../../../lib/RenderingObject.js"

export function makeConnectionMarker<T extends RenderingObject<T>>(
  item: LineItem,
  markerRaycaster: Raycaster,
  planeRaycaster: Raycaster,
  coliderConnectionMap: ColiderItemMap<LineItemConnection>
) {
  return item.connections.map(connection => {
    const marker = new CenterMarker(0.5)
    const moveHandler = new PlaneMoveHandler(marker.parentCoordinate, planeRaycaster)
    const snapModifier = new CursorSnapColiderModifier(markerRaycaster, [marker.colider])
    const jointHandler = new JointHandler(connection, markerRaycaster, coliderConnectionMap)

    jointHandler.setEndedCallback(() => {
      if (connection.connections.length > 0) {
        moveHandler.clearCursorModifier()
      }
    })

    marker.addHandler(jointHandler)
    coliderConnectionMap.add(marker.colider, connection)

    marker.addHandler(moveHandler)

    moveHandler.setCursorModifier(snapModifier)
    marker.parentCoordinate.position = connection.edge.position

    return marker
  }) || []
}
