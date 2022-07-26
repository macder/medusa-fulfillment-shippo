class ShippoFacade {
  #entity

  #methods

  #call

  #with

  constructor(methods) {
    this.#methods = methods

    this.#call = null

    this.#with = {
      entity: null,
      method: null,
    }

    this.#entity = {
      id: null,
      type: null,
    }

    this.is = this.#is
    this.for = this.#setEntity
  }

  #is([entity, id], attr) {
    this.#setEntity([entity, id])
    this.#setCall(this.#methods.is[attr])
    return this
  }

  #setCall(method) {
    this.#call = method
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

  #setEntity([type, id = null]) {
    this.#entity = {
      id,
      type,
    }
    return this
  }

  #setWith(params) {
    this.#with = {
      ...params,
    }
    return this.#with
  }

  #reset() {
    this.#with = {
      entity: null,
      method: null,
    }
    this.#entity = {
      id: null,
      type: null,
    }
    this.#call = null
    return this
  }
}

export default ShippoFacade
