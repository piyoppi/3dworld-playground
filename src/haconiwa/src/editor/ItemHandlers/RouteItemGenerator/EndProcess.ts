import { EndProcess as IEndProcess, EndParams } from '../EndProcess'
import { HandlingProcess as IHandlingProcess } from '../HandlingProcess'
import { HandlingProcess } from './HandlingProcess'

export class EndProcess implements IEndProcess {
  end(_: EndParams): IHandlingProcess {
    return new HandlingProcess()
  }
}
