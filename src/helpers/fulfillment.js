const retrieveShippoId = (fulfillmentService) => async (id) => {
  const fulfillment = await fulfillmentService.retrieve(id)

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
