import path from "path"
import { getConfigFile, humanizeAmount } from "medusa-core-utils"

const { configModule } = getConfigFile(path.resolve("."), "medusa-config")
const { plugins } = configModule
const { options } = plugins.find(
  (e) => e.resolve === "medusa-fulfillment-shippo"
)

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

// TODO: move to client.js
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
  street3: address?.address_3,
  city: address.city,
  state: address.province,
  zip: address.postal_code,
  country: address.country_code.toUpperCase(),
  phone: address.phone,
  email: email,
  validate: address.country_code == "us" ?? true,
})

export const returnOptions = (shippingOptions) => shippingOptions
  .filter((e) => e.supports_return_labels)
  .map((e) => ({
    ...e,
    name: `${e.name} - Support return labels`,
    is_return: true,
  }))
