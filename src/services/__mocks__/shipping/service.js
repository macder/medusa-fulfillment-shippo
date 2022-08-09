import { shippingOptionMock } from "./mock"

export const shippingProfileServiceMock = ({ ...state }) => ({
  fetchCartOptions: jest.fn(async () =>
    state.shipping_options.map((so) => shippingOptionMock({ ...so })())
  ),

  retrieve: jest.fn(async (id) => []),
})
