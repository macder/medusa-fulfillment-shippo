import { shippoGetPackingSlip } from "../../../utils/shippo"

export default async (req, res) => {
  const fulfillmentService = req.scope.resolve("fulfillmentService")
  const { fulfillment_id } = req.params

  const shippoPackingSlip = await fulfillmentService
    .retrieve(fulfillment_id)
      .then(async fulfillment => 
        await shippoGetPackingSlip(fulfillment.data.shippo_order_id)
      ).catch(e => e)

  res.json({ shippoPackingSlip })
}
