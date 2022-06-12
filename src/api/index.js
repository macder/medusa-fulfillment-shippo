import cors from "cors"
import { Router } from "express"
import { getConfigFile, humanizeAmount } from "medusa-core-utils"
import shippo from "shippo"
import { shippoLineItem, shippoAddress } from '../utils/shippo'

export default (rootDirectory) => {
  const router = Router()

  const { configModule } = getConfigFile(rootDirectory, "medusa-config")
  const { projectConfig } = configModule

  // TODO: move into plugin options array
  const SHIPPO_API_KEY = projectConfig.shippo_api_key
  const SHIPPO_DEFAULT_SENDER_ADDRESS_ID = projectConfig.shippo_address_id

  const corsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  }
  const shippoClient = shippo(SHIPPO_API_KEY)

  router.get("/shippo/rates/:cart_id", cors(corsOptions), async (req, res) => {
    const { cart_id } = req.params
    const cartService = req.scope.resolve("cartService")
    const shippingProfileService = req.scope.resolve("shippingProfileService")
    const customShippingOptionService = req.scope.resolve("customShippingOptionService")

    const cart = await cartService.retrieve(cart_id, {
      relations: [
        "shipping_address",
        "items",
        "items.tax_lines",
        "items.variant",
        "items.variant.product",
        "discounts",
        "region"
      ]
    })

    const shippingOptions = await shippingProfileService.fetchCartOptions(cart)

    const carriers = [...new Set(shippingOptions.map(e => e.data.carrier_id))]

    const toAddress = shippoAddress(cart.shipping_address, cart.email)

    const shippoShipment = await shippoClient.shipment.create({
      address_to: toAddress,
      address_from: SHIPPO_DEFAULT_SENDER_ADDRESS_ID,
      parcels: { // TODO - use shippo parcel templates
        "length": "10",
        "width": "15",
        "height": "10",
        "distance_unit": "in",
        "weight": "1",
        "mass_unit": "lb"
      },
      carrier_accounts: carriers,
      async: false
    })

    const serviceLevelTokens = shippingOptions.map(e => e.data.token)
    const shippoRates = shippoShipment.rates.filter(
      e => serviceLevelTokens.includes(e.servicelevel.token)
    )

    shippingOptions.forEach(async option => {
      const optionRate = shippoRates.find(rate => {
        return rate.servicelevel.token == option.data.token
      })

      await customShippingOptionService.create({
        cart_id: cart_id,
        shipping_option_id: option.id,
        price: parseFloat(optionRate.amount) * 100
      })
    })

    // used for replacing addresses with their shippo object_id
    const shippoAddressIds = {
      address_from: shippoShipment.address_from.object_id,
      address_to: shippoShipment.address_to.object_id,
      address_return: shippoShipment.address_return.object_id,
    }

    res.json({
      shippo_response: {
        ...shippoShipment,
        ...shippoAddressIds
      }
    })
  })

  return router;
}