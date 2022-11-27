import { RenderingObjectBuilder } from '../RenderingObjectBuilder.js'
import { ThreeGroup, ThreePrimitiveRenderingObject, ThreeRenderingObject } from "./ThreeRenderingObject.js"
import {
  CylinderGeometry,
  TetrahedronGeometry,
  SphereGeometry,
  BoxGeometry,
  CircleGeometry,
  MeshBasicMaterial,
  PolyhedronBufferGeometry,
  Mesh,
  Group,
  Color,
  PlaneGeometry,
  BufferGeometry,
  BufferAttribute,
} from 'three'
import { RGBColor, convertRgbToHex } from '../helpers/color.js'
import { VectorArray3 } from '../Matrix.js'

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

    return new ThreeRenderingObject(new ThreeGroup(group))
  }

  makeBox(width: number, height: number, depth: number, color: RGBColor) {
    const geometry = new BoxGeometry(width, height, depth)
    const material = new MeshBasicMaterial({color: convertRgbToHex(color)})

    return new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material))
  }

  makeSphere(radius: number, color: RGBColor) {
    const geometry = new SphereGeometry(radius, 16, 16)
    const material = new MeshBasicMaterial({color: convertRgbToHex(color)})

    return new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material))
  }

  makePlane(width: number, height: number, color: RGBColor) {
    const geometry = new PlaneGeometry(width, height)
    const material = new MeshBasicMaterial({color: convertRgbToHex(color)})

    return new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material))
  }

  makeCircle(radius: number, angle: number, angleOffset: number, color: RGBColor) {
    const geometry = new CircleGeometry(radius, 32, angleOffset, angle)
    const material = new MeshBasicMaterial({ color: convertRgbToHex(color) })

    return new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material))
  }

  makePolygones(points: VectorArray3[], color: RGBColor) {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points.flat()), 3))
    const material = new MeshBasicMaterial({ color: convertRgbToHex(color) })

    return new ThreeRenderingObject(new ThreePrimitiveRenderingObject(geometry, material))
  }
}
