import { Coordinate } from "./Coordinate"
import { VectorArray3 } from "./Matrix"

export class BallColider {
  #radius = 0

  constructor(radius: number) {
    this.#radius = radius  
  }

  checkRay(vec: VectorArray3, coordinate: Coordinate): boolean {

  }
}
