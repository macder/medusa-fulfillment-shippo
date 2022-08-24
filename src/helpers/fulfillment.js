import { retrieve } from "./crud"

const objOf = (key) => (val) => ({ [key]: val })
const withRelated = (type) => objOf("relations")(type)

const shippoOrderId = ({ data: { shippo_order_id } }) => shippo_order_id

const fulfillments = (retriever) => async (id) =>
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
      order: fulfillments(retrieve(order)(withRelated(["fulfillments"]))),
      claim_order: fulfillments(retrieve(claim)(withRelated(["fulfillments"]))),
      swap: fulfillments(retrieve(swap)(withRelated(["fulfillments"]))),
    }[entity]),
})
export default fulfillmentHelper
