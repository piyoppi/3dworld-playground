import type { LineItem, LineItemConnection } from "../../../../lib/LineItem"
import type { Raycaster } from "../../../../lib/Raycaster"
import { PlaneMoveHandler } from "../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { JointHandler } from "../../../../lib/mouse/handlers/JointHandler.js"
import { CursorSnapColiderModifier } from "../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap"
import { Coordinate } from "../../../../lib/Coordinate"
import { VectorArray3 } from "../../../../lib/Matrix"
import { SingleMarker } from "../../../../lib/markers/Marker"

export function markerJointable(
  marker: SingleMarker, 
  handler: PlaneMoveHandler,
  connection: LineItemConnection,
  lineItem: LineItem,
  markerRaycaster: Raycaster,
  coliderConnectionMap: ColiderItemMap<LineItemConnection>
) {
  marker.setParentCoordinate(connection.edge.coordinate)

  handler.setApplyer((coordinate: Coordinate, position: VectorArray3) => {
    lineItem.connections.forEach(childConnection => {
      if (childConnection !== connection) {
        childConnection.edge.updateCoordinate()
      } else {
        childConnection.edge.updateCoordinate(position)
      }

      childConnection.connections.forEach(connection => connection.edge.updateCoordinate())
    })
  })

  const snapModifier = new CursorSnapColiderModifier(markerRaycaster, marker.coliders)
  handler.setCursorModifier(snapModifier)

  const jointHandler = new JointHandler(connection, markerRaycaster, coliderConnectionMap)
  jointHandler.setEndedCallback(() => {
    if (connection.connections.length > 0) {
      handler.clearCursorModifier()
    }
  })

  marker.addHandler(jointHandler)
  coliderConnectionMap.add(marker.coliders[0], connection)

  return jointHandler
}
