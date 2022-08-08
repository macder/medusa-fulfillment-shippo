const baseState = (order_number) => ({
  object_id: "shippo_order_11",
  order_number,
  transactions: [],
})

export const shippoOrderState = ({ order_number }) => ({
  default: {
    ...baseState(order_number),
    transactions: [],
  },
  has_label: {
    ...baseState(order_number),
    transactions: [
      {
        object_id: "ta_label",
      },
    ],
  },
  has_return_label: {
    ...baseState(order_number),
    transactions: [
      {
        object_id: "ta_label",
      },
      {
        object_id: "ta_return_label",
      },
    ],
  },
})
