import { BaseService } from "medusa-interfaces"

class ShippoService extends BaseService {
  #manager
  #shippoClient
  #shippoOrder
  #shippoPacker
  #shippoTrack
  #shippoTransaction
  #shippoRates

  constructor(
    {
      manager,
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

    /** @private @const {Manager} */
    this.#manager = manager

    /** @private @const {Shippo} */
    // this.#client = this.#shippo.useClient

    this.order = this.#order()
    this.packer = this.#packer()
    this.rates = this.#rates()
    this.track = this.#track()
    this.transaction = this.#transaction()
  }

  #order() {
    return {
      fetch: async (id) => await this.#shippoOrder.fetch(id),
      fetchBy: async ([entity, id]) =>
        await this.#shippoOrder.fetchBy([entity, id]),
    }
  }

  #packer() {
    return {
      pack: async (items) => await this.#shippoPacker.packBins(items)
    }
  }

  #rates() {
    return {
      cart: async (cart_id, option) => this.#shippoRates.checkout(cart_id, option)
    }
  }

  #track() {
    return {
      fetch: async (carrier, trackingNum) =>
        await this.#shippoTrack.fetch(carrier, trackingNum),
      fetchBy: async ([entity, id]) =>
        await this.#shippoTrack.fetchBy([entity, id]),
    }
  }

  #transaction() {
    return {
      fetch: async (id) => await this.#shippoTransaction.fetch(id),
      fetchExtended: async (id) => await this.#shippoTransaction.fetchExtended(id),
      isReturn: async (id) => await this.#shippoTransaction.isReturn(id)
    }
  }
}

export default ShippoService
