import { fulfillmentMock } from "./mock"

export const fulfillmentServiceMock = (state) => {
  const fulfillment = (id) => {
    const { fulfillments } = state
    const { items, shippo_order_id, tracking_links } = fulfillments.find(
      (ful) => ful.id === id
    )
    return fulfillmentMock({ ...state, shippo_order_id })(
      items,
      tracking_links
    )(id)
  }

  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => fulfillment(id)),
  }
}
