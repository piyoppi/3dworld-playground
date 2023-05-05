import { CallbackFunctions } from "../../../../lib/CallbackFunctions.js"
import type { Command } from "./Command"
import type { Input, KeyDownCallback } from "./Input"

export class Keyboard implements Input {
  private keyDownCallbacks = new CallbackFunctions<KeyDownCallback>()

  private mappings: {[key: string]: Command} = {
    'Delete': {key: 'delete'}
  }

  addKeyDownCallback(callback: KeyDownCallback): (() => void) {
    this.keyDownCallbacks.add(callback)

    return () => this.keyDownCallbacks.remove(callback)
  }

  mount() {
    const handler = (event: KeyboardEvent) => {
      const key = this.mappings[event.key]

      if (key) {
        this.keyDownCallbacks.call(key)
      }
    }

    window.addEventListener('keydown', handler)

    return () => window.removeEventListener('keydown', handler)
  }
}
