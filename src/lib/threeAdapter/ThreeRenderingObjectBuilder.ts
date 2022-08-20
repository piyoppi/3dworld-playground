import { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import { ThreePrimitiveRenderingObject, ThreeRenderingObject } from "./ThreeRenderer.js"
import {
  CylinderGeometry,
  TetrahedronGeometry,
  SphereGeometry,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Group,
  Color
} from 'three'
import { RGBColor, convertRgbToHex } from '../helpers/color.js'

export class ThreeRenderingObjectBuilder implements RenderingObjectBuilder<ThreeRenderingObject> {
  makeVector(norm: number, radius: number, shaftColor: RGBColor) {
    const cylinder = new CylinderGeometry(radius, radius, norm, 8)
    const direction = new TetrahedronGeometry(radius * 3, 0)
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

    return new ThreeRenderingObject(group)
  }

  makeBox(width: number, height: number, depth: number, color: RGBColor) {
    const geometry = new BoxGeometry(width, height, depth);
    const material = new MeshBasicMaterial( {color: convertRgbToHex(color)} );

    return new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material))
  }

  makeSphere(radius: number, color: RGBColor) {
    const geometry = new SphereGeometry(radius, 16, 16);
    const material = new MeshBasicMaterial( {color: convertRgbToHex(color)} );

    return new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material))
  }
}
