import { Coordinate } from "../../../../../lib/Coordinate"
import { LineEdge } from "../../../../../lib/lines/lineEdge"
import { RenderingObject } from "../../../../../lib/RenderingObject"
import { RenderingObjectBuilder } from "../../../../../lib/RenderingObjectBuilder"

export type JointDisposeCallback = (coordinates: Coordinate[]) => boolean
export type JointUpdateRenderingObjectResult<T extends RenderingObject> = {renderingObject: T, coordinate: Coordinate}[]

export interface Joint<T extends RenderingObject> {
  readonly coordinate: Coordinate
  readonly edgeCount: number
  readonly disposed: boolean
  setRenderingObjects: (renderingObjects: T[]) => void
  setEdges: (edges: LineEdge[]) => void
  setWidth: (width: number) => void
  getOffset: () => number
  updateRenderingObject: (builder: RenderingObjectBuilder<T>) => JointUpdateRenderingObjectResult<T>
  dispose: (callback: JointDisposeCallback) => boolean
}
