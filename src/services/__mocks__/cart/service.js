import { cartMock } from "./mock"

export const cartServiceMock = (state) => ({
  retrieve: jest.fn(async (id) => cartMock(state)(id)),
})
