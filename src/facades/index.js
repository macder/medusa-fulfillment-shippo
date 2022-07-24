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
      const parent = await this.#method.fetch(id, config)
      const child = await this.#with.method(id)

      result = {
        ...parent,
        [this.#with.entity]: child,
      }
    } else {
      result = await this.#method.fetch(id, config)
    }
    this.#reset()
    return result
  }

  async fetchBy([entity, id], config) {
    const response = await this.#method.fetchBy[entity](id, config)
    return response
  }

  with(entity) {
    const method = this.#method.with[entity]

    this.#setWith({
      entity,
      method,
    })

    return this
  }

  find() {
    console.log("facade find")
    return this
  }

  for() {
    console.log("facade for")
    return this
  }

  is() {
    console.log("facade is")
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
    return this
  }

  /* @deprecated */
  async isReturn(id) {
    console.log("deprecated")
    const response = await this.#method.isReturn(id)
    return response
  }
}

export default ShippoFacade
