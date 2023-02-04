import type { LineItemConnection } from "../../../../lib/LineItem/index.js"
import type { Raycaster } from "../../../../lib/Raycaster"
import { JointHandler } from "../../../../lib/mouse/handlers/JointHandler.js"
import { CursorSnapColiderModifier } from "../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap"
import { JointMarker } from "../../../../lib/markers/JointMarker"
import { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import { PositionChangable } from "../../../../lib/mouse/handlers/PositionChangable"
import { CoordinatedColider } from "../../../../lib/Colider.js"

export function markerJointable(
  marker: JointMarker, 
  pairMarkers: JointMarker[],
  handler: MouseControllable & PositionChangable,
  connection: LineItemConnection,
  markerRaycaster: Raycaster<CoordinatedColider>,
  coliderConnectionMap: ColiderItemMap<LineItemConnection>
) {
  const snapModifier = new CursorSnapColiderModifier(markerRaycaster, pairMarkers.map(marker => marker.coliders).flat())
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
