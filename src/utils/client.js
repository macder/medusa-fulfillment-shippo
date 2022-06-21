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

export const getShippingOptions = async () => await client.carrieraccount
  .list({ service_levels: true, results: 100 })
  .then((r) =>
    r.results
      .filter((e) => e.active)
      .flatMap((item) =>
        item.service_levels.map((e) => {
          const { service_levels, ...shippingOption } = {
            ...e,
            id: `shippo-fulfillment-${e.token}`,
            name: `${item.carrier_name} ${e.name}`,
            carrier_id: item.object_id,
            is_group: false,
            ...item,
          }
          return shippingOption
        })
      )
  )
  .catch((e) => {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
  })

export const getShippingOptionGroups = async () => await client.servicegroups
  .list()
  .then((response) =>
    response.map((e) => ({
      id: `shippo-fulfillment-${e.object_id}`,
      is_group: true,
      ...e,
    }))
  )
  .catch((e) => {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, e)
  })


export const shippoGetOrder = async (shippoOrderID) =>
  await client.order.retrieve(shippoOrderID)

export const shippoGetPackingSlip = async (shippoOrderID) =>
  await client.order.packingslip(shippoOrderID)
