const fulfillmentItem = ({ ...props }) =>
  Object.freeze({
    fulfillment_id: props.fulfillment_id,
    item_id: props.id,
    quantity: props.quantity,
  })

const fulfillment =
  ({ ...props }) =>
  (items, trackingLinks = null) =>
    Object.freeze({
      id: props.id,
      order_id: props.order_id,
      claim_order_id: props.claim_id,
      swap_id: props.swap_id,
      no_notification: false,
      provider_id: "shippo",
      tracking_numbers: [],
      data: props.data,
      shipped_at: "",
      canceled_at: null,
      metadata: {},
      // tracking_links: trackingLinks(),
      items: items(props.items),
    })

export const fulfillmentItemMock = (props) => fulfillmentItem(props)

export const fulfillmentMock = (props) => fulfillment(props)
