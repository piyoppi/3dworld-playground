import { ThreeGroup, ThreeRenderingObject } from "../../../lib/threeAdapter/ThreeRenderingObject.js"
import { JointFactory } from "../editor/itemGenerators/Joints/JointFactory.js"
import { Corner } from "../editor/itemGenerators/Joints/Corner.js"
import type { Joint } from "../editor/itemGenerators/Joints/Joint"
import { loadGlb } from '../../../lib/threeAdapter/ThreeLoaderHelper.js'

export class RoadJointFactory extends JointFactory<ThreeRenderingObject> {
  createCorner(): Joint<ThreeRenderingObject> {
    const corner = new Corner<ThreeRenderingObject>()

    loadGlb('./assets/road-corner.glb').then(glb => {
      const fragment = new ThreeRenderingObject(new ThreeGroup(glb))
      corner.setRenderingObjects([fragment])
      this.readyForRendering(corner)
    })

    return corner
  }
}
