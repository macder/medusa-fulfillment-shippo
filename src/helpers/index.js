import errorHelper from "./error"
import fulfillmentHelper from "./fulfillment"

/* @experimental */
export default ({ fulfillmentService }) => ({
  fulfillment: {
    ...fulfillmentHelper({ fulfillmentService }),
    error: { ...errorHelper("fulfillment") },
  },
  shippo_order: {
    error: { ...errorHelper("shippo_order") },
  },
})
