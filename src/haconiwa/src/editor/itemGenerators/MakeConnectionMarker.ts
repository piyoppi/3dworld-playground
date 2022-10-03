import { CenterMarker } from "../../../../lib/markers/CenterMarker.js"
import { PlaneMoveHandler } from "../../../../lib/mouse/handlers/PlaneMoveHandler.js"
import { JointHandler } from "../../../../lib/mouse/handlers/JointHandler.js"
import { CursorSnapColiderModifier } from "../../../../lib/mouse/handlers/cursorModifiers/CursorSnapColiderModifier.js"
import type { MouseControllable } from "../../../../lib/mouse/MouseControllable"
import type { RenderingObjectBuilder } from "../../../../lib/RenderingObjectBuilder"
import type { LineItem, LineItemConnection } from "../../../../lib/LineItem"
import type { Renderer } from "../../../../lib/Renderer"
import type { Raycaster } from "../../../../lib/Raycaster"
import type { ColiderItemMap } from "../../../../lib/ColiderItemMap"
import { RenderingObject } from "../../../../lib/RenderingObject.js"

export function makeConnectionMarker<T extends RenderingObject<T>>(item: LineItem, renderer: Renderer<T>, renderingObjectBuilder: RenderingObjectBuilder<T>, markerRaycaster: Raycaster, planeRaycaster: Raycaster, coliderConnectionMap: ColiderItemMap<LineItemConnection> | null) {
  return item.connections.map(connection => {
    const marker = new CenterMarker(0.5)
    const moveHandler = new PlaneMoveHandler(marker.parentCoordinate, planeRaycaster)
    const snapModifier = new CursorSnapColiderModifier(markerRaycaster, [marker.colider])
    const handlers: MouseControllable[] = []

    if (coliderConnectionMap) {
      const jointHandler = new JointHandler(connection, item.connections, markerRaycaster, coliderConnectionMap)

      jointHandler.setEndedCallback(() => {
        if (connection.connections.length > 0) {
          moveHandler.clearCursorModifier()
        }
      })

      handlers.push(jointHandler)
      coliderConnectionMap.add(marker.colider, connection)
    }
    handlers.push(moveHandler)

    marker.setHandlers(handlers)

    moveHandler.setCursorModifier(snapModifier)
    marker.parentCoordinate.position = connection.edge.position
    marker.attachRenderingObject<T>({r: 255, g: 0, b: 0}, renderingObjectBuilder, renderer)

    return marker
  }) || []
}
