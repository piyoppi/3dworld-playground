import { Coordinate } from "../../Coordinate"
import { VectorArray3 } from "../../Matrix"
import { CursorModifier } from "./cursorModifiers/CursorModifier"

export type PositionApplyer = (coordinate: Coordinate, position: VectorArray3) => void

export interface PositionChangable {
  setCursorModifier: (modifier: CursorModifier) => void
  clearCursorModifier: () => void
  setApplyer: (fn: PositionApplyer) => void
}
