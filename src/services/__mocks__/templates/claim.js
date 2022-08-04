export const claimTemplate = ({ ...props }) =>
  Object.freeze({
    id: props.id ?? "claim_11",
    fulfillment_status: props?.fulfillment_status ?? "fulfilled",
    type: props.type ?? "replace",
    order_id: props?.order_id ?? "order_11",
    additional_items: props?.additional_items ?? [],
    fulfillments: props?.fulfillments ?? [],
    claim_items: props?.claim_items ?? [],
  })
