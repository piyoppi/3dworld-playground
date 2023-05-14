import { PlaneMoveHandler } from "../../mouse/handlers/PlaneMoveHandler.js"
import { Coordinate } from "../../Coordinate"
import { XYZPlaneMarker } from "../XYZPlaneMarker.js"
import type { Camera } from "../../Camera"

export function makeCoordinatePlanesMover(parentCoordinate: Coordinate, camera: Camera, inLocal: boolean, startingHookFunction: (() => boolean) | null = null) {
  const marker = new XYZPlaneMarker(1.5, parentCoordinate)
  const handlers = [
    new PlaneMoveHandler(parentCoordinate, [1, 0, 0], inLocal, camera),
    new PlaneMoveHandler(parentCoordinate, [0, 1, 0], inLocal, camera),
    new PlaneMoveHandler(parentCoordinate, [0, 0, 1], inLocal, camera),
  ]
  const startingHookFn = startingHookFunction || (() => !handlers.some(handler => handler.isStart))

  marker.addHandlers(handlers[0], handlers[1], handlers[2])
  handlers.forEach(handler => handler.setStartedCallback(startingHookFn))

  return {marker, handlers}
}
