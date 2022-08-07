import { lineItemMock } from "./mock"

export const lineItemServiceMock = (state) => {
  const lineItem = (id) =>
    lineItemMock(state)({ id: "product_id" })({ id: "variant_id" })(id)

  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => lineItem(id)),
  }
}
