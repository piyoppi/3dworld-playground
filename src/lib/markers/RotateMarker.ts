import { PlaneColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { HandledColiders } from "./HandledColiders.js"
import type { SingleMarker } from "./Marker"
import type { MouseControllable } from "../mouse/MouseControllable.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster.js"
import type { RGBColor } from "../helpers/color.js"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import type { Renderer } from "../Renderer.js"
import { VectorArray3, Vec3 } from "../Matrix.js"
import { RenderingObject } from "../RenderingObject.js"

type RenderingParameters = {
  color: RGBColor
}

export class RotateMarker implements SingleMarker {
  #parentCoordinate: Coordinate
  #handledColiders = new HandledColiders()
  #colider: PlaneColider
  #innerRadius: number
  #outerRadius: number
  #plane: {
    position: VectorArray3,
    norm: VectorArray3
  }
  #renderingParameters: RenderingParameters = {
    color: {r: 255, g: 0, b: 0}
  }

  constructor(outerRadius: number, innerRadius: number, planePosition: VectorArray3, planeNorm: VectorArray3, parentCoordinate: Coordinate) {
    this.#outerRadius = outerRadius
    this.#innerRadius = innerRadius
    this.#plane = {
      position: planePosition,
      norm: planeNorm
    }

    this.#parentCoordinate = parentCoordinate
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

  setRenderingParameters(params: RenderingParameters) {
    this.#renderingParameters = {...this.#renderingParameters, ...params}
  }

  attachRenderingObjects<T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const coordinate = new Coordinate()
    coordinate.setDirectionZAxis(this.#plane.norm, this.#plane.position)
    this.#parentCoordinate.addChild(coordinate)

    const circleMesh = builder.makeAnnulus(this.#innerRadius, this.#outerRadius, this.#renderingParameters.color)
    circleMesh.material.setSide('both')
    renderer.addItem(coordinate, circleMesh)

    return () => {
      this.#parentCoordinate.removeChild(coordinate)
      renderer.removeItem(coordinate)
    }
  }
}
