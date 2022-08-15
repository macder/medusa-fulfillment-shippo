import { shippingOptionStub } from "./stub"

export const shippingProfileServiceMock = ({ ...state }) => ({
  fetchCartOptions: jest.fn(async () =>
    state.shipping_options.map((so) => shippingOptionStub({ ...so })())
  ),

  retrieve: jest.fn(async (id) => []),
})
