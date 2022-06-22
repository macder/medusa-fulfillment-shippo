import { getPackingSlip } from "../../../utils/client"

export default async (req, res) => {
  const fulfillmentService = req.scope.resolve("fulfillmentService")
  const { fulfillment_id } = req.params

  const shippoPackingSlip = await fulfillmentService
    .retrieve(fulfillment_id)
    .then(
      async (fulfillment) =>
        await getPackingSlip(fulfillment.data.shippo_order_id)
    )

  res.json({ shippoPackingSlip })
}
