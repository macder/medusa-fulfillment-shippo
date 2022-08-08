const baseState = () => ({
  order_object_id: "shippo_order_11",
})

export const shippoTransactionState = ({ order_number }) => ({
  label: {
    ...baseState(),
    object_id: "ta_label",
    order_number,
    is_return: false,
  },
  return: {
    ...baseState(),
    object_id: "ta_return_label",
    order_number,
    is_return: true,
  },
})
