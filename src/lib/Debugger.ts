import { Item } from "./Item.js"
import { VectorArray3 } from "./Matrix.js"
import { Renderer } from './Renderer.js'
import { BoxGeometry, MeshBasicMaterial, Mesh, Object3D, Group } from 'three'
import { ThreePrimitiveRenderingObject, ThreeRenderingObject } from "./threeAdapter/ThreeRenderingObject.js"

let commonRenderer: Renderer<ThreeRenderingObject> | null = null

export const setRenderer = (renderer: Renderer<any>) => {
  commonRenderer = renderer
}

export const showPoint = (position: VectorArray3) => {
  if (!commonRenderer) return

  const item = new Item()
  item.parentCoordinate.x = position[0]
  item.parentCoordinate.y = position[1]
  item.parentCoordinate.z = position[2]

  const geometry = new BoxGeometry(0.02, 0.02, 0.02)
  const material = new MeshBasicMaterial({color: 0xFFFF00})
  material.depthTest = false

  commonRenderer.addItem(item.parentCoordinate, new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material)))
}
