const ful_single_item = () => (shippo_order_id) => ({
  id: "ful_single_item",
  data: {
    shippo_order_id,
  },
  items: [
    {
      id: "item_01234567890",
      quantity: 1,
    },
  ],
})

const ful_multi_item = () => (shippo_order_id) => ({
  id: "ful_multi_item",
  data: {
    shippo_order_id,
  },
  items: [
    {
      id: "item_01234567890",
      quantity: 1,
    },
    {
      id: "item_09876543210",
      quantity: 2,
    },
  ],
})
