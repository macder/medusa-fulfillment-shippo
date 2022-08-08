export const shippingProfileServiceMock = (config) => ({
  fetchCartOptions: jest.fn(async () => []),

  retrieve: jest.fn(async (id) => []),
})
