import { BaseService } from "medusa-interfaces"

class ShippoService extends BaseService {
  #client

  #shippoClient

  #shippoOrder

  #shippoPacker

  #shippoTrack

  #shippoTransaction

  #shippoRates

  constructor(
    {
      shippoClientService,
      shippoOrderService,
      shippoPackerService,
      shippoRatesService,
      shippoTrackService,
      shippoTransactionService,
    },
    options
  ) {
    super()

    /** @private @const {ShippoClientService} */
    this.#shippoClient = shippoClientService

    /** @private @const {ShippoOrderService} */
    this.#shippoOrder = shippoOrderService

    /** @private @const {ShippoPackerService} */
    this.#shippoPacker = shippoPackerService

    /** @private @const {ShippoRatesService} */
    this.#shippoRates = shippoRatesService

    /** @private @const {ShippoTrackService} */
    this.#shippoTrack = shippoTrackService

    /** @private @const {ShippoTransactionService} */
    this.#shippoTransaction = shippoTransactionService

    this.#client = this.#shippoClient.getClient()

    this.account = this.#account()
    this.client = this.#shippoClient.getClient()
    this.order = this.#order()
    this.packer = this.#packer()
    this.packingslip = this.#packingslip()
    this.rates = this.#rates()
    this.track = this.#track()
    this.transaction = this.#transaction()

    this.find = (needle) => this.#find(needle)

    this.fulfillment = this.#fulfillment()
  }

  #account() {
    return {
      address: async () => await this.#shippoClient.fetchSenderAddress(),
    }
  }

  #find(needle) {
    const find = {
      fulfillment: {
        for: {
          transaction: async (id) =>
            await this.#shippoTransaction.findFulfillment(id),
        },
      },
      order: {
        for: {
          transaction: async (id) =>
            await this.#shippoTransaction.findOrder(id),
        },
      },
    }

    return {
      for: async ([haystack, id]) => await find[needle].for[haystack](id),
    }
  }

  #fulfillment() {
    const fetchBy = {
      transaction: async (id) =>
        await this.#shippoTransaction.findFulfillment(id),
    }

    return {
      fetchBy: async ([entity, id]) => await fetchBy[entity](id),
    }
  }

  #order() {
    const fetchBy = {
      fulfillment: async (id) =>
        await this.#shippoOrder.fetchByFulfillmentId(id),
    }

    return {
      fetch: async (id) => await this.#shippoOrder.fetch(id),
      fetchBy: async ([entity, id]) => await fetchBy[entity](id),
    }
  }

  #packer() {
    return {
      pack: async (items) => await this.#shippoPacker.packBins(items),
    }
  }

  #packingslip() {
    const fetchBy = {
      fulfillment: async (id) =>
        await this.#shippoOrder.fetchPackingSlipByFulfillmentId(id),
    }

    return {
      fetch: async (id) => await this.#shippoOrder.fetchPackingSlip(id),
      fetchBy: async ([entity, id]) => await fetchBy[entity](id),
    }
  }

  #rates() {
    return {
      cart: async (cart_id, option) =>
        this.#shippoRates.checkout(cart_id, option),
    }
  }

  #track() {
    const fetchBy = {
      fulfillment: async (id) =>
        await this.#shippoTrack.fetchByFulfillmentId(id),
    }

    return {
      fetch: async (carrier, trackingNum) =>
        await this.#shippoTrack.fetch(carrier, trackingNum),
      fetchBy: async ([entity, id]) => await fetchBy[entity](id),
    }
  }

  #transaction() {
    const fetch = {
      default: async (id) => await this.#shippoTransaction.fetch(id),
      extended: async (id) => await this.#shippoTransaction.fetchExtended(id),
    }

    const fetchBy = {
      order: {
        default: async (id) => await this.#shippoTransaction.fetchByOrder(id),
        extended: async (id) =>
          await this.#shippoTransaction.fetchExtendedByOrder(id),
      },
      fulfillment: {
        default: async (id) =>
          await this.#shippoTransaction.fetchByFulfillment(id),
        extended: async (id) =>
          await this.#shippoTransaction.fetchExtendedByFulfillment(id),
      },
    }

    return {
      fetch: async (id, { variant = "default" } = "default") =>
        await fetch[variant](id),
      fetchBy: async ([entity, id], { variant = "default" } = "default") =>
        await fetchBy[entity][variant](id),
      isReturn: async (id) => await this.#shippoTransaction.isReturn(id),

      /* @deprecated */
      fetchExtended: async (id) =>
        await this.#shippoTransaction.fetchExtended(id),
    }
  }
}

export default ShippoService
