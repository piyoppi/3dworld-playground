import { VectorArray3 } from "../../../../../lib/Matrix"
import { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"

export interface Joint {
  setConnectedDirections: (directions: VectorArray3[]) => void
  setWidth: (width: number) => void
  getOffset: () => number
  makeRenderingObject: <T>(builder: RenderingObjectBuilder<T>) => T
}
