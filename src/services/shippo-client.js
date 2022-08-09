import { BaseService } from "medusa-interfaces"
import path from "path"
import { getConfigFile } from "medusa-core-utils"
import shippo from "@macder/shippo"

class ShippoClientService extends BaseService {
  #client

  #options

  constructor({}, options) {
    super()

    this.#setConfig(options)
    this.#setClient()

    this.useClient = this.getClient()
  }

  /**
   * Fetches the shippo account's default sender address
   * @return {Object} address object
   */
  async fetchSenderAddress() {
    return this.#client.account
      .address()
      .then((response) =>
        response.results.find((address) => address.is_default_sender === true)
      )
  }

  /**
   * Generic polling
   * @param {function} fn - callable to execute with
   * @param {function} validate - callable to validate each result, must return bool
   * @param {number} interval - milliseconds between requests
   * @param {number} maxAttempts - maximum attempts
   * @return {function.<promise>} - resulting promise
   */
  async poll({ fn, validate, interval, maxAttempts }) {
    let attempts = 0

    const executePoll = async (resolve, reject) => {
      const result = await fn()
      attempts += 1

      if (validate(result)) {
        return resolve(result)
      }
      if (maxAttempts && attempts === maxAttempts) {
        return reject("Exceeded max attempts")
      }
      setTimeout(executePoll, interval, resolve, reject)
    }
    return new Promise(executePoll)
  }

  /**
   * Gets an instance of "shippo-node-client"
   * Also accessible via the more convenient public prop "useClient"
   * @return {object} address object
   */
  getClient() {
    return this.#initClient()
  }

  async #fetchCarriers() {
    // should paginate or poll
    return this.#client.carrieraccount
      .list({ service_levels: true, results: 100 })
      .then((response) => response.results)
  }

  async #fetchServiceGroups() {
    return this.#client.servicegroups.list().then((groups) =>
      groups.map((serviceGroup) => ({
        id: `shippo-fulfillment-${serviceGroup.object_id}`,
        is_group: true,
        ...serviceGroup,
      }))
    )
  }

  async #fulfillmentOptions() {
    return {
      carriers: await this.#fetchCarriers(),
      groups: await this.#fetchServiceGroups(),
    }
  }

  #setConfig(options) {
    if (Object.keys(options).length === 0) {
      const {
        configModule: { projectConfig },
      } = getConfigFile(path.resolve("."), "medusa-config")
      this.#options = projectConfig
    } else {
      this.#options = options
    }
    this.retrieveServiceOptions = this.#fulfillmentOptions
  }

  #setClient() {
    this.#client = this.#initClient()
  }

  #initClient() {
    return shippo(this.#options.api_key)
  }
}

export default ShippoClientService
