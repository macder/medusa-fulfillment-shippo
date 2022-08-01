export const fulfillmentTemplate = ({ ...props }) =>
  Object.freeze({
    id: props.id,
    order_id: props.order_id,
    claim_order_id: props.claim_id,
    swap_id: props.swap_id,
    no_notification: false,
    provider_id: "shippo",
    tracking_numbers: [],
    data: Object.freeze({
      shippo_order_id: props.shippo_order,
    }),
    shipped_at: "",
    canceled_at: null,
    metadata: {},
    // tracking_links: trackingLinks(),
    items: props.items,
  })

export const fulfillmentItemTemplate = ({ ...props }) =>
  Object.freeze({
    fulfillment_id: props.fulfillment_id,
    item_id: props.item_id,
    quantity: props?.quantity ?? 1,
  })
