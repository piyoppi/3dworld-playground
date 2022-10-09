import { Material } from "../Material"
import { Material as ThreeMaterialRaw, MeshBasicMaterial, MeshStandardMaterial } from "three"

export class ThreeMaterial implements Material {
  #materialsRaw: ThreeMaterialRaw[]

  constructor(materials: ThreeMaterialRaw[]) {
    this.#materialsRaw = materials
  }

  get raw() {
    return this.#materialsRaw
  }

  repeat(x: number, y: number) {
    this.#materialsRaw.forEach(material => {
      if ((material instanceof MeshBasicMaterial || material instanceof MeshStandardMaterial) && material.map) {
        material.map.repeat.x = x
        material.map.repeat.y = y
      }
    })
  }
}
