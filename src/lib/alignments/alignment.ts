import { VectorArray3 } from "../Matrix"

export interface Aligned {
  position: VectorArray3
  direction: VectorArray3
}

export interface Alignment {
  align: (itemCount: number, span: number) => Array<Aligned>
}
