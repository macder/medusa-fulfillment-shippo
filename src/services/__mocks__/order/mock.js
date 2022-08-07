import { orderSchema } from "./schema"
import { fulfillmentMock } from "../fulfillment"
import { lineItemMock } from "../line-item"

export const orderMock = (foreignKeys) => (id) =>
  orderSchema({
    id,
    ...foreignKeys,
    display_id: "11",
    fulfillments: foreignKeys.fulfillments.map(
      ({ id, items, shippo_order_id }) =>
        fulfillmentMock({ ...foreignKeys, shippo_order_id })(items)(id)
    ),
    items: foreignKeys.line_items.map(({ product_id, variant_id, id }) =>
      lineItemMock(foreignKeys)({ id: product_id })({ id: variant_id })(id)
    ),
  })
