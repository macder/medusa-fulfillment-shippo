export const defaultOrder = () => ({
  order_id: "order_default_id",
  cart_id: "cart_default_id",
  display_id: "93",
  claim_order_id: null,
  swap_id: null,
  fulfillments: [
    {
      id: "ful_default_id_1",
      shippo_order_id: "shippo_order_default_id_1",
      items: ["item_123", "item_321"],
    },
    {
      id: "ful_default_id_2",
      shippo_order_id: "shippo_order_default_id_2",
      items: ["item_11", "item_31"],
    },
  ],
  line_items: [
    {
      id: "item_default_id_1",
      product_id: "prod_default_id_1",
      variant_id: "variant_default_id_1",
    },
  ],
})
