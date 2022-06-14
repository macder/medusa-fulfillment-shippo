import { Validator } from "medusa-core-utils"
import { shippoAddress, shippoLineItems, shippoRates } from "../../utils/shippo"

export default async (req, res) => {
  const { cart_id } = req.body
  const cartService = req.scope.resolve("cartService")
  const totalsService = req.scope.resolve("totalsService")
  const shippingProfileService = req.scope.resolve("shippingProfileService")
  const customShippingOptionService = req.scope.resolve("customShippingOptionService")
  const manager = req.scope.resolve("manager")
  const customShippingOptionRepository = req.scope.resolve("customShippingOptionRepository")

  const schema = Validator.object().keys({
    cart_id: Validator.string().required(),
  })

  try {
    const { value, error } = schema.validate(req.body)
    if (error) throw error
  }
  catch (e) {
    res.json({
      type: 'ValidationError',
      message: e.details[0].message,
    })
  }
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
  const rates = await shippoRates(toAddress, lineItems, shippingOptions)

  const customShippingOptions = await customShippingOptionService.list({ cart_id: cart_id })
    .then(async cartCustomShippingOptions => {

      if (cartCustomShippingOptions.length) {
        const customShippingOptionRepo = await manager.getCustomRepository(
          customShippingOptionRepository
        )

        await customShippingOptionRepo.remove(cartCustomShippingOptions)

      }
      return await Promise.all(
        shippingOptions.map(async option => {
          const optionRate = rates.find(
            rate => rate.title == option.data.name
          )

          const price = (optionRate.amount_local) || optionRate.amount

          return await customShippingOptionService.create({
            cart_id: cart_id,
            shipping_option_id: option.id,
            price: parseInt(parseFloat(price) * 100)
          },{
            metadata: {
              is_shippo_rate: true,
              ...optionRate
            }
          })

        })).catch(e => {
          console.error(e)
        })
    }).catch(e => ({ error: e }))

  res.json({ customShippingOptions })
}
