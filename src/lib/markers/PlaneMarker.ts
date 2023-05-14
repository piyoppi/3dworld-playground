import { PlaneColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { HandledColiders } from "./HandledColiders.js"
import { Vec3, VectorArray3 } from "../Matrix.js"
import type { RenderingObject } from "../RenderingObject"
import type { MouseControllable } from "../mouse/MouseControllable"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { Raycaster } from "../Raycaster"
import type { Renderer } from "../Renderer"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { RGBColor } from "../helpers/color"
import type { SingleMarker } from "./Marker"

type RenderingParameters = {
  color: RGBColor
}

export class PlaneMarker implements SingleMarker {
  #size: number
  #norm: VectorArray3 
  #parentCoordinate: Coordinate
  #handledColiders = new HandledColiders()
  #colider: PlaneColider
  #renderingParameters: RenderingParameters = {
    color: {r: 255, g: 0, b: 0}
  }

  constructor(size: number, norm: VectorArray3, axis: VectorArray3, parentCoordinate: Coordinate) {
    this.#size = size
    this.#norm = norm

    this.#parentCoordinate = parentCoordinate
    this.#colider = new PlaneColider(this.#parentCoordinate, norm)


    this.#colider.setEdgeEvaluator((dist, ray) => {
      const vec = Vec3.subtract(this.#parentCoordinate.position, Vec3.add(ray.position, Vec3.mulScale(ray.direction, dist)))
      const vecLength = Vec3.norm(vec)
      const angle = Math.acos(Vec3.dotprod(vec, axis) / vecLength)

      const x = Math.abs(vecLength * Math.cos(angle))
      const y = Math.abs(vecLength * Math.sin(angle))

      return x <= size / 2 && y <= size / 2
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

  addHandler(handler: MouseControllable) {
    this.#handledColiders.addHandler({colider: this.#colider, handled: handler})
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.detach(raycaster, interactionHandler)
  }

  setRenderingParameters(params: RenderingParameters) {
    this.#renderingParameters = {...this.#renderingParameters, ...params}
  }

  attachRenderingObjects<T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const coordinate = new Coordinate()
    coordinate.setDirectionZAxis(this.#norm, [0, 0, 0])
    this.#parentCoordinate.addChild(coordinate)

    const renderingItem = builder.makePlane(this.#size, this.#size, this.#renderingParameters.color)
    renderingItem.material.setSide('both')
    renderer.addItem(coordinate, renderingItem)

    return () => {
      renderer.removeItem(coordinate)
      this.#parentCoordinate.removeChild(coordinate)
    }
  }
}
