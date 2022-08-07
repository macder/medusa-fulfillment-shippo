import { fulfillmentMock } from "./mock"

export const fulfillmentServiceMock = (state) => {
  const fulfillment = (id) => {
    const { fulfillments } = state
    const { items, shippo_order_id } = fulfillments.find((ful) => ful.id === id)
    return fulfillmentMock({ ...state, shippo_order_id })(items)(id)
  }

  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => fulfillment(id)),
  }
}
