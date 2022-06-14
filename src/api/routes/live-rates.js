import shippo from "shippo"
import { shippoAddress, shippoLineItems } from "../../utils/shippo"
import { Validator } from '../../utils/validator'

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY

export default async (req, res) => {
  const { cart_id } = req.params
  const cartService = req.scope.resolve("cartService")
  const totalsService = req.scope.resolve("totalsService")
  const shippingProfileService = req.scope.resolve("shippingProfileService")

  const client = shippo(SHIPPO_API_KEY)

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
  const lineItems = await shippoLineItems(cart, totalsService)
  const toAddress = shippoAddress(cart.shipping_address, cart.email)

  const rates = await client.liverates.create({
    address_to: toAddress,
    line_items: lineItems
  }).then(
      response => response.results
        .filter(
          item => shippingOptions
            .find(
              option => (option.data.name === item.title) && true 
            )
        )
    )

  res.json([...rates])
}
