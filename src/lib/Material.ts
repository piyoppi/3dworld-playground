export type Side = 'front' | 'back' | 'both'

export interface Material {
  repeat: (x: number, y: number) => void
  setOpacity: (value: number) => void
  setSide: (value: Side) => void
}
