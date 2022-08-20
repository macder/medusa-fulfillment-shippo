import { fulfillmentStub } from "./stub"

export const fulfillmentServiceMock = (state) => {
  const fulfillment = (id) =>
    fulfillmentStub({
      ...state,
      ...state.fulfillments.find((ful) => ful.id === id),
    })

  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => fulfillment(id)),
  }
}
