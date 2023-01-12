import { RotateHandler } from "../../mouse/handlers/RotateHandler.js"
import { CoordinateRotationMarker } from "../CoordinateRotationMarker.js"
import { Coordinate } from "../../Coordinate"
import type { RenderingObjectBuilder } from "../../RenderingObjectBuilder.js"
import type { Renderer } from "../../Renderer"
import type { Raycaster } from "../../Raycaster"
import { RenderingObject } from "../../RenderingObject.js"

export function makeCoordinateRotator<T extends RenderingObject>(markerRaycaster: Raycaster, parentCoordinate: Coordinate, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>, startingHookFunction: (() => boolean) | null = null) {
  const xyzRotationMarker = new CoordinateRotationMarker(2, 1.5)
  const xyzRotationHandlers = [
    new RotateHandler(parentCoordinate, markerRaycaster, [1, 0, 0], xyzRotationMarker.coliders[0]),
    new RotateHandler(parentCoordinate, markerRaycaster, [0, 1, 0], xyzRotationMarker.coliders[1]),
    new RotateHandler(parentCoordinate, markerRaycaster, [0, 0, 1], xyzRotationMarker.coliders[2])
  ]
  const startingHookFn = startingHookFunction || (() => !xyzRotationHandlers.some(handler => handler.isStart))

  xyzRotationMarker.addHandlers(xyzRotationHandlers[0], xyzRotationHandlers[1], xyzRotationHandlers[2])
  xyzRotationMarker.attachRenderingObject(builder, renderer)
  xyzRotationMarker.setParentCoordinate(parentCoordinate)
  xyzRotationHandlers.forEach(handler => handler.setStartedCallback(startingHookFn))

  return {marker: xyzRotationMarker, handlers: xyzRotationHandlers}
}
