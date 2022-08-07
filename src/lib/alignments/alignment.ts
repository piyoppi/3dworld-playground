import { VectorArray3 } from "../Matrix"

export interface Alignable {
  position: VectorArray3
}

export interface Alignment {
  align: (items: Array<Alignable>, span: number) => void
}
