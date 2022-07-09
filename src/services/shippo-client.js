import { BaseService } from "medusa-interfaces"
import path from "path"
import { getConfigFile } from "medusa-core-utils"
import shippo from "shippo"

// import { mockTransaction } from "./__mocks__/data"

class ShippoClientService extends BaseService {
  constructor({}, options) {
    super()

    this.setConfig_(options)
    this.setClient_()

    this.retrieveFulfillmentOptions = this.composeFulfillmentOptions_
    this.createOrder = this.createOrder_
  }

  getClient() {
    return this.client_
  }

  async composeFulfillmentOptions_() {
    const shippingOptions = await this.fetchCarriers_().then((carriers) =>
      this.findActiveCarriers_(carriers).then((activeCarriers) =>
        this.splitCarriersToServices_(activeCarriers)
      )
    )
    const shippingOptionGroups = await this.fetchServiceGroups_()
    return [...shippingOptions, ...shippingOptionGroups]
  }

  async fetchCarriers_() {
    return await this.client_.carrieraccount
      .list({ service_levels: true, results: 100 })
      .then((response) => response.results)
  }

  async fetchServiceGroups_() {
    return await this.client_.servicegroups.list().then((groups) =>
      groups.map((serviceGroup) => ({
        id: `shippo-fulfillment-${serviceGroup.object_id}`,
        is_group: true,
        ...serviceGroup,
      }))
    )
  }

  async fetchCustomParcelTemplates() {
    return await this.client_.userparceltemplates
      .list()
      .then((response) => response.results)
  }

  async fetchOrderTransactions({ displayId }) {
    const urlQuery = `?q=${displayId}&expand[]=rate&expand[]=parcel`

    const client = async (urlQuery) => {
      return await this.client_.transaction.search(urlQuery)
    }

    const transactions = await this.poll_({
      fn: client,
      fnArgs: urlQuery,
      validate: (result) =>
        (result?.results[0]?.object_state === "VALID" &&
        result?.results[0]?.object_status === "SUCCESS"),
      interval: 3000,
      maxAttempts: 5,
    }).then((response) => response.results)
      .catch(e => {
        throw "shippo transactions for order not found"
      })

    return transactions
  }

  async fetchTransaction(id) {
    return await this.client_.transaction.retrieve(id)
  }

  async fetchCustomParcel(id) {
    return await this.client_.userparceltemplates.retrieve(id)
  }

  async fetchLiveRates({
    options,
    to_address,
    line_items,
    parcel_template_id,
  }) {
    return await this.client_.liverates
      .create({
        address_to: to_address,
        line_items: line_items,
        parcel: parcel_template_id,
      })
      .then((response) =>
        response.results.filter((item) =>
          options.find((option) => option.name === item.title && true)
        )
      )
  }

  async findActiveCarriers_(carriers) {
    return carriers.filter((carrier) => carrier.active)
  }

  async splitCarriersToServices_(carriers) {
    return carriers.flatMap((carrier) =>
      carrier.service_levels.map((service_type) => {
        const { service_levels, ...service } = {
          ...service_type,
          id: `shippo-fulfillment-${service_type.token}`,
          name: `${carrier.carrier_name} ${service_type.name}`,
          carrier_id: carrier.object_id,
          is_group: false,
          ...carrier,
        }
        return service
      })
    )
  }

  async createOrder_(order) {
    return await this.client_.order.create(order)
  }

  setConfig_(options) {
    if (Object.keys(options).length === 0) {
      const {
        configModule: { projectConfig },
      } = getConfigFile(path.resolve("."), "medusa-config")
      this.options_ = projectConfig
    } else {
      this.options_ = options
    }
  }

  setClient_() {
    this.client_ = shippo(this.options_.api_key)
  }

  async poll_({ fn, fnArgs, validate, interval, maxAttempts }) {
    let attempts = 0

    const executePoll = async (resolve, reject) => {
      const result = await fn(fnArgs)
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
}

export default ShippoClientService
