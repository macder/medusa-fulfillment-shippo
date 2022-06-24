import { getConfigFile, humanizeAmount } from "medusa-core-utils"

const { configModule } = getConfigFile(path.resolve("."), "medusa-config")
const { plugins } = configModule
const { options } = plugins.find(e => e.resolve === 'medusa-fulfillment-shippo')

const { projectConfig } = configModule
const options = projectConfig

/** Makes a flat product object from a LineItem
 * @param {LineItem} - LineItem object
 * @return {object} - flat product
 */
export const productLineItem = ({ variant: { product, ...variant } }) => ({
  product_title: product.title,
  variant_title: variant.title,
  weight: variant.weight ?? product.weight,
  length: variant.length ?? product.length,
  height: variant.height ?? product.height,
  width: variant.width ?? product.width,
  origin_country: variant.origin_country ?? product.origin_country,
  material: variant.material ?? product.material,
  sku: variant.sku,
  barcode: variant.barcode,
  ean: variant.ean,
  upc: variant.upc,
  hs_code: variant.hs_code ?? product.hs_code,
  mid_code: variant.mid_code ?? product.mid_code,
})

export const shippoLineItem = (lineItem, totalPrice, currency) => {
  const product = productLineItem(lineItem)

  return {
    title: product.product_title,
    variant_title: product.variant_title,
    quantity: lineItem.quantity,
    total_price: humanizeAmount(totalPrice, currency).toString(),
    currency: currency.toUpperCase(),
    sku: product.sku,
    weight: product.weight.toString(),
    weight_unit: options.weight_unit_type,
    manufacture_country: product.origin_country,
  }
}

/** Convert medusa address to shippo
 * @param {object} address - medusa address object
 * @param {string} email - mail address
 * @return {object} - shippo address object
 */
export const shippoAddress = (address, email) => ({
  name: `${address.first_name} ${address.last_name}`,
  company: address.company,
  street1: address.address_1,
  street2: address?.address_2,
  street3: address?.address_3 ?? "",
  city: address.city,
  state: address.province,
  zip: address.postal_code,
  country: address.country_code.toUpperCase(),
  phone: address.phone,
  email: email,
  validate: address.country_code == "us" ?? true,
})

export const shippoOrder = async (order, lineItems, parcel) => {
  const toAddress = shippoAddress(order.shipping_address, order.email)
  const currencyCode = order.currency_code.toUpperCase()
  const shippingOptionName = order.shipping_methods[0].shipping_option.name

  const totalWeight = lineItems
    .map((e) => e.weight * e.quantity)
    .reduce((sum, current) => sum + current, 0)

  return {
    order_number: order.display_id,
    order_status: "PAID",
    to_address: toAddress,
    placed_at: order.created_at,
    shipping_cost: humanizeAmount(order.shipping_total, currencyCode),
    shipping_cost_currency: currencyCode,
    shipping_method: `${shippingOptionName} - (${parcel.name}) - ${currencyCode}`,
    total_tax: humanizeAmount(order.tax_total, currencyCode),
    total_price: humanizeAmount(order.total, currencyCode),
    subtotal_price: humanizeAmount(order.subtotal, currencyCode),
    currency: currencyCode,
    line_items: lineItems,
    weight: totalWeight,
    weight_unit: options.weight_unit_type,
  }
}
