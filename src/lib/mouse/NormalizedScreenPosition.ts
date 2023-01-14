import { VectorArray2 } from "../Matrix";

export function getNormalizedScreenPosition(position: VectorArray2, size: VectorArray2): VectorArray2 {
  return [
    (position[0] / size[0]) * 2 - 1,
    -(position[1] / size[1]) * 2 + 1
  ]
}
