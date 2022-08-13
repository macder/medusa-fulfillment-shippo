import { cartStub } from "./stub"

export const cartServiceMock = (state) => ({
  retrieve: jest.fn(async (id) => cartStub(state)(id)),
})
