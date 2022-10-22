import { Coordinate } from "../../../../../lib/Coordinate"
import { VectorArray3 } from "../../../../../lib/Matrix"
import { Renderer } from "../../../../../lib/Renderer"
import { RenderingObject } from "../../../../../lib/RenderingObject"
import { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"

export interface Joint<T extends RenderingObject<unknown>> {
  readonly coordinate: Coordinate
  readonly directionLength: number
  setPosition: (position: VectorArray3) => void
  setConnectedDirections: (directions: VectorArray3[]) => void
  setWidth: (width: number) => void
  getOffset: () => number
  updateRenderingObject: (builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) => void
  dispose: (renderer: Renderer<T>) => void
}
