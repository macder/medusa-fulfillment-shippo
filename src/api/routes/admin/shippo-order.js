import { shippoGetOrder } from "../../../utils/shippo"

export default async (req, res) => {
  const fulfillmentService = req.scope.resolve("fulfillmentService")
  const { fulfillment_id } = req.params

  const shippoOrder = await fulfillmentService.retrieve(fulfillment_id).then(
    async (fulfillment) =>
      await shippoGetOrder(fulfillment.data.shippo_order_id).then((response) =>
        Object.assign(response, {
          to_address: response.to_address.object_id,
          from_address: response.from_address?.object_id ?? null,
          object_owner: "secret",
        })
      )
  )
  res.json({ shippoOrder })
}
