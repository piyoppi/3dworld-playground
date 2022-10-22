import { RenderingObject } from "../../../../../lib/RenderingObject.js"
import { Corner } from "./Corner.js"
import { NoneJoint } from "./NoneJoint.js"

export function createJoint<T extends RenderingObject<unknown>>(intersectionCount: number) {
  const map = [
    NoneJoint<T>,
    Corner<T>
  ]

  const cls = map[intersectionCount]

  return cls ? new cls() : new NoneJoint<T>()
}
