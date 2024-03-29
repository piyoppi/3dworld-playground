import type { LineItemConnection } from "../../../../lib/LineItem/index.js"
import { JointHandler } from "../../../../lib/mouse/handlers/JointHandler.js"
import { CursorSnapColiderModifier } from "../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import { JointColider, JointMarker } from "../../../../lib/markers/JointMarker.js"
import { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import { PositionChangable } from "../../../../lib/mouse/handlers/PositionChangable"
import { CoordinatedColider } from "../../../../lib/Colider.js"
import type { ReadOnlyRaycaster } from "../../../../lib/ReadOnlyRaycaster"

export function markerJointable(
  marker: JointMarker, 
  pairMarkers: JointMarker[],
  handler: MouseControllable & PositionChangable,
  connection: LineItemConnection,
  markerRaycaster: ReadOnlyRaycaster<CoordinatedColider>,
) {
  const ignoringColiders = pairMarkers.map(marker => marker.coliders).flat()
  const snapModifier = new CursorSnapColiderModifier(
    markerRaycaster,
    (colidedDetails) => colidedDetails.find(colidedDetail => colidedDetail.colider instanceof JointColider && ignoringColiders.every(ignoredColider => ignoredColider !== colidedDetail.colider))
  )
  handler.setCursorModifier(snapModifier)

  const jointHandler = new JointHandler(connection, markerRaycaster)
  jointHandler.setEndedCallback(() => {
    if (connection.connections.length > 0) {
      handler.clearCursorModifier()
    }
  })

  marker.addHandler(jointHandler)

  return jointHandler
}
