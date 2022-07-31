import { BaseService } from "medusa-interfaces"
import ShippoFacade from "../facades"

class ShippoService extends BaseService {
  #client

  #shippoClient

  #shippoOrder

  #shippoPackageService

  #shippoTrack

  #shippoTransaction

  #shippoRates

  constructor({
    shippoClientService,
    shippoOrderService,
    shippoPackageService,
    shippoRatesService,
    shippoTrackService,
    shippoTransactionService,
  }) {
    super()

    /** @private @const {ShippoClientService} */
    this.#shippoClient = shippoClientService

    /** @private @const {ShippoOrderService} */
    this.#shippoOrder = shippoOrderService

    /** @private @const {ShippoPackageService} */
    this.#shippoPackageService = shippoPackageService

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
      address: () => this.#shippoClient.fetchSenderAddress(),
    }
  }

  /* @experimental */
  #find(needle) {
    const find = {
      fulfillment: {
        for: {
          transaction: (id) => this.#shippoTransaction.findFulfillment(id),
        },
      },
      order: {
        for: {
          transaction: (id) => this.#shippoTransaction.findOrder(id),
        },
      },
    }

    return {
      for: ([haystack, id]) => find[needle].for[haystack](id),
    }
  }

  /* @experimental */
  #fulfillment() {
    const fetchBy = {
      transaction: (id) => this.#shippoTransaction.findFulfillment(id),
    }

    return {
      fetchBy: ([entity, id]) => fetchBy[entity](id),
    }
  }

  #order() {
    const methods = {
      fetch: (id) => this.#shippoOrder.fetch(id),
      fetchBy: {
        fulfillment: (id) => this.#shippoOrder.fetchByFulfillmentId(id),
        local_order: (id) => this.#shippoOrder.findBy("order_id", id),
        claim: (id) => this.#shippoOrder.findBy("claim_order_id", id),
        swap: (id) => this.#shippoOrder.findBy("swap_id", id),
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
        line_items: (lineItems) =>
          this.#shippoPackageService.packItems(lineItems),
        cart: (id) => this.#shippoPackageService.packCart(id),
        local_order: (id) => this.#shippoPackageService.packOrder(id),
        fulfillment: (id) => this.#shippoPackageService.packFulfillment(id),
      },
      set: {
        boxes: (bins) => this.#shippoPackageService.setBoxes(bins),
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
        local_order: (id) =>
          this.#shippoOrder.findPackingSlipBy("order_id", id),
        claim: (id) =>
          this.#shippoOrder.findPackingSlipBy("claim_order_id", id),
        swap: (id) => this.#shippoOrder.findPackingSlipBy("swap_id", id),
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
    }
    return new ShippoFacade(methods)
  }

  #transaction() {
    const methods = {
      fetch: (id, { variant = "default", type = variant } = "default") =>
        ({
          default: () => this.#shippoTransaction.fetch(id),
          extended: () => this.#shippoTransaction.fetchExtended(id),
        }[type](id)),
      fetchBy: {
        local_order: (
          id,
          { variant = "default", type = variant } = "default"
        ) =>
          ({
            default: () => this.#shippoTransaction.fetchByOrder(id),
            extended: () => this.#shippoTransaction.fetchExtendedByOrder(id),
          }[type](id)),

        fulfillment: (
          id,
          { variant = "default", type = variant } = "default"
        ) =>
          ({
            default: () => this.#shippoTransaction.fetchByFulfillment(id),
            extended: () =>
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
