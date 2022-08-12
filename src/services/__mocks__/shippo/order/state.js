const baseState = () => ({
  object_id: "shippo_order_default_id_1",
  order_number: "56",
  transactions: [],
})

export const shippoOrderState = ({ order_number = "56" }) => ({

  shippo_order_no_transactions: {
    object_id: "shippo_order_no_transactions",
    order_number,
    transactions: [],
  },

  shippo_order_has_transaction_for_label: {
    object_id: "shippo_order_has_transaction_for_label",
    order_number,
    transactions: [
      {
        object_id: "transaction_for_label",
        tracking_number: "track_01234567890",
      }
    ],
  },

  shippo_order_has_transaction_for_label_and_return_label: {
    object_id: "shippo_order_has_transaction_for_label_and_return_label",
    order_number,
    transactions: [
      {
        object_id: "transaction_for_label",
        tracking_number: "track_01234567890",
      },
      {
        object_id: "transaction_for_return_label",
        tracking_number: "track_09876543210",
      },
    ],
  },

  default: {
    ...baseState(),
    transactions: [],
  },
  has_label: {
    ...baseState(),
    transactions: [
      {
        object_id: "ta_label",
        tracking_number: "track_01234567890",
      },
    ],
  },
  has_return_label: {
    ...baseState(),
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
