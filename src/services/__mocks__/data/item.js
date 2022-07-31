import { variantProductMock } from "./variant"

const lineItem =
  ({ ...props }) =>
  (variant) =>
    Object.freeze({
      id: props.id ?? "item_11",
      cart_id: props.cart_id ?? "cart_11",
      order_id: props.order_id,
      swap_id: props.swap_id,
      claim_order_id: props.claim_id,
      title: props.variant?.product?.title ?? "Product Title",
      description: props.variant?.title ?? "Variant Title",
      variant_id: props.variant?.id ?? "variant_id_11",
      unit_price: 10000,
      quantity: props?.quantity ?? 1,
      variant: variant(props.variant),
    })

export const lineItemMock = (props) => lineItem(props)(variantProductMock)
