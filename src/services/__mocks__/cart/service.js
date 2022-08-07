import { cartMock } from "./mock"

export const cartServiceMock = (state) => {
  const cart = (id) => cartMock(state)(id)

  return {
    retrieve: jest.fn(async (id) => cart(id)),
  }
}
