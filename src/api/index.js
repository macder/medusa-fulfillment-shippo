import cors from "cors"
import { Router } from "express"
import { getConfigFile } from "medusa-core-utils"
import shippo from "shippo"
import { shippoAddress } from '../utils/shippo'
import { Validator } from '../utils/validator'

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

    // Validate if cart has a complete shipping address
    try {
      const validAddress = Validator.shippingAddress().validate(cart.shipping_address)
      if (validAddress.error) throw validAddress.error
    }
    catch (e) {
      res.json({
        type: 'ValidationError',
        message: `Shipping Address ${e.details[0].message}`,
      })
    }

    const shippingOptions = await shippingProfileService.fetchCartOptions(cart)
    const carriers = [...new Set(shippingOptions.map(e => e.data.carrier_id))]
    const toAddress = shippoAddress(cart.shipping_address, cart.email)

    const shippoShipment = await shippoClient.shipment.create({
      address_to: toAddress,
      address_from: SHIPPO_DEFAULT_SENDER_ADDRESS_ID,
      parcels: { // TODO replace placeholder with shippo parcel templates
        "length": "20",
        "width": "30",
        "height": "20",
        "distance_unit": "in",
        "weight": "1",
        "mass_unit": "lb"
      },
      carrier_accounts: carriers,
      async: false
    }).catch(e => res.json(e))

    const serviceLevelTokens = shippingOptions.map(e => e.data.token)
    const shippoRates = shippoShipment.rates.filter(
      e => serviceLevelTokens.includes(e.servicelevel.token)
    )

    const customShippingOptions = await customShippingOptionService.list({ cart_id: cart_id })
      .then(async r => {
        // check if cart already has custom shipping options
        if (r.length) {
          // cart has custom shipping options, if they are shippo_rated, update them
          // WIP
          return 'cart already has custom shipping options'

        } else {  // cart has no custom shipping options
          return await Promise.all(
            shippingOptions.map(async option => {
              const optionRate = shippoRates.find(rate => {
                return rate.servicelevel.token == option.data.token
              })

              return await customShippingOptionService.create({
                cart_id: cart_id,
                shipping_option_id: option.id,
                price: parseFloat(optionRate.amount) * 100
              })
            })).catch(e => ({ error: e }))
        }
      })

    res.json({
      customShippingOptions
    })
  })

  router.get("/shippo/live-rates/:cart_id", cors(corsOptions), async (req, res) => {
  })

  return router;
}
