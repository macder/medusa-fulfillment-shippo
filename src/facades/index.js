class ShippoFacade {
  #method

  #with

  constructor(methods) {
    this.#method = methods

    this.#with = {
      entity: null,
      method: null,
    }
  }

  async fetch(id, config) {
    let result = null

    if (this.#with.method) {
      result = await this.#fetchWith(id, config)
    } else {
      result = await this.#method.fetch(id, config)
    }
    this.#reset()
    return result
  }

  async fetchBy([entity, id], config) {
    const result = await this.#method.fetchBy[entity](id, config)
    return result
  }

  with(entity) {
    const method = this.#method.with[entity]

    this.#setWith({
      entity,
      method,
    })

    return this
  }

  async #fetchWith(id, config) {
    const parent = await this.#method.fetch(id, config)
    const child = await this.#with.method(id)

    const result = {
      ...parent,
      [this.#with.entity]: child,
    }

    return result
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
    return this
  }

  /* @deprecated */
  async isReturn(id) {
    const response = await this.#method.isReturn(id)
    return response
  }
}

export default ShippoFacade
