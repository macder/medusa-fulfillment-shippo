import { retrieve } from "./crud"

const shippoOrderId = ({ data: { shippo_order_id } }) => shippo_order_id

/* @experimental */
const fulfillmentHelper = ({ fulfillmentService }) => {
  const retrieveFulfillment = retrieve(fulfillmentService)

  return {
    shippoId: async (ful_id) =>
      shippoOrderId(await retrieveFulfillment(ful_id)()),
  }
}

export default fulfillmentHelper
