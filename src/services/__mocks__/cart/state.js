const baseState = () => ({
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
      ...baseState(),
    },
    items_address: {
      ...baseState(),
      shipping_address: true,
    },
    items_email: {
      ...baseState(),
      email: true,
    },
    address: {
      ...baseState(),
      shipping_address: true,
      line_items: [],
    },
    address_email: {
      ...baseState(),
      shipping_address: true,
      email: true,
      line_items: [],
    },
    email: {
      ...baseState(),
      email: true,
      line_items: [],
    },
    items_address_email: {
      ...baseState(),
      shipping_address: true,
      email: true,
    },
    nothing: {
      ...baseState(),
      line_items: [],
      shipping_address: false,
      email: false, 
    }
  },
})
