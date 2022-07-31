import {
  fulfillmentMock,
  fulfillmentItemMock,
  lineItemMock,
  makeArrayOf,
  orderMock,
} from "./data"

const defaultProps = (fn) =>
  fn({
    order: {
      id: "order_01234567890",
      display: "11",
    },
    cart: {
      id: "cart_01234567890",
    },
    claim: {
      id: null,
    },
    swap: {
      id: null,
    },
    line_items: [
      {
        id: "item_01234567890",
        quantity: 1,
        variant: {
          id: "variant_01234567890",
          title: "Variant 1 Title",
          product: {
            id: "prod_01234567890",
          },
        },
      },
      {
        id: "item_09876543210",
        quantity: 1,
        variant: {
          id: "variant_09876543210",
          title: "Variant 2 Title",
          product: {
            id: "prod_09876543210",
          },
        },
      },
    ],
    fulfillments: [
      {
        id: "ful_01234567890",
        data: {
          shippo_order_id: "shippo_order_1",
        },
        items: [
          {
            id: "item_01234567890",
            quantity: 1,
          },
          {
            id: "item_09876543210",
            quantity: 2,
          },
        ],
      },
    ],
  })

const propGetter = (props) => (key) => props[key]
const get = (key) => defaultProps(propGetter)(key)
const getId = (key) => get(key).id

const ids = {
  cart_id: getId("cart"),
  order_id: getId("order"),
  claim_id: getId("claim"),
  swap_id: getId("swap"),
}

const items = (props) =>
  makeArrayOf((i) => lineItemMock(props[i]), props.length)

const fulfillmentProps = (index) => ({
  ...ids,
  ...get("fulfillments")[index],
  items: get("fulfillments")[index].items.map((item) => ({
    fulfillment_id: get("fulfillments")[index].id,
    ...item,
  })),
})

const fulfillments = (propGetter) =>
  makeArrayOf(
    (i) =>
      fulfillmentMock(propGetter(i))((props) =>
        makeArrayOf((n) => fulfillmentItemMock(props[n]), props.length)
      ),
    get("fulfillments").length
  )

const orderProps = {
  ...get("order"),
  cart_id: getId("cart"),
  items: get("line_items"),
  fulfillments: get("fulfillments"),
}

const order = orderMock(orderProps)(() => fulfillments(fulfillmentProps), items)
