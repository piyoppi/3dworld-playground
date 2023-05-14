import type { Coordinate } from "../../Coordinate"
import type { Camera } from "../../Camera"
import type { ReadOnlyRaycaster } from "../../ReadOnlyRaycaster"
import { makeCoordinateDirectionalMover } from "./CoordinateDirectionalMover.js"
import { makeCoordinatePlanesMover } from "./CoordinatePlanesMover.js"
import { makeCoordinateRotator } from "./CoordinateRotator.js"

export function makeCoordinateMover(markerRaycaster: ReadOnlyRaycaster, parentCoordinate: Coordinate, camera: Camera) {
  const directionalMover = makeCoordinateDirectionalMover(parentCoordinate)
  const planeMover = makeCoordinatePlanesMover(parentCoordinate, camera, true)
  const rotator = makeCoordinateRotator(markerRaycaster, parentCoordinate, camera)

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
