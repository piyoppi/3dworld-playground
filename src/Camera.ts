import { Coordinate } from "./Coordinate"

export interface Camera {
  setAspect: (aspect: number) => void
  readonly coordinate: Coordinate
}
