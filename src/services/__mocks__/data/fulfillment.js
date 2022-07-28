import { faker } from "@faker-js/faker"
import { makeArrayOf } from "./data-utils"

const fulfillment =
  ({
    id,
    order_id = null,
    claim_order_id = null,
    swap_id = null,
    tracking_links = [],
  }) =>
  ({ data, items }) => ({
    id,
    order_id,
    claim_order_id,
    swap_id,
    data,
    tracking_links,
    items,
  })

const fulfillmentData = ({ shippo_order_id }) => ({ shippo_order_id })

const fulfillmentItem = ({ id: fulfillment_id, item_id, quantity = 1 }) => ({
  fulfillment_id,
  item_id,
  quantity,
})

// const params = {
//   id: "ful_01234567890",
//   order_id: "order_01234567890",
//   shippo_order_id: "shippo_order_01234567890",
//   items: ["item_01234567890", "item_09876543210", "item_00000000001"],
// }

/**
 *
 * @param {Object} obj
 * @param {string} obj.id -
 * @param {string} obj.order_id -
 * @param {string} obj.shippo_order_id -
 * @param {Array} obj.items -
 */
export const mockFulfillment = ({ ...params }) =>
  fulfillment({ ...params })({
    data: fulfillmentData({
      ...params,
    }),
    items: makeArrayOf(
      (i) => fulfillmentItem({ ...params, item_id: params.items[i] }),
      params.items.length
    ),
  })

// const test = mockFulfillment(params)

// console.log(test)
