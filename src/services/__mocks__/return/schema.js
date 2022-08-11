export const returnSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id ?? "return_default",
    status: "requested",
    swap_id: props.swap_id ?? null,
    claim_order_id: props.swap_id ?? null,
    order_id: props.order_id ?? "order_default",
    shipping_data: null,
    items: [],
    shipping_method: {},
    swap: props.swap ?? null,
    claim_order: props.claim_order ?? null,
  })
