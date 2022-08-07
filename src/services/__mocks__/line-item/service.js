import { lineItemMock } from "./mock"

export const lineItemServiceMock = (keys) => {
  const lineItem = (id) =>
    lineItemMock(keys)({ id: "product_id" })({ id: "variant_id" })(id)

  return {
    list: jest.fn(),
    retrieve: jest.fn(async (id) => lineItem(id)),
  }
}
