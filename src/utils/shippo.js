import path from "path"
import { getConfigFile, humanizeAmount } from "medusa-core-utils"
import shippo from "shippo"
import { BP3D } from "binpackingjs"

const { configModule } = getConfigFile(path.resolve("."), "medusa-config")
const { plugins } = configModule
const { options } = plugins.find(e => e.resolve === 'medusa-fulfillment-shippo')

const client = shippo(options.api_key)

// TODO: move to client.js
export const shippoUserParcelTemplates = async () =>
  await client.userparceltemplates.list()

// TODO: move to client.js
/** Get shippo live rates for carts shipping options
 * @param {object} toAddress - shippo to_address object
 * @param {array} lineItems - array of cart item objects
 * @param {array} shippingOptions - array of shipping_option objects
 * @return {array} array filtered for cart of shippo live-rates objects
 */
export const shippoRates = async (
  toAddress,
  lineItems,
  shippingOptions,
  parcel
) => {
  const rates = await client.liverates
    .create({
      address_to: toAddress,
      line_items: lineItems,
      parcel: parcel,
    })
    .then((response) =>
      response.results.filter((item) =>
        shippingOptions.find(
          (option) => option.data.name === item.title && true
        )
      )
    )

  return rates
}

// TODO: move to client.js
export const shippoGetOrder = async (shippoOrderID) =>
  await client.order.retrieve(shippoOrderID)

// TODO: move to client.js
export const shippoGetPackingSlip = async (shippoOrderID) =>
  await client.order.packingslip(shippoOrderID)

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

/**
 * @param {string} id - a medusa ID
 * @return {string} - the type of ID, eg. order, ful, pay, etc
 */
export const getIDType = (id) => id.substr(0, id.indexOf("_"))

const splitItem = (item) => {
  const multiItem = []
  for (let i = 0; i < item.quantity; i++) {
    multiItem[i] = productLineItem(item)
  }
  return multiItem
}

// finds first best fit parcel
export const parcelFits = async (lineItems) => {
  const { Item, Bin, Packer } = BP3D

  const items = lineItems
    .flatMap((item) => {
      if (item.quantity > 1) {
        return splitItem(item)
      }
      return productLineItem(item)
    })
    .map(
      (item) =>
        new Item(
          item.product_title,
          item.width,
          item.height,
          item.length,
          item.weight
        )
    )

  const bins = await shippoUserParcelTemplates().then((response) =>
    response.results
      .map((box) => {
        box.dim_weight = box.length * box.width * box.height
        return box
      })
      .sort((a, b) => a.dim_weight - b.dim_weight)
      .map(
        (box) =>
          new Bin(box.object_id, box.width, box.height, box.length, box.weight)
      )
  )

  const fitParcels = []
  bins.forEach((bin, i) => {
    const packer = new Packer()
    packer.addBin(bin)

    items.forEach((item) => {
      packer.addItem(item)
    })

    packer.pack()

    if (packer.items.length === 0 && packer.unfitItems.length === 0) {
      fitParcels.push(packer.bins[0].name)
    }
  })

  return fitParcels
}
