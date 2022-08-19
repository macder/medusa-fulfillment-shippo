import errorHelper from "./error"
import fulfillmentHelper from "./fulfillment"

/* @experimental */
export default ({ fulfillmentService }) => ({
  fulfillment: {
    ...fulfillmentHelper({ fulfillmentService }),
    error: { ...errorHelper("fulfillment") },
  },
  error: (entity) => errorHelper(entity),
})
