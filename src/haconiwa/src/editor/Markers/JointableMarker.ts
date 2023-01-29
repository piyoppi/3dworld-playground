import type { LineItemConnection } from "../../../../lib/LineItem/index.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import { JointHandler } from "../../../../lib/mouse/handlers/JointHandler.js"
import { CursorSnapColiderModifier } from "../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap"
import { SingleMarker } from "../../../../lib/markers/Marker"
import { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import { PositionChangable } from "../../../../lib/mouse/handlers/PositionChangable"

export function markerJointable(
  marker: SingleMarker, 
  handler: MouseControllable & PositionChangable,
  connection: LineItemConnection,
  markerRaycaster: Raycaster,
  coliderConnectionMap: ColiderItemMap<LineItemConnection>
) {
  marker.setParentCoordinate(connection.edge.coordinate)

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
