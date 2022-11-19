import type { VectorArray3 } from '../Matrix.js'
import { RenderingObject } from '../RenderingObject.js'
import { BufferGeometry, Material as ThreeMaterialRaw, Mesh, Group, Box3, Texture, Source } from 'three'
import { ThreeMaterial } from './ThreeMaterial.js'


interface ThreeRenderingObjectRaw {
  readonly wrappedMaterial: ThreeMaterial
  clone(): ThreeRenderingObjectRaw
}

export class ThreePrimitiveRenderingObject implements ThreeRenderingObjectRaw {
  #geometry: BufferGeometry
  #material: ThreeMaterial
  #materialRaw: ThreeMaterialRaw

  constructor(geometry: BufferGeometry, material: ThreeMaterialRaw) {
    this.#geometry = geometry
    this.#material = new ThreeMaterial([material])
    this.#materialRaw = material
  }

  get geometry() {
    return this.#geometry
  }

  get material() {
    return this.#materialRaw
  }

  get wrappedMaterial() {
    return this.#material
  }

  clone() {
    return new ThreePrimitiveRenderingObject(this.#geometry.clone(), this.#materialRaw.clone())
  }
}

export class ThreeGroup implements ThreeRenderingObjectRaw {
  #group: Group

  constructor(group: Group) {
    this.#group = group
  }

  getMaterials() {
    return this.#group.children
      .map(item => item instanceof Mesh ? item.material : null)
      .filter((item): item is ThreeMaterialRaw => !!item)
  }

  get group() {
    return this.#group
  }

  get wrappedMaterial() {
    return new ThreeMaterial(this.getMaterials())
  }

  clone() {
    const cloned = new ThreeGroup(this.#group.clone())

    cloned.group.children = cloned.group.children.map((item) => {
      if (item instanceof Mesh) {
        const originalMaterial = item.material
        item.material = item.material.clone()
        if (originalMaterial.map) {
          const originalTexture = originalMaterial.map
          item.material.map = originalTexture.clone()
          item.material.map.source = new Source(originalTexture.image)
          item.material.map.needsUpdate = true
        }
      }

      return item
    })

    return cloned
  }
}

export class ThreeRenderingObject implements RenderingObject {
  #item: ThreeRenderingObjectRaw
  #size: VectorArray3 = [0, 0, 0]

  constructor(item: ThreeRenderingObjectRaw) {
    this.#item = item

    const boundingBox =
      (item instanceof ThreePrimitiveRenderingObject) ? item.geometry.boundingBox :
      (item instanceof ThreeGroup) ? new Box3().setFromObject(item.group) : null

    if (boundingBox) {
      this.#size = [
        boundingBox.max.x - boundingBox.min.x,
        boundingBox.max.y - boundingBox.min.y,
        boundingBox.max.z - boundingBox.min.z
      ]
    }
  }

  get item() {
    return this.#item
  }

  get material() {
    return this.item.wrappedMaterial
  }

  get size() {
    return this.#size
  }

  clone() {
    return new ThreeRenderingObject(this.#item.clone())
  }
}
