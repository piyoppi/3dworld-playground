import { Coordinate } from './Coordinate.js'

export interface Scene {
  add: (coordinate: Coordinate) => void
}
