import { addressSchema } from "../address"
import { orderSchema } from "./schema"
import { fulfillmentStub } from "../fulfillment"
import { lineItemStub } from "../line-item"

export const orderStub = ({ ...state }) =>
  orderSchema({
    ...state,
    id: state.order_id,
    shipping_address: addressSchema({}),
    fulfillments: state.fulfillments.map((ful) =>
      fulfillmentStub({ ...state, ...ful })
    ),
    items: state.line_items.map((item) => lineItemStub({ ...state, ...item })),
  })
