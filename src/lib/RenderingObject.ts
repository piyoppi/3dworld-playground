import type { Material } from "./Material"
import type { VectorArray3 } from "./Matrix"

export interface RenderingObject<T> {
  readonly size: VectorArray3
  clone: () => T
  readonly material: Material
}
