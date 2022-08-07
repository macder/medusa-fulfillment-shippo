export const fulfillmentSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id,
    order_id: props.order_id,
    claim_order_id: props.claim_order_id,
    swap_id: props.swap_id,
    no_notification: false,
    provider_id: "shippo",
    tracking_numbers: [],
    data: Object.freeze({
      shippo_order_id: props.shippo_order_id,
    }),
    shipped_at: "",
    canceled_at: null,
    metadata: {},
    // tracking_links: trackingLinks(),
    items: props.items,
  })

export const fulfillmentItemSchema = ({ ...props }) =>
  Object.freeze({
    fulfillment_id: props.fulfillment_id,
    item_id: props.item_id,
    quantity: props?.quantity ?? 1,
  })
