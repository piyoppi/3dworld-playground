import { PlaneMoveHandler } from "../../mouse/handlers/PlaneMoveHandler.js"
import { Coordinate } from "../../Coordinate"
import { RenderingObjectBuilder } from "../../RenderingObjectBuilder.js"
import type { Renderer } from "../../Renderer"
import { RenderingObject } from "../../RenderingObject.js"
import { XYZPlaneMarker } from "../XYZPlaneMarker.js"

export function makeCoordinatePlanesMover<T extends RenderingObject>(parentCoordinate: Coordinate, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>, startingHookFunction: (() => boolean) | null = null) {
  const marker = new XYZPlaneMarker(1.5, parentCoordinate)
  const handlers = [
    new PlaneMoveHandler(parentCoordinate, [1, 0, 0], renderer.camera),
    new PlaneMoveHandler(parentCoordinate, [0, 1, 0], renderer.camera),
    new PlaneMoveHandler(parentCoordinate, [0, 0, 1], renderer.camera),
  ]
  const startingHookFn = startingHookFunction || (() => !handlers.some(handler => handler.isStart))

  marker.addHandlers(handlers[0], handlers[1], handlers[2])
  marker.attachRenderingObject(builder, renderer)
  marker.setParentCoordinate(parentCoordinate)
  handlers.forEach(handler => handler.setStartedCallback(startingHookFn))

  return {marker, handlers}
}
