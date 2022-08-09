const baseState = (order_number) => ({
  object_id: "shippo_order_default_id_1",
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
        tracking_number: "track_01234567890",
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
