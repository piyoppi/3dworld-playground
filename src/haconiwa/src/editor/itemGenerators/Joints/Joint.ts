import { Coordinate } from "../../../../../lib/Coordinate"
import { LineEdge } from "../../../../../lib/lines/lineEdge"
import { Renderer } from "../../../../../lib/Renderer"
import { RenderingObject } from "../../../../../lib/RenderingObject"
import { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"

export interface Joint<T extends RenderingObject> {
  readonly coordinate: Coordinate
  readonly edgeCount: number
  readonly disposed: boolean
  setRenderingObjects: (renderingObjects: T[]) => void
  setEdges: (edges: LineEdge[]) => void
  setWidth: (width: number) => void
  getOffset: () => number
  updateRenderingObject: (builder: RenderingObjectBuilder<T>, renderer: Renderer<T>) => void
  dispose: (renderer: Renderer<T>) => void
}
