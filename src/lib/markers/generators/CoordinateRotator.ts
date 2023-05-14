import type { Coordinate } from "../../Coordinate"
import type { ReadOnlyRaycaster } from "../../ReadOnlyRaycaster"
import type { Colider } from "../../Colider"
import type { Camera } from "../../Camera"
import { RotateHandler } from "../../mouse/handlers/RotateHandler.js"
import { CoordinateRotationMarker } from "../CoordinateRotationMarker.js"

export function makeCoordinateRotator(markerRaycaster: ReadOnlyRaycaster<Colider>, parentCoordinate: Coordinate, camera: Camera, startingHookFunction: (() => boolean) | null = null) {
  const xyzRotationMarker = new CoordinateRotationMarker(2, 1.5, parentCoordinate)
  const xyzRotationHandlers = [
    new RotateHandler(parentCoordinate, markerRaycaster, camera, [1, 0, 0], xyzRotationMarker.coliders[0]),
    new RotateHandler(parentCoordinate, markerRaycaster, camera, [0, 1, 0], xyzRotationMarker.coliders[1]),
    new RotateHandler(parentCoordinate, markerRaycaster, camera, [0, 0, 1], xyzRotationMarker.coliders[2])
  ]
  const startingHookFn = startingHookFunction || (() => !xyzRotationHandlers.some(handler => handler.isStart))

  xyzRotationMarker.addHandlers(xyzRotationHandlers[0], xyzRotationHandlers[1], xyzRotationHandlers[2])
  xyzRotationHandlers.forEach(handler => handler.setStartedCallback(startingHookFn))

  return {marker: xyzRotationMarker, handlers: xyzRotationHandlers}
}
