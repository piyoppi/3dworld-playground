import type { VectorArray3 } from "../../../Matrix"
import type { Line } from "../../../lines/line"

export interface LineGenerator {
  setStartPosition: (pos: VectorArray3) => void
  setEndPosition: (pos: VectorArray3) => void
  getLine: () => Line
}
