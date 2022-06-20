import { Raycaster as ThreeRaycaster, Vector2 } from 'three'
import { ThreeCamera } from './ThreeCamera.js'
import { Item } from '../Item.js'

export class ThreeRaycasterAdapter implements Raycaster {
  #raycaster
  #camera: ThreeCamera
  #targets
  #rawTargets
  #rawTargetMap
  #cursor

  constructor(camera: ThreeCamera) {
    this.#raycaster = new ThreeRaycaster()
    this.#cursor = new Vector2(0, 0)
    this.#camera = camera
  }

  setTargets(targets: Array<Item>) {
    this.#targets = targets
    this.#rawTargets = targets.map(target => target.renderingObject.raw)

    this.#rawTargetMap = new Map()
    targets.map(target => this.#rawTargetMap.set(target.renderingObject.raw.uuid, target))
  }

  getObjects(cursorX: number, cursorY: number) {
    this.#cursor.x = cursorX
    this.#cursor.y = cursorY
    this.#raycaster.setFromCamera(this.#cursor, this.#camera.raw)

    return this.#raycaster.intersectObjects(this.#rawTargets).map(intersected => this.#rawTargetMap.get(intersected.object.uuid))
  }
}
