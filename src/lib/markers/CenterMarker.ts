import { Colider, CoordinatedColider } from "../Colider.js"
import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import { HandledColiders } from "./HandledColiders.js"
import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { SingleMarker } from "./Marker"
import type { RenderingObject } from "../RenderingObject"

type RenderingParameters = {
  radius: number,
  color: RGBColor
}

export class CenterMarker implements SingleMarker {
  #handledColiders: HandledColiders
  #colider: CoordinatedColider
  #parentCoordinate: Coordinate
  #renderingParameters: RenderingParameters = {
    radius: 0.5,
    color: {r: 255, g: 0, b: 0}
  }

  constructor(colider: CoordinatedColider) {
    this.#parentCoordinate = colider.parentCoordinate

    this.#handledColiders = new HandledColiders()
    this.#colider = colider
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

  attach(raycaster: Raycaster<CoordinatedColider>, interactionHandler: MouseControlHandles) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster<CoordinatedColider>, interactionHandler: MouseControlHandles) {
    this.#handledColiders.detach(raycaster, interactionHandler)
  }

  setRenderingParameters(params: {radius: number}) {
    this.#renderingParameters = {...this.#renderingParameters, ...params}
  }

  attachRenderingObjects<T extends RenderingObject>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const coordinate = new Coordinate()

    this.#parentCoordinate.addChild(coordinate)

    const renderingObject = builder.makeSphere(this.#renderingParameters.radius, this.#renderingParameters.color)
    renderer.addItem(coordinate, renderingObject)

    return () => {
      renderer.removeItem(coordinate)
      this.#parentCoordinate.removeChild(coordinate)
    }
  }
}
