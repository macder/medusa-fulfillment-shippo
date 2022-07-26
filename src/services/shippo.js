import { BaseService } from "medusa-interfaces"
import ShippoFacade from "../facades"

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
    this.package = this.#package()
    this.packingslip = this.#packingslip()
    this.rates = this.#rates()
    this.track = this.#track()
    this.transaction = this.#transaction()

    this.is = ([entity, id], attr) => this.#selector([entity, id], ["is", attr])
    this.for = ([entity, id]) => this.#selector([entity, id], ["for"])

    this.find = (needle) => this.#find(needle)

    this.fulfillment = this.#fulfillment()
  }

  #selector([entity, id], [method, params]) {
    return this[entity][method]([entity, id], params)
  }

  #account() {
    return {
      address: async () => await this.#shippoClient.fetchSenderAddress(),
    }
  }

  /* @experimental */
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

  /* @experimental */
  #fulfillment() {
    const fetchBy = {
      transaction: async (id) =>
        await this.#shippoTransaction.findFulfillment(id),
    }

    return {
      fetchBy: async ([entity, id]) => await fetchBy[entity](id),
    }
  }

  #order(key) {
    const methods = {
      fetch: (id) => this.#shippoOrder.fetch(id),
      fetchBy: {
        fulfillment: (id) => this.#shippoOrder.fetchByFulfillmentId(id),
      },
      with: {
        fulfillment: (object_id) =>
          this.#shippoOrder.findFulfillment(object_id),
      },
      is: {
        replace: (id) => this.#shippoOrder.isReplace(id),
      },
    }
    return new ShippoFacade(methods)
  }

  #package() {
    const methods = {
      for: {
        items: (items) => this.#shippoPacker.packBins(items),
      },
    }

    return new ShippoFacade(methods)
  }

  #packingslip() {
    const methods = {
      fetch: (id) => this.#shippoOrder.fetchPackingSlip(id),
      fetchBy: {
        fulfillment: (id) =>
          this.#shippoOrder.fetchPackingSlipByFulfillmentId(id),
      },
      with: {
        fulfillment: (object_id) =>
          this.#shippoOrder.findFulfillment(object_id),
      },
    }
    return new ShippoFacade(methods)
  }

  #rates() {
    const methods = {
      for: {
        cart: (id) => this.#shippoRates.fetchCartRates(id),
      },
    }

    return new ShippoFacade(methods)
  }

  #track() {
    const methods = {
      fetch: (carrier, trackNum) => this.#shippoTrack.fetch(carrier, trackNum),
      fetchBy: {
        fulfillment: (id) => this.#shippoTrack.fetchByFulfillmentId(id),
      },
      with() {
        console.log("track.with")
      },
    }
    return new ShippoFacade(methods)
  }

  #transaction() {
    const methods = {
      fetch: (id, { variant = "default", type = variant } = "default") =>
        ({
          default: (id) => this.#shippoTransaction.fetch(id),
          extended: (id) => this.#shippoTransaction.fetchExtended(id),
        }[type](id)),
      fetchBy: {
        order: (id, { variant = "default", type = variant } = "default") =>
          ({
            default: (id) => this.#shippoTransaction.fetchByOrder(id),
            extended: (id) => this.#shippoTransaction.fetchExtendedByOrder(id),
          }[type](id)),

        fulfillment: (
          id,
          { variant = "default", type = variant } = "default"
        ) =>
          ({
            default: (id) => this.#shippoTransaction.fetchByFulfillment(id),
            extended: (id) =>
              this.#shippoTransaction.fetchExtendedByFulfillment(id),
          }[type](id)),
      },
      is: {
        return: (id) => this.#shippoTransaction.isReturn(id),
      },
    }
    return new ShippoFacade(methods)
  }
}

export default ShippoService
