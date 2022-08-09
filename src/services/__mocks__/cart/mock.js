import { addressSchema } from "../address"
import { cartSchema } from "./schema"
import { lineItemMock } from "../line-item"

export const cartMock = (state) => (id) =>
  cartSchema({
    id,
    address: state.shipping_address
      ? addressSchema({})
      : addressSchema({ is_empty: true }),
    items: state.line_items.map(({ product_id, variant_id, id }) =>
      lineItemMock(state)({ id: product_id })({ id: variant_id })(id)
    ),
    email: state.email ? "test@test.com" : null,
  })
