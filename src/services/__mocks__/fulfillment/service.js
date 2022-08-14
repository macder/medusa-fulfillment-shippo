import { fulfillmentStub } from "./stub"

export const fulfillmentServiceMock = (state) => {
  const fulfillment = (id) => {
    const { fulfillments } = state
    const fulfillment = fulfillments.find((ful) => ful.id === id)
    return fulfillmentStub({ ...state, ...fulfillment })
  }
  
  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => fulfillment(id)),
  }
}
