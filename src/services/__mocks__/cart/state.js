const baseCart = () => ({
  order_id: null,
  cart_id: "cart_default_id",
  claim_order_id: null,
  swap_id: null,

  line_items: [
    {
      id: "item_default_id_1",
      product_id: "prod_default_id_1",
      variant_id: "variant_default_id_1",
    },
  ],
})

export const cartState = () => ({
  has: {
    items: {
      ...baseCart(),
    },
    items_address: {
      ...baseCart(),
      shipping_address: true,
    },
    items_email: {
      ...baseCart(),
      email: true,
    },
    address: {
      ...baseCart(),
      shipping_address: true,
      line_items: [],
    },
    address_email: {
      ...baseCart(),
      shipping_address: true,
      email: true,
      line_items: [],
    },
    email: {
      ...baseCart(),
      email: true,
      line_items: [],
    },
    items_address_email: {
      ...baseCart(),
      shipping_address: true,
      email: true,
    },
  },
})
