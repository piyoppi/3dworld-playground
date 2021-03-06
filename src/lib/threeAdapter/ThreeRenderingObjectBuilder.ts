import { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import { ThreeRenderingObject } from "./ThreeRenderer.js"
import {
  CylinderGeometry,
  TetrahedronGeometry,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Group,
  Color
} from 'three'
import { Item } from '../Item.js'
import { RGBColor, convertRgbToHex } from '../helpers/color.js'

export class ThreeRenderingObjectBuilder implements RenderingObjectBuilder<ThreeRenderingObject> {
  makeVector(norm: number, shaftColor: RGBColor) {
    const cylinder = new CylinderGeometry(0.005, 0.005, norm, 8)
    const direction = new TetrahedronGeometry(0.015, 0)
    const material = new MeshBasicMaterial({color: 0xffff00})
    const directionMaterial = new MeshBasicMaterial({color: 0x0000ff})
    material.depthTest = false
    directionMaterial.depthTest = false

    material.color = new Color(convertRgbToHex(shaftColor))
    directionMaterial.color = new Color(convertRgbToHex(shaftColor))

    const cylinderMesh = new Mesh(cylinder, material)
    const directionMesh = new Mesh(direction, directionMaterial)

    cylinderMesh.position.y = 0
    directionMesh.position.y = norm / 2

    directionMesh.rotateZ(Math.PI / 4)
    directionMesh.rotateY(Math.PI / 4)

    const group = new Group()
    group.add(cylinderMesh)
    group.add(directionMesh)

    return {
      item: group
    }
  }

  makeBox(width: number, height: number, depth: number, color: RGBColor) {
    const geometry = new BoxGeometry(width, height, depth);
    const material = new MeshBasicMaterial( {color: convertRgbToHex(color)} );

    return {
      item: {
        geometry,
        material
      }
    }
  }
}
