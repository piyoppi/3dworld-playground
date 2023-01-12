import { PlaneColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { HandledColiders } from "./HandledColiders.js"
import type { SingleMarker, MarkerRenderable } from "./Marker"
import type { MouseControllable } from "../mouse/MouseControllable.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster.js"
import type { RGBColor } from "../helpers/color.js"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import type { Renderer } from "../Renderer.js"
import { VectorArray3, Vec3 } from "../Matrix.js"
import { RenderingObject } from "../RenderingObject.js"

export class RotateMarker implements SingleMarker, MarkerRenderable {
  #parentCoordinate = new Coordinate()
  #markerCoordinate = new Coordinate()
  #handledColiders = new HandledColiders()
  #colider: PlaneColider
  #innerRadius: number
  #outerRadius: number
  #planePosition: VectorArray3
  #planeNorm: VectorArray3

  constructor(outerRadius: number, innerRadius: number, planePosition: VectorArray3, planeNorm: VectorArray3) {
    this.#outerRadius = outerRadius
    this.#innerRadius = innerRadius
    this.#planePosition = planePosition
    this.#planeNorm = planeNorm
    this.#markerCoordinate.setDirectionZAxis(planeNorm, planePosition)

    this.#colider = new PlaneColider(this.#parentCoordinate, planeNorm)
    this.#colider.setEdgeEvaluator((dist, ray) => {
      const val = Vec3.norm(
        Vec3.subtract(this.#parentCoordinate.position, Vec3.add(ray.position, Vec3.mulScale(ray.direction, dist)))
      )

      return this.#innerRadius <= val && val <= this.#outerRadius
    })
  }

  get parentCoordinate() {
    return this.#parentCoordinate
  }

  get markerCoordinates() {
    return [this.#markerCoordinate]
  }

  get handlers() {
    return this.#handledColiders.handlers
  }

  get coliders() {
    return [this.#colider]
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.detach(raycaster, interactionHandler)
  }

  addHandler(handler: MouseControllable) {
    this.#handledColiders.addHandler({colider: this.#colider, handled: handler})
  }

  setParentCoordinate(coordinate: Coordinate) {
    this.#parentCoordinate = coordinate
    this.#parentCoordinate.addChild(this.#markerCoordinate)
    this.#colider.parentCoordinate = coordinate
  }

  attachRenderingObject<T extends RenderingObject>(color: RGBColor, builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const circleMesh = builder.makeAnnulus(this.#innerRadius, this.#outerRadius, color)
    circleMesh.material.setSide('both')
    renderer.addItem(this.#markerCoordinate, circleMesh)
  }
}
