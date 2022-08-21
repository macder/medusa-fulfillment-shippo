import { BaseService } from "medusa-interfaces"
import ShippoFacade from "../facades"

class ShippoService extends BaseService {
  #shippoClient

  #shippoOrder

  #shippoPackageService

  #shippoTrack

  #shippoTransaction

  constructor({
    shippoClientService,
    shippoOrderService,
    shippoPackageService,
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

    /** @private @const {ShippoTrackService} */
    this.#shippoTrack = shippoTrackService

    /** @private @const {ShippoTransactionService} */
    this.#shippoTransaction = shippoTransactionService

    this.account = this.#account()
    this.client = this.#shippoClient.getClient()
    this.order = this.#order()
    this.package = this.#package()
    this.packingslip = this.#packingslip()
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
        local_order: (id) => this.#shippoOrder.findBy("order", id),
        claim: (id) => this.#shippoOrder.findBy("claim_order", id),
        swap: (id) => this.#shippoOrder.findBy("swap", id),
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
        local_order: (id) => this.#shippoOrder.findPackingSlipBy("order", id),
        claim: (id) => this.#shippoOrder.findPackingSlipBy("claim_order", id),
        swap: (id) => this.#shippoOrder.findPackingSlipBy("swap", id),
      },
      with: {
        fulfillment: (object_id) =>
          this.#shippoOrder.findFulfillment(object_id),
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
      fetch: (id, { type = "default" } = "default") =>
        ({
          default: () => this.#shippoTransaction.fetch(id),
          extended: () => this.#shippoTransaction.fetchExtended(id),
        }[type](id)),
      fetchBy: {
        local_order: (id, { type = "default" } = "default") =>
          ({
            default: () => this.#shippoTransaction.fetchBy("order", id),
            extended: () =>
              this.#shippoTransaction.fetchExtendedBy("order", id),
          }[type](id)),
        claim: (id, { type = "default" } = "default") =>
          ({
            default: () => this.#shippoTransaction.fetchBy("claim_order", id),
            extended: () =>
              this.#shippoTransaction.fetchExtendedBy("claim_order", id),
          }[type](id)),
        swap: (id, { type = "default" } = "default") =>
          ({
            default: () => this.#shippoTransaction.fetchBy("swap", id),
            extended: () => this.#shippoTransaction.fetchExtendedBy("swap", id),
          }[type](id)),

        fulfillment: (id, { type = "default" } = "default") =>
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
