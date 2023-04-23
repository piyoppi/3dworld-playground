import { MoveProcess as IMoveProcess, MoveParams } from '../MoveProcess'
import { EndProcess as IEndProcess } from '../EndProcess'

export class MoveProcess implements IMoveProcess {
  constructor(
  ) {
  }

  move(_: MoveParams): IEndProcess | null {
    return null
  }
}
