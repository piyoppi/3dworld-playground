import { VectorArray3 } from "../Matrix"

export interface Line {
  readonly length: number
  readonly controlPoints: Array<VectorArray3>
  getPosition: (t: number) => VectorArray3
  getDirection: (t: number) => VectorArray3
}
