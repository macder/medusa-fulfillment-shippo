import { BaseService } from "medusa-interfaces"
import { productLineItem } from "../utils/formatters"

class ShippoPackageService extends BaseService {
  #cartService

  #client

  #fulfillmentService

  #items

  #boxes

  #orderService

  #shippoClient

  #shippoPacker

  constructor(
    {
      cartService,
      fulfillmentService,
      orderService,
      shippoClientService,
      shippoPackerService,
    },
    options
  ) {
    super()

    /** @private @const {CartService} */
    this.#cartService = cartService

    /** @private @const {FulfillmentService} */
    this.#fulfillmentService = fulfillmentService

    /** @private @const {OrderService} */
    this.#orderService = orderService

    /** @private @const {ShippoClientService} */
    this.#shippoClient = shippoClientService

    /** @private @const {ShippoPackerService_} */
    this.#shippoPacker = shippoPackerService

    this.#client = this.#shippoClient.useClient

    this.#boxes = null
  }

  static splitItem(item) {
    return [...Array(item.quantity).keys()].map(() => productLineItem(item))
  }

  /**
   * Fetches all custom parcel templates from shippo account
   * @return {Promise.<object[]>} list of custom parcel templates
   */
  async fetchUserTemplates() {
    const templates = await this.#client.userparceltemplates
      .list()
      .then((response) => response.results)

    return templates
  }

  /**
   *
   * @return {}
   */
  async fetchCarrierTemplates() {}

  /**
   *
   * @param {}
   * @return {}
   */
  async #pack() {
    const boxes =
      this.#boxes ?? this.#prepareBoxes(await this.fetchUserTemplates())
    const result = await this.#shippoPacker.packBins(boxes, this.#items)
    return result
  }

  /**
   *
   * @param {} cartOrId
   * @return {}
   */
  async packCart(cartOrId) {
    const cart = cartOrId?.items
      ? cartOrId
      : await this.#cartService.retrieve(cartOrId, {
          relations: ["items"],
        })

    this.#setItems(this.#prepareItems(cart.items))
    return this.#pack()
  }

  setBoxes(templates) {
    this.#boxes = this.#prepareBoxes(templates)
    return this.#boxes
  }

  #setItems(items) {
    this.#items = items.map(
      ({
        product_id,
        variant_id,
        product_title,
        length,
        width,
        height,
        weight,
      }) =>
        Object.freeze({
          product_id,
          variant_id,
          product_title,
          length,
          width,
          height,
          weight,
        })
    )
    return this.#items
  }

  /**
   *
   * @param {} id
   * @return {}
   */
  async packOrder(id) {}

  /**
   *
   * @param {} lineItems
   * @return {}
   */
  async packItems(lineItems) {
    this.#setItems(this.#prepareItems(lineItems))
    return this.#pack()
  }

  /**
   *
   * @param {} id
   * @return {}
   */
  async packFulfillment(id) {}

  #prepareBoxes(templates) {
    const boxes = templates.map(
      ({ id, object_id, name, length, width, height, weight }) =>
        Object.freeze({
          id: id || object_id,
          name,
          length,
          width,
          height,
          weight,
        })
    )
    return boxes
  }

  #prepareItems(lineItems) {
    const items = lineItems.flatMap((item) =>
      item.quantity > 1
        ? this.constructor.splitItem(item)
        : productLineItem(item)
    )
    return items
  }
}

export default ShippoPackageService
