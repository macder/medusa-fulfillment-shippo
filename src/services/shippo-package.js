import { BaseService } from "medusa-interfaces"
import { productLineItem } from "../utils/formatters"

class ShippoPackageService extends BaseService {
  #cartService

  #client

  #lineItemService

  #fulfillmentService

  #items

  #boxes

  #orderService

  #shippoClient

  #shippoPacker

  constructor(
    {
      cartService,
      lineItemService,
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

    /** @private @const {LineItemService} */
    this.#lineItemService = lineItemService

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

  /**
   *
   * @param {} id
   * @return {}
   */
  async packFulfillment(fulfillmentOrId) {
    const fulfillment = fulfillmentOrId?.items
      ? fulfillmentOrId
      : await this.#fulfillmentService.retrieve(fulfillmentOrId, {
          relations: ["items", "order"],
        })

    const lineItems = await Promise.all(
      fulfillment.items.map(
        async (item) =>
          await this.#lineItemService
            .retrieve(item.item_id)
            .then((lineItem) => {
              lineItem.quantity = lineItem.fulfilled_quantity
              return lineItem
            })
      )
    )

    this.#setItems(this.#prepareItems(lineItems))
    return this.#pack()
  }

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
  async packOrder(orderOrId) {
    const order = orderOrId?.items
      ? orderOrId
      : await this.#orderService.retrieve(orderOrId, {
          relations: ["items"],
        })

    this.#setItems(this.#prepareItems(order.items))
    return this.#pack()
  }

  setBoxes(templates) {
    this.#boxes = this.#prepareBoxes(templates)
    return this.#boxes
  }

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
}

export default ShippoPackageService
