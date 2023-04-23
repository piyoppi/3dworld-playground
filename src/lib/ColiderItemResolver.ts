import type { ColiderItemMap } from './ColiderItemMap'
import type { Colider } from './Colider'

export class ColiderItemResolver<T> {
  constructor(
    private coliderItemMap: ColiderItemMap<T>
  ) { }

  resolve(colider: Colider): T | null {
    return this.coliderItemMap.getItem(colider) || null
  }
}
