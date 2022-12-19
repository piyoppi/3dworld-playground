import { Material } from "../Material"
import { Material as ThreeMaterialRaw, MeshBasicMaterial, MeshStandardMaterial } from "three"

export class ThreeMaterial implements Material {
  #materialsRaw: ThreeMaterialRaw[]

  constructor(materials: ThreeMaterialRaw[]) {
    this.#materialsRaw = materials
  }

  get rawMaterials() {
    return this.#materialsRaw
  }

  setOpacity(value: number) {
    this.#materialsRaw.forEach(material => {
      material.transparent = true
      material.opacity = value
    })
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
