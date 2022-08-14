import { orderStub } from "./stub"

export const orderServiceMock = (state) => ({
  list: jest.fn(async ({ display_id }) => [orderStub(state)]),
  retrieve: jest.fn(async (id) => orderStub(state)),
})
