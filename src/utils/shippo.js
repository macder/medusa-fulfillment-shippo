import { humanizeAmount, MedusaError } from "medusa-core-utils"

export const shippoLineItem = (item, price) => ({
  quantity: item.quantity,
  sku: item.variant.sku,
  title: item.variant.product.title,
  ...price,
  weight: item.variant.weight.toString(),
  // weight_unit: WEIGHT_UNIT_TYPE
})

export const shippoLineItems = async (cart, totalsService) => {
  return await Promise.all(
    cart.items.map(async item => {
      const totals = await totalsService.getLineItemTotals(
        item,
        cart,
        {
          include_tax: true,
          use_tax_lines: true,
        }
      )
      return {
        quantity: item.quantity,
        sku: item.variant.sku,
        title: item.variant.product.title,
        total_price: humanizeAmount(
            totals.subtotal,
            cart.region.currency_code
          ).toString(),
        currency: cart.region.currency_code.toUpperCase(),
        weight: item.variant.weight.toString(),
        weight_unit: 'g' // WEIGHT_UNIT_TYPE
      }
    })
  )
}

export const shippoAddress = (address, email) => ({
  name: `${address.first_name} ${address.last_name}`,
  company: address.company,
  street1: address.address_1,
  street2: address?.address_2,
  street3: address?.address_3,
  city: address.city,
  state: address.province,
  zip: address.postal_code,
  country: address.country_code.toUpperCase(), // iso2 country code
  phone: address.phone,
  email: email,
  validate: (address.country_code == 'us') ?? true
})

/** Calculates dimensional weight of LineItem
 * @param {object} item - cart LineItem
 * @return {int} - calculated dimensional weight
 */
export const itemDimensionalWeight = (item) => {
  const { height, width, length } = item.variant
  return height * width * length

}

/** Dimensional weight of each item in cart
 * @param {array} items - cart items array
 * @return {array} - calculated dimensional weight from each item
 */
export const cartDimensionalWeights = items => items.map(
  item => itemDimensionalWeight(item) * item.quantity
)

