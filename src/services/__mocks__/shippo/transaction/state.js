const baseState = () => ({
  order_object_id: "shippo_order_default_id_1",
})

export const shippoTransactionState = ({ order_number }) => ({
  label: {
    ...baseState(),
    object_id: "ta_label",
    order_number,
    tracking_number: "track_01234567890",
    is_return: false,
  },
  return: {
    ...baseState(),
    object_id: "ta_return_label",
    order_number,
    tracking_number: "track_09876543210",
    is_return: true,
  },
})
