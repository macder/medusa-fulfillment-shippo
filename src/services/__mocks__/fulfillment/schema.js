export const fulfillmentSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id,
    order_id: props.order_id,
    claim_order_id: props.claim_order_id,
    swap_id: props.swap_id,
    no_notification: false,
    provider_id: "shippo",
    tracking_numbers: [],
    data: props.shippo_order_id
      ? Object.freeze({
          shippo_order_id: props.shippo_order_id,
        })
      : Object.freeze({}),
    shipped_at: "",
    canceled_at: null,
    metadata: Object.freeze({}),
    tracking_links: props?.tracking_links ?? [],
    items: props.items,
  })

export const fulfillmentItemSchema = ({ ...props }) =>
  Object.freeze({
    fulfillment_id: props.fulfillment_id,
    item_id: props.id,
    quantity: props?.quantity ?? 1,
    ...(props.item && { item: props.item }),
  })
