import { shippoAddress, shippoLineItem } from "../../../utils/shippo-old"
import { binPacker } from "../../../utils/bin-packer"
import { getRates } from "../../../utils/client"
import { validateShippingAddress } from "../../../utils/validator"
import { MedusaError } from "medusa-core-utils"

export default async (req, res, next) => {
  const { cart_id } = req.params
  const cartService = req.scope.resolve("cartService")
  const totalsService = req.scope.resolve("totalsService")
  const shippingProfileService = req.scope.resolve("shippingProfileService")
  const customShippingOptionService = req.scope.resolve(
    "customShippingOptionService"
  )
  const manager = req.scope.resolve("manager")
  const customShippingOptionRepository = req.scope.resolve(
    "customShippingOptionRepository"
  )
  const shippoFulfillmentService = req.scope.resolve("shippoFulfillmentService")

  const cart = await cartService.retrieve(cart_id, {
    relations: [
      "shipping_address",
      "items",
      "items.tax_lines",
      "items.variant",
      "items.variant.product",
      "discounts",
      "region",
    ],
  })

  const rates = await shippoFulfillmentService.fetchLiveRates(cart_id)

  console.log(rates)

  const shippingOptions = await shippingProfileService.fetchCartOptions(cart)

  const customShippingOptions = await customShippingOptionService
    .list({ cart_id })
    .then(async (cartCustomShippingOptions) => {
      if (cartCustomShippingOptions.length) {
        const customShippingOptionRepo = await manager.getCustomRepository(
          customShippingOptionRepository
        )

        await customShippingOptionRepo.remove(cartCustomShippingOptions)
      }

      return await Promise.all(
        shippingOptions.map(async (option) => {
          const optionRate = rates.find(
            (rate) => rate.title == option.data.name
          )

          const price = optionRate.amount_local || optionRate.amount

          return await customShippingOptionService.create(
            {
              cart_id,
              shipping_option_id: option.id,
              price: parseInt(parseFloat(price) * 100),
            },
            {
              metadata: {
                is_shippo_rate: true,
                // shippo_parcel: parcels[0],
                ...optionRate,
              },
            }
          )
        })
      )
    })

  // cartService.setMetadata(cart_id, "shippo_parcel", parcels[0])

  res.json({ customShippingOptions })
}
