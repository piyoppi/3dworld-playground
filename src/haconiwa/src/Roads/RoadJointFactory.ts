import { ThreeGroup, ThreeRenderingObject } from "../../../lib/threeAdapter/ThreeRenderingObject.js"
import { JointFactory } from "../editor/itemGenerators/Joints/JointFactory.js"
import { Corner } from "../editor/itemGenerators/Joints/Corner.js"
import type { Joint } from "../editor/itemGenerators/Joints/Joint"
import { loadGlb } from '../../../lib/threeAdapter/ThreeLoaderHelper.js'

export class RoadJointFactory extends JointFactory<ThreeRenderingObject> {
  async createCorner(): Promise<Joint<ThreeRenderingObject>> {
    const fragment = new ThreeRenderingObject(new ThreeGroup(await loadGlb('./assets/road.glb')))
    return new Corner(fragment)
  }
}
