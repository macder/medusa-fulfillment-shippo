export const orderSchema = ({ ...props }) =>
  Object.freeze({
    object: "order",
    id: props.id,
    display_id: props.display_id,
    cart_id: props.cart_id,
    shipping_address: props.shipping_address ?? {},
    fulfillments: props.fulfillments,
    claims: [],
    swaps: [],
    items: props.items,
    region: Object.freeze({
      currency_code: "usd",
    }),
    shipping_methods: [
      Object.freeze({
        shipping_option: Object.freeze({
          name: "Just best, more better",
        }),
      }),
    ],
    currency_code: "usd",
    shipping_total: 1793,
    tax_total: 899,
    subtotal: 7200,
    total: 9892,
    paid_total: 9892,
  })
