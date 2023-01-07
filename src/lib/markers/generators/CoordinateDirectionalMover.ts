import { CoordinateMarker } from "../CoordinateMarker.js"
import { DirectionalMoveHandler } from "../../mouse/handlers/DirectionalMoveHandler.js"
import { Coordinate } from "../../Coordinate"
import { RenderingObjectBuilder } from "../../RenderingObjectBuilder.js"
import type { Renderer } from "../../Renderer"
import { RenderingObject } from "../../RenderingObject.js"

export function makeCoordinateDirectionalMover<T extends RenderingObject>(parentCoordinate: Coordinate, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>, startingHookFunction: (() => boolean) | null = null) {
  const xyzMarker = new CoordinateMarker(3, 0.1)
  const xyzHandlers = [
    new DirectionalMoveHandler(parentCoordinate, [1, 0, 0], 0.1),
    new DirectionalMoveHandler(parentCoordinate, [0, 1, 0], 0.1),
    new DirectionalMoveHandler(parentCoordinate, [0, 0, 1], 0.1)
  ]
  const startingHookFn = startingHookFunction || (() => !xyzHandlers.some(handler => handler.isStart))

  xyzMarker.addHandlers(xyzHandlers[0], xyzHandlers[1], xyzHandlers[2])
  xyzMarker.attachRenderingObject(builder, renderer)
  xyzMarker.setParentCoordinate(parentCoordinate)
  xyzHandlers.forEach(handler => handler.setStartedCallback(startingHookFn))

  return {marker: xyzMarker, handlers: xyzHandlers}
}
