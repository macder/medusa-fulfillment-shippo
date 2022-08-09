import { orderMock } from "./mock"

export const orderServiceMock = (state) => {
  const order = orderMock(state)

  return {
    list: jest.fn(async ({ display_id }) => [order(state.order_id)]),
    retrieve: jest.fn(async (id) => order(id)),
  }
}
