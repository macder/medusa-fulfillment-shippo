import { lineItemMock } from "./mock"

export const lineItemServiceMock = ({ ...state }) => ({
  list: jest.fn(),
  retrieve: jest.fn(async (id) =>
    lineItemMock(state)({ id: "product_id" })({ id: "variant_id" })(id)
  ),
})
