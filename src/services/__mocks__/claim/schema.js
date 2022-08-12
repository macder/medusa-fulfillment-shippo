export const claimSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id ?? "claim_01234567890",
    type: props.type ?? "replace",
    order_id: props.order_id,
    shipping_address_id: "addr_01234567890",
  })
