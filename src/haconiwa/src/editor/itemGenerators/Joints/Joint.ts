import { VectorArray3 } from "../../../../../lib/Matrix"
import type { RenderingObject } from "../../../../../lib/RenderingObject"
import { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"

export interface Joint<T> {
  setConnectedDirections: (directions: VectorArray3[]) => void
  setWidth: (width: number) => void
  getOffset: () => number
  makeRenderingObject: (builder: RenderingObjectBuilder<T>) => RenderingObject<T>
}
