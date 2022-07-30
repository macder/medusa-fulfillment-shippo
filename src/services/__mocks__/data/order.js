import { fulfillmentArrayMock } from "./fulfillment"
import { lineItemArrayMock } from "./item"

const order = (props) => (fulfillments, lineItems) =>
  Object.freeze({
    object: "order",
    id: props.get("order").id,
    display_id: props.get("order").display,
    cart_id: props.get("cart").id,
    shipping_address: {},
    fulfillments: fulfillments(props),
    claims: [],
    swaps: [],
    items: lineItems(props),
    shipping_total: 1793,
    tax_total: 899,
    subtotal: 7200,
    total: 9892,
    paid_total: 9892,
  })

export const orderMock = (props) =>
  order(props)(fulfillmentArrayMock, lineItemArrayMock)
