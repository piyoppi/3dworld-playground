import type { VectorArray3 } from "../Matrix"
import type { LineEdge } from "./lineEdge"

export interface Line {
  readonly length: number
  readonly controlPoints: Array<VectorArray3>
  readonly edges: [LineEdge, LineEdge]
  setControlPoint: (index: number, val: VectorArray3) => void
  setUpdatedCallback: (func: () => void) => void
  getPosition: (t: number) => VectorArray3
  getDirection: (t: number) => VectorArray3
}
