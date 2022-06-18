import { shippoAddress, shippoLineItem, shippoRates } from "../../../utils/shippo"
import { MedusaError } from "medusa-core-utils"
import { Validator } from '../../../utils/validator'

export default async (req, res, next) => {
  const { cart_id } = req.params
  const cartService = req.scope.resolve("cartService")
  const totalsService = req.scope.resolve("totalsService")
  const shippingProfileService = req.scope.resolve("shippingProfileService")

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
  const validAddress = Validator.shippingAddress().validate(cart.shipping_address)
  if (validAddress.error) {
    return next(
      new MedusaError(
        MedusaError.Types.INVALID_DATA,
        validAddress.error.details[0].message
      )
    )
  }

  const shippingOptions = await shippingProfileService.fetchCartOptions(cart)

  const lineItems = await Promise.all(
    cart.items.map(async item => {
      const totals = await totalsService.getLineItemTotals(item, cart)
      return shippoLineItem(item, totals.subtotal, cart.region.currency_code)
    })
  )

  const toAddress = shippoAddress(cart.shipping_address, cart.email)

  const rates = await shippoRates(
    toAddress,
    lineItems,
    shippingOptions
  )

  res.json([...rates])
}
