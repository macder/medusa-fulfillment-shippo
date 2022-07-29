import { makeArrayOf } from "./data-utils"

const fulfillmentItem = (...[fulfillment_id, item_id, quantity]) =>
  Object.freeze({
    fulfillment_id,
    item_id,
    quantity,
  })

const fulfillment = (id, getId) => (getItems, getTrackingLinks) =>
  Object.freeze({
    id,
    order_id: getId("order"),
    claim_order_id: getId("claim"),
    swap_id: getId("swap"),
    no_notification: false,
    provider_id: "shippo",
    tracking_numbers: [],
    data: {
      shippo_order_id: getId("shippo_order"),
    },
    shipped_at: "2022-07-27T14:55:50.745Z",
    canceled_at: null,
    metadata: {},
    idempotency_key: null,
    tracking_links: getTrackingLinks(),
    items: getItems(id),
  })

export const mockfulfillmentItem = (fulfillment_id, item_id, quantity = 1) =>
  fulfillmentItem(fulfillment_id, item_id, quantity)

export const mockFulfillment = ({ id, getId }) => fulfillment(id, getId)
