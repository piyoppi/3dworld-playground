import type { MouseControlHandles } from "../mouse/MouseControlHandles"
import type { RenderingObjectBuilder } from '../RenderingObjectBuilder'
import type { RGBColor } from "../helpers/color"
import type { Renderer } from "../Renderer"
import type { Marker } from "./Marker"
import { Coordinate } from "../Coordinate.js"
import { MouseControllable } from "../mouse/MouseControllable.js"
import { Raycaster } from "../Raycaster.js"
import { HandledColiders } from "./HandledColiders.js"
import { BoxColider } from "../Colider.js"
import { VectorArray3 } from "../Matrix.js"

type RenderingParameters = {
  color: RGBColor
}

export class BoxMarker implements Marker {
  #parentCoordinate = new Coordinate()
  #handledColiders: HandledColiders
  #colider: BoxColider 
  #size: VectorArray3
  #renderingParameters: RenderingParameters = {
    color: {r: 255, g: 0, b: 0}
  }

  constructor(size: VectorArray3, parentCoordinate: Coordinate) {
    this.#handledColiders = new HandledColiders()
    this.#colider = new BoxColider(size[0], size[1], size[2], parentCoordinate)
    this.#size = size
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

    return this.#colider
  }

  attach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.attach(raycaster, interactionHandler)
  }

  detach(raycaster: Raycaster, interactionHandler: MouseControlHandles) {
    this.#handledColiders.detach(raycaster, interactionHandler)
  }

  setRenderingParameters(parameters: Partial<RenderingParameters>) {
    this.#renderingParameters = {...this.#renderingParameters, ...parameters}
  }

  attachRenderingObjects<T>(builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) {
    const coordinate = new Coordinate()
    this.#parentCoordinate.addChild(coordinate)

    renderer.addItem(this.#parentCoordinate, builder.makeBox(this.#size[0], this.#size[1], this.#size[2], this.#renderingParameters.color))

    return () => {
      renderer.removeItem(coordinate)
      this.#parentCoordinate.removeChild(coordinate)
    }
  }
}
