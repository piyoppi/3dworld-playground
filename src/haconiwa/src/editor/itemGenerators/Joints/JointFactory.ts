import type { Joint } from "./Joint"
import { CallbackFunction, CallbackFunctions } from "../../../../../lib/CallbackFunctions.js"
import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import { NoneJoint } from "./NoneJoint.js"

export abstract class JointFactory<T extends RenderingObject> {
  #onReadyForRenderingCallbacks = new CallbackFunctions<CallbackFunction<[Joint<T>], void>>()

  addOnReadyForRenderingCallback(fn: CallbackFunction<[Joint<T>], void>) {
    this.#onReadyForRenderingCallbacks.add(fn)
  }

  createJoint(intersectionCount: number) {
    switch(intersectionCount) {
      case 2:
        return this.createCorner()
      case 3:
        return this.createThreeWayJunction()
      default:
        return new NoneJoint<T>()
    }
  }

  protected readyForRendering(joint: Joint<T>) {
    this.#onReadyForRenderingCallbacks.call(joint)
  }

  protected abstract createCorner(): Joint<T>
  protected abstract createThreeWayJunction(): Joint<T>
}
