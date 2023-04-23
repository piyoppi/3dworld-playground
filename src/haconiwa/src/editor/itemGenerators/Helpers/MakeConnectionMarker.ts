import { CenterMarker } from "../../../../../lib/markers/CenterMarker.js"
import { RaycastMoveHandler } from "../../../../../lib/mouse/handlers/RaycastMoveHandler.js"
import { JointHandler } from "../../../../../lib/mouse/handlers/JointHandler.js"
import { CursorSnapColiderModifier } from "../../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import type { LineItem, LineItemConnection } from "../../../../../lib/LineItem/index.js"
import type { Raycaster } from "../../../../../lib/Raycaster"
import type { ColiderItemMap } from "../../../../../lib/ColiderItemMap"
import { BallColider, CoordinatedColider } from "../../../../../lib/Colider.js"

export function makeConnectionMarker (
  item: LineItem,
  markerRaycaster: Raycaster<CoordinatedColider>,
  planeRaycaster: Raycaster,
  coliderConnectionMap: ColiderItemMap<LineItemConnection>
) {
  return item.connections.map(connection => {
    const marker = new CenterMarker(new BallColider(0.5, connection.edge.coordinate))
    const moveHandler = new RaycastMoveHandler(connection.edge.coordinate, planeRaycaster, markerRaycaster, marker.coliders)
    const ignoringColiders = marker.coliders
    const snapModifier = new CursorSnapColiderModifier(
      markerRaycaster.getReadonly(),
      (colidedDetails) => colidedDetails.find(colidedDetail => ignoringColiders.every(ignoredColider => ignoredColider !== colidedDetail.colider))
    )
    const jointHandler = new JointHandler(connection, markerRaycaster.getReadonly(), coliderConnectionMap.getResolver())

    jointHandler.setEndedCallback(() => {
      if (connection.connections.length > 0) {
        moveHandler.clearCursorModifier()
      }
    })

    marker.addHandler(jointHandler)
    coliderConnectionMap.add(marker.coliders[0], connection)

    marker.addHandler(moveHandler)

    moveHandler.setCursorModifier(snapModifier)

    return {connection, marker}
  }) || []
}
