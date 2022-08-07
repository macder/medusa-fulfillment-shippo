import { orderMock } from "./mock"

export const orderServiceMock = (keys) => {
  const order = (id) => orderMock(keys)(id)

  return {
    list: jest.fn(async ({ display_id }) => [order(keys.order_id)]),
    retrieve: jest.fn(async (id) => order(id)),
  }
}
