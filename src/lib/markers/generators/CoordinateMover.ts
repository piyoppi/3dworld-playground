import { makeCoordinateDirectionalMover } from "./CoordinateDirectionalMover.js"
import { makeCoordinatePlanesMover } from "./CoordinatePlanesMover.js"
import { makeCoordinateRotator } from "./CoordinateRotator.js"
import { Coordinate } from "../../Coordinate"
import type { Renderer } from "../../Renderer"
import type { Raycaster } from "../../Raycaster"
import type { RenderingObjectBuilder } from "../../RenderingObjectBuilder.js"
import { RenderingObject } from "../../RenderingObject.js"

export function makeCoordinateMover<T extends RenderingObject>(planeRaycaster: Raycaster, markerRaycaster: Raycaster, parentCoordinate: Coordinate, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
  const directionalMover = makeCoordinateDirectionalMover(parentCoordinate, builder, renderer)
  const planeMover = makeCoordinatePlanesMover(parentCoordinate, builder, renderer)
  const rotator = makeCoordinateRotator(markerRaycaster, parentCoordinate, builder, renderer)

  const startingHookFn = () => !planeMover.handlers.some(handler => handler.isStart) &&
    !rotator.handlers.some(handler => handler.isStart) &&
    !directionalMover.handlers.some(handler => handler.isStart)

  directionalMover.handlers.forEach(handler => handler.setStartingCallback(startingHookFn))
  planeMover.handlers.forEach(handler => handler.setStartingCallback(startingHookFn))
  rotator.handlers.forEach(handler => handler.setStartingCallback(startingHookFn))

  return [
    directionalMover.marker,
    planeMover.marker,
    rotator.marker
  ]
}
