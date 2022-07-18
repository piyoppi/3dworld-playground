import { Coordinate } from "./Coordinate"
import { MatrixArray4 } from "./Matrix"

export interface Camera {
  setAspect: (aspect: number) => void
  readonly coordinate: Coordinate
  readonly projectionMatrix: MatrixArray4
  projectionMatrixInverse: MatrixArray4
}
