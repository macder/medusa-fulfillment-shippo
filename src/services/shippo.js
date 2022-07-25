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
    this.packer = this.#packer()
    this.packingslip = this.#packingslip()
    this.rates = this.#rates()
    this.track = this.#track()
    this.transaction = this.#transaction()

    this.is = this.#is

    this.find = (needle) => this.#find(needle)

    this.fulfillment = this.#fulfillment()
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

  #is(entity) {
    const methods = {
      type: ([entity, id], attr) =>
        ({
          transaction: {
            return: (id) => this.#shippoTransaction.isReturn(id),
          },
        }[entity][attr](id)),
    }
    return new ShippoFacade(methods).is(entity)
  }

  #order() {
    const methods = {
      fetch: (id) => this.#shippoOrder.fetch(id),
      fetchBy: {
        fulfillment: (id) => this.#shippoOrder.fetchByFulfillmentId(id),
      },
      with: {
        fulfillment: (object_id) =>
          this.#shippoOrder.findFulfillment(object_id),
      },
    }
    return new ShippoFacade(methods)
  }

  #packer() {
    return {
      pack: async (items) => await this.#shippoPacker.packBins(items),
    }
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
    return {
      cart: async (cart_id, option) =>
        this.#shippoRates.checkout(cart_id, option),
    }
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
      fetch: (id, { variant = "default" } = "default") =>
        ({
          default: (id) => this.#shippoTransaction.fetch(id),
          extended: (id) => this.#shippoTransaction.fetchExtended(id),
        }[variant](id)),
      fetchBy: {
        order: (id, { variant = "default" } = "default") =>
          ({
            default: (id) => this.#shippoTransaction.fetchByOrder(id),
            extended: (id) => this.#shippoTransaction.fetchExtendedByOrder(id),
          }[variant](id)),

        fulfillment: (id, { variant = "default" } = "default") =>
          ({
            default: (id) => this.#shippoTransaction.fetchByFulfillment(id),
            extended: (id) =>
              this.#shippoTransaction.fetchExtendedByFulfillment(id),
          }[variant](id)),
      },
    }
    return new ShippoFacade(methods)
  }
}

export default ShippoService
