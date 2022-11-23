import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import type { Joint } from "./Joint"
import { NoneJoint } from "./NoneJoint.js"

export abstract class JointFactory<T extends RenderingObject> {
  createJoint(intersectionCount: number) {
    switch(intersectionCount) {
      case 2:
        return this.createCorner()
      default:
        return new NoneJoint<T>()
    }
  }

  protected abstract createCorner(): Joint<T>
}
