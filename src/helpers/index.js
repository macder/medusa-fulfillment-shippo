import errorHelper from "./error"
import fulfillmentHelper from "./fulfillment"

const storeState = () => {
  let currentState = {}
  return (stateChangeFunction = (state) => state) => {
    const newState = stateChangeFunction(currentState)
    currentState = { ...newState }
    return newState
  }
}

const changeState = (prop) => (value) => (state) => ({
  ...state,
  [prop]: value,
})

const stateControl = storeState()

/* @experimental */
export default (container) => {
  const services = {
    claimService: container.resolve("claimService"),
    fulfillmentService: container.resolve("fulfillmentService"),
    orderService: container.resolve("orderService"),
    swapService: container.resolve("swapService"),
  }
  const helpers = changeState("helpers")({
    fulfillment: {
      ...fulfillmentHelper({
        ...services,
      }),
    },
    error: (entity) => errorHelper(entity),
  })

  stateControl(helpers)
}

export { stateControl as shippoHelper }
