import { retrieve } from "./crud"

const shippoOrderId = ({ data: { shippo_order_id } }) => shippo_order_id
const objOf = (key) => (val) => ({ [key]: val })
const relations = objOf("relations")
const withFulfillments = relations(["fulfillments"])

const entityFulfillments = (retriever) => async (id) =>
  retriever(id).then((res) =>
    res.fulfillments.filter((ful) => shippoOrderId(ful))
  )

/* @experimental */
const fulfillmentHelper = ({
  claimService: claim,
  fulfillmentService: fulfillment,
  orderService: order,
  swapService: swap,
}) => ({
  shippoId: async (ful_id) =>
    shippoOrderId(await retrieve(fulfillment)()(ful_id)),
  for: (entity) =>
    ({
      order: entityFulfillments(retrieve(order)(withFulfillments)),
      claim_order: entityFulfillments(retrieve(claim)(withFulfillments)),
      swap: entityFulfillments(retrieve(swap)(withFulfillments)),
    }[entity]),
})
export default fulfillmentHelper
