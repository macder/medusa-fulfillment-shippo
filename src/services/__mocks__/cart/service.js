import { cartMock } from "./mock"

export const cartServiceMock = (state) => {
  const cart = cartMock(state)

  return {
    retrieve: jest.fn(async (id) => cart(id)),
  }
}
