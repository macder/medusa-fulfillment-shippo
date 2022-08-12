import { orderMock } from "./mock"

export const orderServiceMock = (state) => ({
  list: jest.fn(async ({ display_id }) => [orderMock(state)]),
  retrieve: jest.fn(async (id) => orderMock(state)),
})
