import { addressSchema } from "../address"
import { orderSchema } from "./schema"
import { fulfillmentMock } from "../fulfillment"
import { lineItemMock } from "../line-item"

export const orderMock = ({ ...state }) =>
  orderSchema({
    ...state,
    id: state.order_id,
    shipping_address: addressSchema({}),
    fulfillments: state.fulfillments.map((ful) =>
      fulfillmentMock({ ...state, ...ful })
    ),
    items: state.line_items.map((item) => lineItemMock({ ...state, ...item })),
  })
