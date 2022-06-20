import { Item } from './Item.js'

export interface Raycaster {
  setTargets: (targets: Array<Item>) => void,
  getObjects: (cursorX: number, cursorY: number) => Item
}
