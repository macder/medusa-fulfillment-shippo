import { lineItemStub } from "./stub"

export const lineItemServiceMock = ({ ...state }) => ({
  list: jest.fn(),
  retrieve: jest.fn(async (id) =>
    lineItemStub(state)({ id: "product_id" })({ id: "variant_id" })(id)
  ),
})
