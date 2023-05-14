import type { Coordinate } from "../../Coordinate"
import { CoordinateMarker } from "../CoordinateMarker.js"
import { DirectionalMoveHandler } from "../../mouse/handlers/DirectionalMoveHandler.js"

export function makeCoordinateDirectionalMover(parentCoordinate: Coordinate, startingHookFunction: (() => boolean) | null = null) {
  const xyzMarker = new CoordinateMarker(3, 0.1, parentCoordinate)
  const xyzHandlers = [
    new DirectionalMoveHandler(parentCoordinate, [1, 0, 0], 0.1),
    new DirectionalMoveHandler(parentCoordinate, [0, 1, 0], 0.1),
    new DirectionalMoveHandler(parentCoordinate, [0, 0, 1], 0.1)
  ]
  const startingHookFn = startingHookFunction || (() => !xyzHandlers.some(handler => handler.isStart))

  xyzMarker.addHandlers(xyzHandlers[0], xyzHandlers[1], xyzHandlers[2])
  xyzHandlers.forEach(handler => handler.setStartedCallback(startingHookFn))

  return {marker: xyzMarker, handlers: xyzHandlers}
}
