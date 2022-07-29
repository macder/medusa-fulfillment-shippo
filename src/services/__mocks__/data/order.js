import { faker } from "@faker-js/faker"
import { mockFulfillment, mockfulfillmentItem } from "./fulfillment"
import { mockLineItem } from "./item"
import { makeArrayOf } from "./data-utils"

const order = (getId) => (getFulfillments, getItems) =>
  Object.freeze({
    object: "order",
    id: getId("order"),
    display_id: getId("display"),
    cart_id: getId("cart"),
    shipping_address: {},
    fulfillments: getFulfillments(),
    claims: [],
    swaps: [],
    items: getItems(),
    shipping_total: 1793,
    tax_total: 899,
    subtotal: 7200,
    total: 9892,
    paid_total: 9892,
  })

const itemParams = [
  {
    item_id: "item_01234567890",
    quantity: 1,
  },
  {
    item_id: "item_09876543210",
    quantity: 2,
  },
]

const getId = (type) =>
  ({
    order: "order_01234567890",
    display: "11",
    cart: "cart_01234567890",
    claim: null,
    swap: null,
    shippo_order: "shippo_order_01234567890",
    items: itemParams.map(({ item_id }) => item_id),
    fulfillments: ["ful_01234567890"],
  }[type])

const getLineItems = () =>
  makeArrayOf(
    (i) =>
      mockLineItem({
        id: getId("items")[i],
        getId,
        quantity: itemParams[i].quantity,
      }),
    itemParams.length
  )

const getTrackingLinks = () => []

const getFulfillments = () =>
  makeArrayOf(
    (i) =>
      mockFulfillment({ id: getId("fulfillments")[i], getId })(
        (id) =>
          makeArrayOf(
            (n) =>
              mockfulfillmentItem(
                id,
                getId("items")[n],
                itemParams[n].quantity
              ),
            itemParams.length
          ),
        getTrackingLinks
      ),
    getId("fulfillments").length
  )

export const mockOrder = (getId) => order(getId)(getFulfillments, getLineItems)
