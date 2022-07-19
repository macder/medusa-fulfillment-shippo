import { FulfillmentService } from "medusa-interfaces"
import path from "path"
import { getConfigFile, MedusaError } from "medusa-core-utils"
import { shippoLineItem, shippoOrder } from "../utils/formatters"

class ShippoFulfillmentService extends FulfillmentService {
  static identifier = "shippo"

  #eventBusService
  #orderService
  #shippo
  #shippoOrderService
  #shippoPackerService
  #shippoRatesService
  #shippoTransactionService
  #totalsService

  constructor(
    {
      eventBusService,
      orderService,
      shippoClientService,
      shippoOrderService,
      shippoPackerService,
      shippoRatesService,
      shippoTransactionService,
      totalsService,
    },
    options
  ) {
    super()

    this.#setConfig(options)

    /** @private @const {EventBusService} */
    this.#eventBusService = eventBusService

    /** @private @const {OrderService} */
    this.#orderService = orderService

    /** @private @const {ShippoClientService} */
    this.#shippo = shippoClientService

    /** @private @const {ShippoPackerService} */
    this.#shippoPackerService = shippoPackerService

    /** @private @const {ShippoRatesService} */
    this.#shippoRatesService = shippoRatesService

    /** @private @const {ShippoTransactionService} */
    this.#shippoTransactionService = shippoTransactionService

    /** @private @const {TotalsService} */
    this.#totalsService = totalsService
  }

  async calculatePrice(fulfillmentOption, fulfillmentData, cart) {
    const rate = await this.#shippoRatesService.fetchOptionRate(
      cart.id,
      fulfillmentOption
    )

    return this.#shippoRatesService.getPrice(rate)
  }

  async canCalculate(data) {
    return data.type === "LIVE_RATE"
  }

  async cancelFulfillment(fulfillment) {
    return Promise.resolve({})
  }

  async createFulfillment(
    methodData,
    fulfillmentItems,
    fromOrder,
    fulfillment
  ) {
    const fromAddress = await this.#shippo.fetchSenderAddress()

    const lineItems = await this.#formatLineItems(fulfillmentItems, fromOrder)
    lineItems.forEach((item) => {
      if (item.quantity < 1) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${item.title} quantity: ${item.quantity}`
        )
      }
    })
    const parcelName = methodData?.parcel_template?.name ?? null

    const shippoOrder = await this.#createShippoOrder(
      fromOrder,
      fromAddress,
      lineItems,
      parcelName
    ).then(async (response) => {
      const eventType = await this.#eventType(fulfillment)

      this.#eventBusService.emit(eventType, {
        order_id: fromOrder.id,
        fulfillment_id: fulfillment.id,
        customer_id: fromOrder.customer_id,
        shippo_order: response,
      })
      return response
    })

    return {
      shippo_order_id: shippoOrder.object_id,
    }
  }

  async createReturn(returnOrder) {
    const orderId =
      returnOrder?.swap?.order_id ||
      returnOrder?.claim_order?.order_id ||
      returnOrder.order_id

    const order = await this.#orderService.retrieve(orderId, {
      relations: ["fulfillments"],
    })

    const returnLabel = await this.#shippoTransactionService
      .fetchReturnByOrder(order)
      .catch((e) => {
        console.log(e)
      })

    const eventType = await this.#eventType(returnOrder)

    this.#eventBusService.emit(eventType, {
      order: returnOrder,
      transaction: returnLabel || null,
    })

    if (returnLabel) {
      const { rate, tracking_url_provider, tracking_number, label_url } =
        returnLabel

      return {
        rate,
        label_url,
        tracking_url_provider,
        tracking_number,
      }
    }
    return {}
  }

  async getFulfillmentOptions() {
    const fulfillmentOptions = await this.#shippo
      .retrieveServiceOptions()
      .then(async ({ carriers, groups }) => {
        const options = await this.#findActiveCarriers(carriers).then(
          (activeCarriers) => this.#splitCarriersToServices(activeCarriers)
        )
        return [...options, ...groups]
      })
    const returnOptions = this.#makeReturnOptions(fulfillmentOptions)
    return fulfillmentOptions.concat(returnOptions)
  }

  async validateFulfillmentData(optionData, data, cart) {
    if (optionData.is_return || !cart?.id) {
      return { ...data }
    }

    const parcel = await this.#shippoPackerService
      .packBins(cart.items)
      .then((packed) => ({
        id: packed[0].object_id,
        name: packed[0].name,
      }))

    return {
      ...data,
      parcel_template: parcel,
    }
  }

  async validateOption(data) {
    return true
  }

  async verifyHookSecret(token) {
    return this.options_.webhook_secret
      ? this.options_.webhook_secret === token
      : false
  }

  async #createShippoOrder(order, fromAddress, lineItems, parcelName) {
    const client = this.#shippo.getClient()
    const params = await shippoOrder(order, fromAddress, lineItems, parcelName)

    return await client.order.create(params).catch((e) => {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
    })
  }

  async #eventType(orderOrFulfill) {
    if (orderOrFulfill?.provider_id) {
      const fulfillment = orderOrFulfill

      return fulfillment.claim_order_id
        ? "shippo.replace_order_created"
        : "shippo.order_created"
    }

    const order = orderOrFulfill

    if (!order.swap_id && !order.claim_order_id) {
      return "shippo.return_requested"
    } else if (order.swap_id) {
      return "shippo.swap_created"
    } else if (order.claim_order_id) {
      const { claim_order } = order
      return `shippo.claim_${claim_order.type}_created`
    }
  }

  async #findActiveCarriers(carriers) {
    return carriers.filter((carrier) => carrier.active)
  }

  async #formatLineItems(items, order) {
    if (order?.is_claim) {
      order = await this.#orderService.retrieve(order.order.id, {
        relations: [
          "region",
          "payments",
          "items",
          "discounts",
          "discounts.rule",
        ],
      })
    }

    return await Promise.all(
      items.map(
        async (item) =>
          await this.#totalsService
            .getLineItemTotals(item, order)
            .then((totals) =>
              shippoLineItem(
                item,
                totals.unit_price,
                order.region.currency_code
              )
            )
      )
    )
  }

  #makeReturnOptions(fulfillmentOptions) {
    return fulfillmentOptions
      .filter((option) => !option?.is_group)
      .map((option) => {
        return {
          ...option,
          is_return: true,
        }
      })
  }

  async #splitCarriersToServices(carriers) {
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

  #setConfig(options) {
    if (Object.keys(options).length === 0) {
      const {
        configModule: { projectConfig },
      } = getConfigFile(path.resolve("."), "medusa-config")
      this.options_ = projectConfig
    } else {
      this.options_ = options
    }
  }

  getWebhookConfig() {
    const { webhook_secret, webhook_test_mode } = this.options_

    return {
      webhook_secret,
      webhook_test_mode,
    }
  }
}

export default ShippoFulfillmentService
