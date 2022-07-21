import { BaseService } from "medusa-interfaces"
import path from "path"
import { getConfigFile, MedusaError } from "medusa-core-utils"
import shippo from "shippo"

class ShippoClientService extends BaseService {
  #client
  #fulfillmentService

  constructor({ fulfillmentService }, options) {
    super()

    /** @private @const {FulfillmentService} */
    this.#fulfillmentService = fulfillmentService

    this.#setConfig(options)
    this.#setClient()

    this.useClient = this.getClient()
    this.fetchExpandedTransactions = this.fetchExtendedTransactions
  }

  /**
   * @deprecated since 0.22.0 -
   *    use shippoService.transaction.fetch(id, { variant: "extended" })
   * @param {Order} order - order to get transactions for
   * @return {array.<Object>} list of transactions
   */
  async fetchExtendedTransactions(order) {
    console.log(
      "\x1b[33m warn\x1b[0m:    shippoClientService.fetchExtendedTransactions deprecated"
    )
    const urlQuery = `?q=${order.display_id}&expand[]=rate&expand[]=parcel`
    return await this.#client.transaction
      .search(urlQuery)
      .then((response) => response.results)
  }

  /**
   * @deprecated since 0.22.0 - use shippoService.order.fetchBy(["fulfillment", ful_id])
   * @param {string} fulfillmentId - fulfillment id for order
   * @return {Object} shippo order
   */
  async fetchOrder(fulfillmentId) {
    console.log(
      "\x1b[33m warn\x1b[0m:    shippoClientService.fetchOrder deprecated"
    )
    const shippoOrderId = await this.#retrieveShippoOrderId(fulfillmentId)
    return await this.#client.order.retrieve(shippoOrderId)
  }

  /**
   * @deprecated since 0.22.0 - use shippoService.packingslip.fetchBy(["fulfillment", ful_id])
   * @param {string} fulfillmentId - fulfillment id for packing slip
   * @return {Object} packing slip
   */
  async fetchPackingSlip(fulfillmentId) {
    console.log(
      "\x1b[33m warn\x1b[0m:    shippoClientService.fetchPackingSlip deprecated"
    )
    const shippoOrderId = await this.#retrieveShippoOrderId(fulfillmentId)
    return await this.#client.order.packingslip(shippoOrderId)
  }

  /**
   * Fetches the shippo account's default sender address
   * @return {Object} address object
   */
  async fetchSenderAddress() {
    return await this.#client.account
      .address()
      .then((response) =>
        response.results.find((address) => address.is_default_sender === true)
      )
  }

  /**
   * Fetches all custom parcel templates from shippo account
   * @return {array.<object>} list of custom parcel templates
   */
  async fetchUserParcelTemplates() {
    return await this.#client.userparceltemplates
      .list()
      .then((response) => response.results)
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
      attempts++

      if (validate(result)) {
        return resolve(result)
      } else if (maxAttempts && attempts === maxAttempts) {
        return reject("Exceeded max attempts")
      } else {
        setTimeout(executePoll, interval, resolve, reject)
      }
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
    return await this.#client.carrieraccount
      .list({ service_levels: true, results: 100 })
      .then((response) => response.results)
  }

  async #fetchServiceGroups() {
    return await this.#client.servicegroups.list().then((groups) =>
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

  async #retrieveShippoOrderId(fulfillmentId) {
    const fullfillment = await this.#fulfillmentService.retrieve(fulfillmentId)

    if (!fullfillment.data?.shippo_order_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Shippo order not found for fulfillment with id: ${fulfillmentId}`
      )
    }

    const {
      data: { shippo_order_id },
    } = fullfillment

    return shippo_order_id
  }

  #setConfig(options) {
    if (Object.keys(options).length === 0) {
      const {
        configModule: { projectConfig },
      } = getConfigFile(path.resolve("."), "medusa-config")
      this.options_ = projectConfig
    } else {
      this.options_ = options
    }
    this.retrieveServiceOptions = this.#fulfillmentOptions
  }

  #setClient() {
    this.#client = this.#initClient()
  }

  #initClient() {
    return shippo(this.options_.api_key)
  }
}

export default ShippoClientService
