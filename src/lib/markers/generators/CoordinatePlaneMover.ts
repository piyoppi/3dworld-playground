import { PlaneMoveHandler } from "../../mouse/handlers/PlaneMoveHandler.js"
import { CenterMarker } from "../CenterMarker.js"
import { Coordinate } from "../../Coordinate"
import { RenderingObjectBuilder } from "../../RenderingObjectBuilder.js"
import type { Renderer } from "../../Renderer"
import { RenderingObject } from "../../RenderingObject.js"
import { Raycaster } from "../../Raycaster.js"

export function makeCoordinatePlaneMover<T extends RenderingObject>(planeRaycaster: Raycaster, markerRaycaster: Raycaster, parentCoordinate: Coordinate, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
  const marker = new CenterMarker(0.5)
  const moveHandler = new PlaneMoveHandler(parentCoordinate, planeRaycaster, markerRaycaster, marker.coliders)
  marker.setParentCoordinate(parentCoordinate)
  marker.attachRenderingObject({r: 255, g: 0, b: 0}, builder, renderer)
  marker.addHandler(moveHandler)

  return {marker, handlers: [moveHandler]}
}
