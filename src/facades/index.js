class ShippoFacade {
  #entity

  #methods

  #call

  #with

  constructor(methods) {
    this.#methods = methods

    this.#call = null

    this.#with = Object.freeze({
      entity: null,
      method: null,
    })

    this.#entity = Object.freeze({
      id: null,
      type: null,
    })

    this.is = this.#is
    this.for = this.#for
  }

  async fetch(id = this.#entity.id, config) {
    const fetch = this.#call ?? this.#methods.fetch

    const result = this.#with.method
      ? await this.#fetchWith(id, config)
      : await fetch(id, config)

    this.#reset()
    return result
  }

  async fetchBy([entity, id], config) {
    const result = await this.#methods.fetchBy[entity](id, config)
    return result
  }

  with(entity) {
    const method = this.#methods.with[entity]

    this.#setWith({
      entity,
      method,
    })

    return this
  }

  async #fetchWith(id, config) {
    const parent = await this.#methods.fetch(id, config)
    const child = await this.#with.method(id)

    const result = {
      ...parent,
      [this.#with.entity]: child,
    }

    return result
  }

  #for([entity, id]) {
    this.#setEntity([entity, id])
    this.#setCall(this.#methods.for[entity])
    return this
  }

  #is([entity, id], attr) {
    this.#setEntity([entity, id])
    this.#setCall(this.#methods.is[attr])
    return this
  }

  #reset() {
    this.#setWith({
      entity: null,
      method: null,
    })
    this.#setEntity([null, null])
    this.#setCall(null)
    return this
  }

  #setCall(method) {
    this.#call = method
  }

  #setEntity([type, id = null]) {
    const set = {
      id,
      type,
    }
    this.#entity = Object.freeze(set)
    return this
  }

  #setWith({ entity, method }) {
    const set = {
      entity,
      method,
    }
    this.#with = Object.freeze(set)
    return this.#with
  }
}

export default ShippoFacade
