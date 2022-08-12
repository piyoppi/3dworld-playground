import { VectorArray3 } from "../Matrix"

export interface Line {
  readonly length: number
  getPosition: (t: number) => VectorArray3
  getDirection: (t: number) => VectorArray3
}
