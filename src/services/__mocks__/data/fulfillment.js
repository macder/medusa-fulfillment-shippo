import { makeArrayOf } from "./data-utils"

const fulfillmentItem = (props) =>
  Object.freeze({
    fulfillment_id: props.get("fulfillment_id"),
    item_id: props.get("item_id"),
    quantity: props.get("quantity"),
  })

const fulfillment = (props) => (items, trackingLinks) =>
  Object.freeze({
    id: props.get("id"),
    order_id: props.get("order_id"),
    claim_order_id: props.get("claim_id"),
    swap_id: props.get("swap_id"),
    no_notification: false,
    provider_id: "shippo",
    tracking_numbers: [],
    data: Object.freeze({
      shippo_order_id: props.get("shippo_order_id"),
    }),
    shipped_at: "",
    canceled_at: null,
    metadata: {},
    tracking_links: trackingLinks(),
    items: items(props),
  })

export const fulfillmentItemMock = (props) => fulfillmentItem(props)

export const fulfillmentMock = (props) => fulfillment(props)

export const fulfillmentItemArrayMock = (propMap) =>
  makeArrayOf((i) => {
    const props = new Map()
    props.set("fulfillment_id", propMap.get("id"))
    props.set("item_id", propMap.get("items")[i].id)
    props.set("quantity", propMap.get("items")[i].quantity)
    return fulfillmentItemMock(props)
  }, propMap.get("items").length)

export const fulfillmentArrayMock = (propMap) =>
  makeArrayOf((i) => {
    const props = new Map(Object.entries(propMap.get("fulfillments")[i]))
    propMap.get("setIds")(propMap, props)
    return fulfillmentMock(props)(
      fulfillmentItemArrayMock,
      () => []
    )
  }, propMap.get("fulfillments").length)
