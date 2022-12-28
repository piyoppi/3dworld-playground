import { Material, Side } from "../Material"
import { BackSide, DoubleSide, FrontSide, Material as ThreeMaterialRaw, MeshBasicMaterial, MeshStandardMaterial, Side as ThreeSide } from "three"

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

  setSide(value: Side) {
    const convertMap = {
      'front': FrontSide,
      'back': BackSide,
      'both': DoubleSide
    }

    const converted: ThreeSide = convertMap[value]

    if (!converted) {
      throw new Error('The value of side is invalid.')
    }

    this.#materialsRaw.forEach(material => material.side = converted)
  }
}
