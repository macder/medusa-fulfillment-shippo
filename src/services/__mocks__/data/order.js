import { faker } from "@faker-js/faker"
import { mockFulfillment } from "./fulfillment"
import { mockLineItem } from "./item"
import { makeArrayOf } from "./data-utils"

const order =
  ({ id, cart_id, display_id }) =>
  ({ fulfillments, items }) => {
    const item = {
      order_id: id,
      title: faker.commerce.productName(),
      variant_id: `variant_${faker.database.mongodbObjectId()}`,
      product_id: `prod_${faker.database.mongodbObjectId()}`,
      variant_title: faker.commerce.productMaterial(),
      description: faker.commerce.productDescription(),
    }

    return {
      object: "order",
      id,
      shipping_address: {},
      fulfillments: makeArrayOf(
        (i) =>
          mockFulfillment({
            id: fulfillments[i].id,
            order_id: id,
            items,
            ...fulfillments[i],
          }),
        fulfillments.length
      ),
      claims: [],
      swaps: [],
      items: makeArrayOf(
        (i) => mockLineItem({ id: items[i], ...item }),
        items.length
      ),
      display_id,
      cart_id,
      shipping_total: 1793,
      tax_total: 899,
      subtotal: 7200,
      total: 9892,
      paid_total: 9892,
    }
  }

// const params = {
//   id: "order_01234567890",
//   display_id: "210",
//   cart_id: `cart_${faker.database.mongodbObjectId()}`,
//   items: ["item_01234567890", "item_09876543210"],
//   fulfillments: [
//     {
//       id: "ful_00000000001",
//       shippo_order_id: "shippo_order_01234567890",
//     },
//   ],
// }

export const mockOrder = ({ ...params }) => order({ ...params })({ ...params })

export const fnOrderMock = ({ ...params }) => order({ ...params })

// const test = mockOrder(params)
// console.log('*********test: ', JSON.stringify(test, null, 2))
