import errorHelper from "./error"
import fulfillmentHelper from "./fulfillment"

/* @experimental */
export default ({ fulfillmentService }) => ({
  fulfillment: {
    ...fulfillmentHelper({ fulfillmentService }),
    errors: { ...errorHelper("fulfillment") },
  },
})
