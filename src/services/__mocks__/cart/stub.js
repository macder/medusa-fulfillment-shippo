import { addressSchema } from "../address"
import { cartSchema } from "./schema"
import { lineItemStub } from "../line-item"

export const cartStub = ({ ...state }) =>
  cartSchema({
    ...state,
    id: state.cart_id,
    address: addressSchema({ ...state.address }),
    items: state.line_items.map((item) => lineItemStub({ ...state, ...item })),
  })
