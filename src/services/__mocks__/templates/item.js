export const itemTemplate = ({ ...props }) =>
  Object.freeze({
    id: props.id,
    cart_id: props.cart_id,
    order_id: props.order_id,
    swap_id: props.swap_id,
    claim_order_id: props.claim_id,
    title: props.variant?.product?.title ?? "Product Title",
    description: props.variant?.title ?? "Variant Title",
    variant_id: props.variant?.id ?? "variant_id_11",
    quantity: props?.quantity ?? 1,
    variant: props.variant,
  })
