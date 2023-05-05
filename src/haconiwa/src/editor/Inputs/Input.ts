import type { Command } from "./Command"

export type KeyDownCallback = (key: Command) => void

export interface Input {
  addKeyDownCallback: (callback: KeyDownCallback) => (() => void)
  mount: () => (() => void)
}
