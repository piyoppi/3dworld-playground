import type { Material } from "./Material"
import type { VectorArray3 } from "./Matrix"

export interface RenderingObject {
  readonly size: VectorArray3
  clone(): RenderingObject
  readonly material: Material
}
