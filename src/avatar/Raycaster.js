import * as THREE from 'three'

export class Raycaster {
  #raycaster
  #camera
  #targets
  #rawTargets
  #rawTargetMap
  #cursor

  constructor() {
    this.#raycaster = new THREE.Raycaster()
    this.#cursor = new THREE.Vector2(0, 0)
  }

  setCamera(camera) {
    this.#camera = camera
  }

  setTargets(targets) {
    this.#targets = targets
    this.#rawTargets = targets.map(target => target.renderingObject.raw)

    this.#rawTargetMap = new Map()
    targets.map(target => this.#rawTargetMap.set(target.renderingObject.raw.uuid, target))
  }

  getObjects(cursorX, cursorY) {
    this.#cursor.x = cursorX
    this.#cursor.y = cursorY
    this.#raycaster.setFromCamera(this.#cursor, this.#camera.raw)

    return this.#raycaster.intersectObjects(this.#rawTargets).map(intersected => this.#rawTargetMap.get(intersected.object.uuid))
  }
}
