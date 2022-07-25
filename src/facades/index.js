class ShippoFacade {
  #entity

  #method

  #with

  constructor(methods) {
    this.#method = methods

    this.#with = {
      entity: null,
      method: null,
    }

    this.#entity = {
      id: null,
      type: null,
    }

    this.is = this.#setEntity
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

  async type(attr) {
    const { id } = this.#entity
    const result = await this.#method.type([this.#entity.type, id], attr)

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

  #setEntity([type, id]) {
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
    return this
  }
}

export default ShippoFacade
