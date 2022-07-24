class ShippoFacade {
  #method

  constructor(methods) {
    this.#method = methods
  }

  async fetch(id, config) {
    const response = await this.#method.fetch(id, config)
    return response
  }

  async fetchBy([entity, id], config) {
    const response = await this.#method.fetchBy[entity](id, config)
    return response
  }

  with(entity) {
    console.log("facade with")
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
}

export default ShippoFacade
