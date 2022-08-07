export const lineItemSchema = ({ ...props }) =>
  Object.freeze({
    id: props.id,
    cart_id: props.cart_id,
    order_id: props.order_id,
    swap_id: props.swap_id,
    claim_order_id: props.claim_order_id,
    title: props.title ?? "Product Title",
    description: props.description ?? "Variant Title",
    variant_id: props.variant_id ?? "variant_id_11",
    quantity: props?.quantity ?? 1,
    variant: props.variant,
  })
