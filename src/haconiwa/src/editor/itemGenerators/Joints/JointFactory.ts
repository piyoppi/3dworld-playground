import { Corner } from "./Corner.js"

export function createJoint(intersectionCount: number) {
  const map = [
    null,
    Corner
  ]

  const cls = map[intersectionCount]

  return cls ? new cls() : null
}
