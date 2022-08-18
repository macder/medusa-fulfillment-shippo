import { MedusaError } from "medusa-core-utils"

const retrieveShippoId = (fulfillmentService) => async (id) => {
  const fulfillment = await fulfillmentService.retrieve(id)

  if (!fulfillment.data?.shippo_order_id) {
    return Promise.reject(
      new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Shippo order not found for fulfillment with id: ${fulfillment.id}`
      )
    )
  }

  const {
    data: { shippo_order_id },
  } = fulfillment

  return shippo_order_id
}

/* @experimental */
const fulfillmentHelper = ({ fulfillmentService }) => ({
  shippoId: retrieveShippoId(fulfillmentService),
})

export default fulfillmentHelper
