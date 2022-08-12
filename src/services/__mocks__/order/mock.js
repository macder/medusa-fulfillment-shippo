import { addressSchema } from "../address"
import { orderSchema } from "./schema"
import { fulfillmentMock } from "../fulfillment"
import { lineItemMock } from "../line-item"

export const orderMock =
  ({ ...state }) =>
  (id) =>
    orderSchema({
      id,
      ...state,
      // display_id: "11",
      shipping_address: addressSchema({}),
      fulfillments: state.fulfillments.map(
        ({ id, items, shippo_order_id, tracking_links }) =>
          fulfillmentMock({ ...state, shippo_order_id })(items, tracking_links)(
            id
          )
      ),
      items: state.line_items.map(({ product_id, variant_id, id }) =>
        lineItemMock(state)({ id: product_id })({ id: variant_id })(id)
      ),
    })
