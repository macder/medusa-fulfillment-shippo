import path from "path"
import { getConfigFile } from "medusa-core-utils"
import shippo from "shippo"

const { configModule } = getConfigFile(path.resolve("."), "medusa-config")
const { plugins } = configModule
const { options } = plugins.find(
  (e) => e.resolve === "medusa-fulfillment-shippo"
)

const client = shippo(options.api_key)

export const shippoUserParcelTemplates = async () =>
  await client.userparceltemplates.list()

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

export const shippoGetOrder = async (shippoOrderID) =>
  await client.order.retrieve(shippoOrderID)

export const shippoGetPackingSlip = async (shippoOrderID) =>
  await client.order.packingslip(shippoOrderID)
