import { fulfillmentMock } from "./mock"

export const fulfillmentServiceMock = (keys) => {
  const fulfillment = (id) => {
    const { fulfillments } = keys
    const { items, shippo_order_id } = fulfillments.find((ful) => ful.id === id)
    return fulfillmentMock({ ...keys, shippo_order_id })(items)(id)
  }

  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => fulfillment(id)),
  }
}
