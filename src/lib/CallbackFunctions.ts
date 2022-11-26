export type CallbackFunction<T extends Array<unknown>, U> = (...vars: T) => U
export type CallbackFunctionParams<T> = T extends CallbackFunction<infer Vars, unknown> ? Vars : never
export type CallbackFunctionReturned<T> = T extends CallbackFunction<any, infer Ret> ? Ret : never

export class CallbackFunctions<T extends CallbackFunction<Array<any>, V>, U extends Array<unknown> = CallbackFunctionParams<T>, V = CallbackFunctionReturned<T>> {
  #functions: Array<T> = []

  add(func: T) {
    this.#functions.push(func)
  }

  call(...vars: U): Array<V> {
    return this.#functions.map(func => func(...vars))
  }

  remove(func: T) {
    const target = this.#functions.findIndex(val => val === func)

    if (target < 0) {
      throw new Error('The callback function is not found.')
    }

    this.#functions.splice(target, 1)
  }
}
