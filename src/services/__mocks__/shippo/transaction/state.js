const baseState = () => ({
  order_object_id: "shippo_order_default_id_1",
  order_number: "56",
})

export const shippoTransactionState = (key) =>
  ({
    label: {
      ...baseState(),
      object_id: "ta_label",
      tracking_number: "track_01234567890",
      is_return: false,
    },
    return: {
      ...baseState(),
      object_id: "ta_return_label",
      tracking_number: "track_09876543210",
      is_return: true,
    },

    transaction_for_label: {
      object_id: "transaction_for_label",
      order_number: 11,
      tracking_number: "track_01234567890",
      is_return: false,
    },

    transaction_for_return_label: {
      object_id: "transaction_for_return_label",
      order_number: 22,
      tracking_number: "track_09876543210",
      is_return: true,
    },
    get 11() {
      return [this.transaction_for_label]
    },
    get 22() {
      return [this.transaction_for_label, this.transaction_for_return_label]
    },
  }[key])
